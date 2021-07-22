import {DeclarationData, NetWorthIncreaseAnalysis, NWAnalysisAvailableYear} from "../APIModel";
import {useCallback, useMemo, useState} from "react";
import {debounce} from "lodash";
import {SimpleApi} from "../SimpleApi";
import {message} from "antd";
import {AmountWithSource, FinancialDetail} from "../../../api/src/APIModel";
import moment from "moment";
import {formatToMonth} from "../formatters";

export interface NetWorthCalculations {
    earnings: AmountWithSource;
    totalIncome: AmountWithSource;
    forInversion: AmountWithSource;
    variation: AmountWithSource;
    result: AmountWithSource;
    nextYearEarnings: AmountWithSource;
    nextYearForInversion: AmountWithSource;

    smallIncrement: AmountWithSource;
    normalIncrement: AmountWithSource;
}

/**
 * All the business logic related to this analysis should be keep here.
 * @param base the base data for the analysis
 */
export function useNWHook(base: NetWorthIncreaseAnalysis) {
    const oneDeclaration = !base.lastYear.date
    const [data, setData] = useState<NetWorthIncreaseAnalysis>(() => ({
        ...base,
        firstYear: calcTotals(base.firstYear),
        lastYear: calcTotals(base.lastYear)
    }));
    const [working, setWorking] = useState<boolean>(false);

    // eslint-disable-next-line
    const setYearData = useCallback(debounce((newData: DeclarationData) => {
        if(oneDeclaration){
            setData(d => ({
                ...d,
                duration: moment(d.lastYear.date).diff(moment(d.firstYear.date), 'months', false),
                firstYear: newData.date === d.firstYear.date ? calcTotals(newData) : d.firstYear,
                lastYear: newData.date === d.lastYear.date ? calcTotals(newData) : d.lastYear
            }))
        } else {
            setData(d => ({
                ...d,
                firstYear: newData.date === d.firstYear.date ? calcTotals(newData) : d.firstYear,
                lastYear: newData.date === d.lastYear.date ? calcTotals(newData) : d.lastYear
            }))
        }

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
            availableYears: data.availableYears.filter(ay => ay.date !== data.firstYear.date && ay.date !== data.lastYear.date)
        } as NetWorthIncreaseAnalysis,
        setYearData,
        working,
        changeYear,
        analysis,
        oneDeclaration
    }
}


/**
 * Returns a function that given a NetWorthIncreaseAnalysis produces a new one with a year changed.
 * @param prevYear the year to change
 * @param nd the new data to set
 */
function getNWDataMerger(prevYear: DeclarationData, nd: DeclarationData): (d: NetWorthIncreaseAnalysis) => NetWorthIncreaseAnalysis {
    return d => {

        const toKeep = d.firstYear.date === prevYear.date
            ? d.lastYear
            : d.firstYear;

        const {first, last} = toKeep.date! > nd.date!
            ? {first: nd, last: toKeep}
            : {first: toKeep, last: nd};

        message.success({
            content: `Datos obtenidos!`,
            key: 'changing_year',
            duration: 5
        });

        return {
            ...d,
            duration: moment(last.date).diff(moment(first.date), 'months', false),
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
        content: `Cargando datos del ${formatToMonth(newYear.date)}`,
        key: 'changing_year'
    });

    return new SimpleApi().analysisGetYear(person.document, newYear.id)
        .catch(err => {
            console.warn(err);
            message.warn({
                content: `No se pudo cargar declaración de ${person.name} (${person.document}) del ${formatToMonth(newYear.date)}`,
                key: 'changing_year',
                duration: 10
            });
        });

}


function doCalculation(dat: NetWorthIncreaseAnalysis): NetWorthCalculations {

    const firstYearEarningsPerMonth = dat.firstYear.totalIncome.amount / 12;
    const lastYearEarningsPerMonth = dat.lastYear.totalIncome.amount / 12;
    const averageIncomePerMonth = (firstYearEarningsPerMonth + lastYearEarningsPerMonth) / 2
    const totalIncome = averageIncomePerMonth * dat.duration;
    const forInversion = totalIncome * 0.35;
    const variation = dat.lastYear.netWorth.amount - dat.firstYear.netWorth.amount;
    const result = forInversion <= 0
        ? 1
        : (variation / forInversion);

    const nextYearEarnings = averageIncomePerMonth * (dat.duration + 12);
    let nextYearForInversion = nextYearEarnings * 0.35;
    if(dat.firstYear.date === dat.lastYear.date) {
       nextYearForInversion =  nextYearEarnings
    }

    const smallIncrement = (forInversion * 1.1);
    const normalIncrement = forInversion;

    const earningsSource = [dat.firstYear.totalIncome.source, dat.lastYear.totalIncome.source];
    const variationSource = [dat.firstYear.netWorth.source, dat.lastYear.netWorth.source]

    const incrementSource = [dat.firstYear.netWorth.source, ...earningsSource];

    return {
        earnings: buildAmount(averageIncomePerMonth * 12, earningsSource),
        totalIncome: buildAmount(totalIncome, earningsSource),
        forInversion: buildAmount(forInversion, earningsSource),
        variation: buildAmount(variation, variationSource),
        result: buildAmount(result, [...variationSource, ...earningsSource]),
        nextYearEarnings: buildAmount(nextYearEarnings, ['']),
        nextYearForInversion: buildAmount(nextYearForInversion, ['']),
        smallIncrement: buildAmount(smallIncrement, incrementSource),
        normalIncrement: buildAmount(normalIncrement, incrementSource)
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
    return data;
}

function validNumber(val?: AmountWithSource): boolean {
    return !!(val && val.amount > 0)
}

export function sum(arr: Array<FinancialDetail>): AmountWithSource {
    return simplifySources(arr.map(d => ({amount: d.amount * (d.periodicity === 'yearly' ? 1 : 12), source: d.source}))
        .reduce((a, b) => ({
            amount: a.amount + b.amount,
            source: `${a.source}, ${b.source}`
        }), {amount: 0, source: ''}));
}

function buildSources(a?: string) {
    return uniq((a || '').split(","))
        .filter(s => !!s)
        .map(s => s.trim())
        .sort((s1, s2) => s1.localeCompare(s2)).join(",");
}

function simplifySources(a: AmountWithSource): AmountWithSource {
    return {
        amount: a.amount,
        source: buildSources(a?.source)
    }
}

function uniq<T>(a: T[]): T[] {
    return Array.from(new Set(a));
}

function buildAmount(amount: number, sources?: Array<string>): AmountWithSource {
    return {
        source: buildSources((sources || []).join(",")),
        amount
    }
}
