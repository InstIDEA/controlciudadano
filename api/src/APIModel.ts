/**
 * Represent a single point of income or expense
 */
interface FinancialDetail {
    name: string;
    amount: number;
    periodicity: 'yearly' | 'monthly';
    source: string;
    observation: string;
}

export interface DeclarationData {

    /**
     * Should be removed in favor of active details
     */
    year: number;
    netWorth: number;

    totalActive: number;
    totalPassive: number;
    totalIncome: number;
    totalExpenses: number;

    actives: Array<FinancialDetail & {
        periodicity: 'yearly'
    }>;

    incomes: Array<FinancialDetail>;

    expenses: Array<FinancialDetail>;

    passives: Array<FinancialDetail & {
        periodicity: 'yearly'
    }>;


}

export interface NetWorthIncreaseAnalysis {

    person: {
        name: string,
        document: string
    }

    duration: number;
    firstYear: DeclarationData,
    lastYear: DeclarationData

    availableYears: number[];
}


export interface AnalysisDJBR {
    id: number;
    document: string;
    name: string;
    year: number;
    version: number;
    link: string;
    origin: string;
    link_sandwich: string;
    type: string;
    active: string;
    passive: string;
    net_worth: string;
    scrapped_data: object;
    charge: string;
    download_date: string;
}
