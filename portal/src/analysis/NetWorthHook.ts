import {DeclarationData, NetWorthIncreaseAnalysis, NWAnalysisAvailableYear} from "../APIModel";
import {useCallback, useState} from "react";
import {debounce} from "lodash";
import {SimpleApi} from "../SimpleApi";
import {message} from "antd";
import {FinancialDetail} from "../../../api/src/APIModel";

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
        message.loading({
            duration: 0,
            content: `Cargando datos del ${newYear.year}`,
            key: 'changing_year'
        });

        new SimpleApi().analysisGetYear(base.person.document, newYear.id)
            .then(nd => {
                setData(d => {

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
                })

            })
            .catch(err => {
                console.warn(err);
                message.warn({
                    content: `No se pudo cargar declaración de ${base.person.name} (${base.person.document}) del ${newYear.year}`,
                    key: 'changing_year',
                    duration: 10
                });
            })
            .finally(() => setWorking(false));

    }, [base.person.name, base.person.document])

    return {
        data: {
            ...data,
            // we filter the already selected years
            availableYears: data.availableYears.filter(ay => ay.year !== data.firstYear.year && ay.year !== data.lastYear.year)
        } as NetWorthIncreaseAnalysis,
        setYearData,
        working,
        changeYear
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
    data.netWorth = data.totalActive - data.totalPassive;
    console.log('result', data);
    return data;
}

function validNumber(val?: number): boolean {
    return !!(val && val > 0)
}

function sum(arr: Array<FinancialDetail>): number {
    return arr.map(d => d.amount * (d.periodicity === 'yearly' ? 1 : 12))
        .reduce((a, b) => (a || 0) + (b || 0), 0)
}
