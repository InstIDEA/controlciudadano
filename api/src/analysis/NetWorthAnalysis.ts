import {AnalysisDJBR, DeclarationData, NetWorthIncreaseAnalysis} from "../APIModel";
import {fetchParsedDJBR} from "./DJBRParserApi";

export interface NetWorthAnalysisEnhancer {
    enhance(context: ContextData): Promise<void>;
}

interface ContextData {
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
        totalPassive: 0
    }
}


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


        // second: use the latest two (with a spam of al least 4 years)
        const {first, last} = this.checkBestDeclarations(decs);

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


    private checkBestDeclarations(allDecs: Array<AnalysisDJBR>, minSpan: number = 4): {
        first: AnalysisDJBR | null,
        last: AnalysisDJBR | null
    } {

        if (!allDecs || allDecs.length === 0) {
            return {first: null, last: null};
        }

        if (allDecs.length === 1) {
            return {first: null, last: allDecs[0]};
        }

        const clone = [...allDecs].sort((f, s) => s.year - f.year);


        const last = clone[0];

        let prev = clone.filter(d => d.year < last.year - minSpan).pop();

        // there was not any good candidate, pick the last one
        if (!prev) prev = clone.pop();


        return {
            first: prev,
            last: last
        };
    }

    private createBaseData(dat: AnalysisDJBR | null): DeclarationData {
        if (dat == null) return getDefault();

        return {
            ...getDefault(),
            year: dat.year,
            totalPassive: parseFloat(dat.passive) || 0,
            totalActive: parseFloat(dat.active) || 0,
            netWorth: parseFloat(dat.net_worth) || 0
        }
    }

    private prepareResponse(document: string, allDecs: Array<AnalysisDJBR>, ctx: ContextData): NetWorthIncreaseAnalysis {

        return {
            person: {
                document: document,
                name: ctx.end.dbRow.name || ctx.start.dbRow.name || ''
            },
            availableYears: uniq(allDecs.map(d => d.year)),
            duration: ctx.end.data.year - ctx.start.data.year,
            firstYear: ctx.start.data,
            lastYear: ctx.end.data
        };
    }
}


function uniq<T>(a: T[]): T[] {
    return Array.from(new Set(a));
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
        const parsed = (await fetchParsedDJBR(url)).data;
        console.log(JSON.stringify(parsed, null, 2))

        if (parsed.ingresosMensual && parsed.ingresosMensual > 0) {
            toEnhance.incomes.push({
                amount: parsed.ingresosMensual,
                periodicity: 'monthly',
                name: 'Ingresos Mensuales',
                observation: `Total de ingresos mensuales según declaración`,
                source: 'DJBR'
            });
        }

        if (parsed.ingresosAnual && parsed.ingresosAnual > 0) {
            toEnhance.incomes.push({
                amount: parsed.ingresosAnual,
                periodicity: 'yearly',
                name: 'Ingresos Anuales',
                observation: `Total de ingresos anuales según declaración`,
                source: 'DJBR'
            });
        }

        if (parsed.egresosAnual && parsed.egresosAnual > 0) {
            toEnhance.expenses.push({
                amount: parsed.egresosAnual,
                periodicity: 'yearly',
                name: 'Egresos Anuales',
                observation: `Total de egresos anuales según declaración`,
                source: 'DJBR'
            });
        }

        if (parsed.egresosMensual && parsed.egresosMensual > 0) {
            toEnhance.expenses.push({
                amount: parsed.egresosMensual,
                periodicity: 'yearly',
                name: 'Egresos Mensuales',
                observation: `Total de egresos mensuales según declaración`,
                source: 'DJBR'
            });
        }

        if (parsed.activos && parsed.activos > 0) {
            toEnhance.actives.push({
                amount: parsed.activos,
                periodicity: 'yearly',
                name: 'Total activos',
                observation: `Total de activos según declaración`,
                source: 'DJBR'
            });
        }

        if (parsed.pasivos && parsed.pasivos > 0) {
            toEnhance.passives.push({
                amount: parsed.pasivos,
                periodicity: 'yearly',
                name: 'Total pasivos',
                observation: `Total de pasivos según declaración`,
                source: 'DJBR'
            });
        }

        return toEnhance;
    }
}
