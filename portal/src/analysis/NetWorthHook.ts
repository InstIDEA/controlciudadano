import {DeclarationData, NetWorthIncreaseAnalysis, NWAnalysisAvailableYear} from "../APIModel";
import {useCallback, useMemo, useState} from "react";
import {debounce} from "lodash";
import {SimpleApi} from "../SimpleApi";
import {message} from "antd";
import {AmountWithSource, FinancialDetail} from "../../../api/src/APIModel";

export interface NetWorthCalculations {
    earnings: number;
    totalIncome: number;
    forInversion: number;
    variation: number;
    result: number;
    nextYearEarnings: number;
    nextYearForInversion: number;
}

/**
 * All the business logic related to this analysis should be keep here.
 * @param base the base data for the analysis
 */
export function useNWHook(base: NetWorthIncreaseAnalysis) {

    const [data, setData] = useState<NetWorthIncreaseAnalysis>(() => ({
        ...base,
        firstYear: calcTotals(base.firstYear),
        lastYear: calcTotals(base.lastYear)
    }));
    const [working, setWorking] = useState<boolean>(false);

    // eslint-disable-next-line
    const setYearData = useCallback(debounce((newData: DeclarationData) => {
        setData(d => ({
            ...d,
            firstYear: newData.year === d.firstYear.year ? calcTotals(newData) : d.firstYear,
            lastYear: newData.year === d.lastYear.year ? calcTotals(newData) : d.lastYear
        }))
    }, 1000), []);

    const changeYear = useCallback((prevYear: DeclarationData, newYear: NWAnalysisAvailableYear) => {
        setWorking(true);
        fetchNewYearData(base.person, prevYear, newYear)
            .then(d => d && setData(getNWDataMerger(prevYear, d)))
            .finally(() => setWorking(false));
    }, [base.person])

    const analysis = useMemo(() => doCalculation(data), [data]);

    return {
        data: {
            ...data,
            // we filter the already selected years
            availableYears: data.availableYears.filter(ay => ay.year !== data.firstYear.year && ay.year !== data.lastYear.year)
        } as NetWorthIncreaseAnalysis,
        setYearData,
        working,
        changeYear,
        analysis
    }
}


/**
 * Returns a function that given a NetWorthIncreaseAnalysis produces a new one with a year changed.
 * @param prevYear the year to change
 * @param nd the new data to set
 */
function getNWDataMerger(prevYear: DeclarationData, nd: DeclarationData): (d: NetWorthIncreaseAnalysis) => NetWorthIncreaseAnalysis {
    return d => {

        const toKeep = d.firstYear.year === prevYear.year
            ? d.lastYear
            : d.firstYear;

        const {first, last} = toKeep.year > nd.year
            ? {first: nd, last: toKeep}
            : {first: toKeep, last: nd};

        message.success({
            content: `Datos obtenidos!`,
            key: 'changing_year',
            duration: 5
        });

        return {
            ...d,
            duration: last.year - first.year,
            firstYear: calcTotals(first),
            lastYear: calcTotals(last)
        }
    };
}

/**
 * Fetchs a new year data of a given person
 */
function fetchNewYearData(person: NetWorthIncreaseAnalysis["person"], prevYear: DeclarationData, newYear: NWAnalysisAvailableYear)
    : Promise<void | DeclarationData> {

    message.loading({
        duration: 0,
        content: `Cargando datos del ${newYear.year}`,
        key: 'changing_year'
    });

    return new SimpleApi().analysisGetYear(person.document, newYear.id)
        .catch(err => {
            console.warn(err);
            message.warn({
                content: `No se pudo cargar declaración de ${person.name} (${person.document}) del ${newYear.year}`,
                key: 'changing_year',
                duration: 10
            });
            return;
        });

}


function doCalculation(dat: NetWorthIncreaseAnalysis): NetWorthCalculations {

    const earnings = (dat.firstYear.totalIncome.amount + dat.lastYear.totalIncome.amount) / 2;
    const totalIncome = earnings * dat.duration;
    const forInversion = totalIncome * 0.35;
    const variation = dat.lastYear.netWorth.amount - dat.firstYear.netWorth.amount;
    const result = forInversion <= 0
        ? 1
        : (variation / forInversion);

    const nextYearEarnings = earnings * (dat.duration + 1);
    const nextYearForInversion = nextYearEarnings * 0.35;

    return {
        earnings,
        totalIncome,
        forInversion,
        variation,
        result,
        nextYearEarnings,
        nextYearForInversion
    }
}

function calcTotals(base: DeclarationData): DeclarationData {
    const data: DeclarationData = {
        ...base,
        totalActive: validNumber(base.totalActive) ? base.totalActive : sum(base.actives),
        totalPassive: validNumber(base.totalPassive) ? base.totalPassive : sum(base.passives),
        totalIncome: sum(base.incomes),
        totalExpenses: validNumber(base.totalExpenses) ? base.totalExpenses : sum(base.expenses)
    };
    data.netWorth = simplifySources({
        amount: data.totalActive.amount - data.totalPassive.amount,
        source: `${data.totalActive.source},${data.totalPassive.source}`
    });
    console.log({
        result: data,
        base
    });
    return data;
}

function validNumber(val?: AmountWithSource): boolean {
    return !!(val && val.amount > 0)
}

function sum(arr: Array<FinancialDetail>): AmountWithSource {
    return simplifySources(arr.map(d => ({amount: d.amount * (d.periodicity === 'yearly' ? 1 : 12), source: d.source}))
        .reduce((a, b) => ({
            amount: a.amount + b.amount,
            source: `${a.source}, ${b.source}`
        }), {amount: 0, source: ''}));
}

function simplifySources(a: AmountWithSource): AmountWithSource {
    return {
        amount: a.amount,
        source: uniq((a.source || '').split(","))
            .filter(s => !!s)
            .map(s => s.trim())
            .sort((s1, s2) => s1.localeCompare(s2)).join(",")
    }
}

function uniq<T>(a: T[]): T[] {
    return Array.from(new Set(a));
}
