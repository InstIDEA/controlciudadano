import {AnalysisDJBR, DeclarationData, FinancialDetail, NetWorthIncreaseAnalysis} from "../APIModel";
import {fetchParsedDJBR} from "./DJBRParserApi";

export interface NetWorthAnalysisEnhancer {
    enhance(context: ContextData): Promise<void>;
}

export interface ContextData {
    document: string;
    start: {
        dbRow: AnalysisDJBR,
        data: DeclarationData
    },

    end: {
        dbRow: AnalysisDJBR,
        data: DeclarationData
    }
}

function getDefault(): DeclarationData {
    return {
        year: new Date().getFullYear(),
        netWorth: 0,
        actives: [],
        expenses: [],
        incomes: [],
        passives: [],
        totalActive: 0,
        totalExpenses: 0,
        totalIncome: 0,
        totalPassive: 0,
        sources: []
    }
}

type GroupedDecs = { [k: number]: AnalysisDJBR };


export class NetWorthAnalysis {
    enhancers: NetWorthAnalysisEnhancer[] = [];

    constructor(enhancers?: NetWorthAnalysisEnhancer[]) {
        if (!enhancers) {
            this.enhancers = [new DJBRParserEnhancer()];
        } else {
            this.enhancers = enhancers;
        }
    }


    async buildData(decs: Array<AnalysisDJBR>, document: string): Promise<NetWorthIncreaseAnalysis> {

        // first: we get the last declaration per year
        const latest = this.getLatestDeclarationsPerYear(decs);

        // second: use the latest two (with a spam of al least 4 years)
        const {first, last} = this.getBestDeclarations(latest);

        // third create base struct
        const context: ContextData = {
            document,
            end: {
                dbRow: last,
                data: this.createBaseData(last),
            },
            start: {
                dbRow: first,
                data: this.createBaseData(first)
            }
        }

        // four enhance with sources
        for (const enhancer of this.enhancers) {
            await Promise.all([
                enhancer.enhance(context)
            ])
        }

        // and last, prepare the response
        return this.prepareResponse(
            document,
            decs,
            context
        );
    }

    async getSpecificYear(dec: AnalysisDJBR): Promise<DeclarationData> {

        const ctx: ContextData = {
            start: {
                data: this.createBaseData(dec),
                dbRow: dec
            },
            end: {
                data: this.createBaseData(null),
                dbRow: dec
            },
            document: ''
        }

        // four enhance with sources
        for (const enhancer of this.enhancers) {
            await Promise.all([
                enhancer.enhance(ctx)
            ])
        }

        return ctx.start.data;
    }

    getLatestDeclarationsPerYear(decs: Array<AnalysisDJBR>): GroupedDecs {
        const toRet: GroupedDecs = {};

        for (const dec of decs) {
            if (!toRet[dec.year]) {
                toRet[dec.year] = dec;
            } else {
                const previous = toRet[dec.year];
                if (previous.download_date < dec.download_date) {
                    toRet[dec.year] = dec;
                }
            }
        }

        return toRet;
    }


    public getBestDeclarations(allDecs: GroupedDecs): {
        first: AnalysisDJBR | null,
        last: AnalysisDJBR | null
    } {

        if (!allDecs || Object.keys(allDecs).length === 0) {
            return {first: null, last: null};
        }

        if (Object.keys(allDecs).length === 1) {
            return {first: null, last: Object.values(allDecs)[0]};
        }

        const years = Object.keys(allDecs).map(y => parseInt(y));
        years.sort((y1, y2) => y1 - y2);

        const lastYear = years.pop();
        const previousYear = years.length > 0 ? years.pop() : undefined;

        return {
            first: allDecs[previousYear],
            last: allDecs[lastYear]
        };
    }

    private createBaseData(dat: AnalysisDJBR | null): DeclarationData {
        if (dat == null) return getDefault();

        return {
            ...getDefault(),
            year: dat.year,
            totalPassive: parseFloat(dat.passive) || 0,
            totalActive: parseFloat(dat.active) || 0,
            netWorth: parseFloat(dat.net_worth) || 0,
            sources: [{
                url: dat.link,
                type: 'djbr'
            }]
        }
    }

    private prepareResponse(document: string, allDecs: Array<AnalysisDJBR>, ctx: ContextData): NetWorthIncreaseAnalysis {

        this.calcTotals(ctx.start.data);
        this.calcTotals(ctx.end.data);

        return {
            person: {
                document: document,
                name: ctx.end.dbRow.name || ctx.start.dbRow.name || ''
            },
            availableYears: prepareAvailableDecs(this.getLatestDeclarationsPerYear(allDecs)),
            duration: ctx.end.data.year - ctx.start.data.year,
            firstYear: ctx.start.data,
            lastYear: ctx.end.data
        };
    }

    private calcTotals(data: DeclarationData): void {
        if (!validNumber(data.totalActive)) data.totalActive = sum(data.actives);
        if (!validNumber(data.totalPassive)) data.totalPassive = sum(data.passives);
        if (!validNumber(data.totalIncome)) data.totalIncome = sum(data.incomes);
        if (!validNumber(data.totalExpenses)) data.totalExpenses = sum(data.expenses);

        data.netWorth = data.totalActive - data.totalPassive;
    }
}

function prepareAvailableDecs(decs: GroupedDecs): NetWorthIncreaseAnalysis["availableYears"] {

    return Object.values(decs).map(dec => ({
        id: dec.id,
        date: `${dec.year}/01/01`, // TODO get the dec date
        downloadedDate: `${dec.download_date}`,
        link: dec.link,
        year: dec.year
    })).sort((d1, d2) => d2.year - d1.year)
}

function validNumber(val?: number): boolean {
    return val && val > 0
}

function sum(arr: Array<FinancialDetail>): number {
    return arr.map(d => d.amount * (d.periodicity === 'yearly' ? 1 : 12))
        .reduce((a, b) => a + b, 0)
}

class DJBRParserEnhancer implements NetWorthAnalysisEnhancer {

    constructor() {
    }

    async enhance(data: ContextData) {

        await Promise.all([
            this.enhanceSingle(data.start.data, data.start.dbRow),
            this.enhanceSingle(data.end.data, data.end.dbRow),
        ])

    }

    async enhanceSingle(toEnhance: DeclarationData, source: AnalysisDJBR) {


        const url = source.link;
        const response = (await fetchParsedDJBR(url));
        const parsed = response.data;

        if (!parsed) {
            return toEnhance;
        }

        toEnhance.sources = [
            ...toEnhance.sources,
            {
                type: 'djbr',
                url: url
            }
        ]

        if (validNumber(parsed.ingresosMensual)) {
            toEnhance.incomes.push({
                amount: parsed.ingresosMensual,
                periodicity: 'monthly',
                name: 'Ingresos Mensuales',
                observation: `Total de ingresos mensuales según declaración`,
                source: 'DJBR'
            });
        }

        if (validNumber(parsed.ingresosAnual)) {
            toEnhance.incomes.push({
                amount: parsed.ingresosAnual,
                periodicity: 'yearly',
                name: 'Ingresos Anuales',
                observation: `Total de ingresos anuales según declaración`,
                source: 'DJBR'
            });
        }

        if (validNumber(parsed.egresosAnual)) {
            toEnhance.expenses.push({
                amount: parsed.egresosAnual,
                periodicity: 'yearly',
                name: 'Egresos Anuales',
                observation: `Total de egresos anuales según declaración`,
                source: 'DJBR'
            });
        }

        if (validNumber(parsed.egresosMensual)) {
            toEnhance.expenses.push({
                amount: parsed.egresosMensual,
                periodicity: 'yearly',
                name: 'Egresos Mensuales',
                observation: `Total de egresos mensuales según declaración`,
                source: 'DJBR'
            });
        }

        if (validNumber(parsed.resumen.totalActivo)) {
            toEnhance.actives.push({
                amount: parsed.resumen.totalActivo,
                periodicity: 'yearly',
                name: 'Total activos',
                observation: `Total de activos según declaración`,
                source: 'DJBR'
            });
        }

        if (validNumber(parsed.resumen.totalPasivo)) {
            toEnhance.passives.push({
                amount: parsed.resumen.totalPasivo,
                periodicity: 'yearly',
                name: 'Total pasivos',
                observation: `Total de pasivos según declaración`,
                source: 'DJBR'
            });
        }

        return toEnhance;
    }
}