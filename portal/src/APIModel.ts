/**
 * Represent a single point of income or expense
 */
export interface FinancialDetail {
    name: string;
    amount: number;
    periodicity: 'yearly' | 'monthly';
    source: string;
    observation: string;
}

export interface DeclarationData {

    year: number;
    netWorth: number;

    /**
     * Should be removed in favor of active details
     */
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

    sources: Array<{
        type: string,
        url: string
    }>;

}

export interface NWAnalysisAvailableYear {
    id: number;
    link: string;
    year: number;
    date: string;
    downloadedDate: string;
}

export interface NetWorthIncreaseAnalysis {

    person: {
        name: string,
        document: string
    }

    duration: number;
    /**
     * The first year of the declaration, for example 2015
     */
    firstYear: DeclarationData,
    /**
     * The last year of the analysis, for example 2020
     */
    lastYear: DeclarationData

    availableYears: Array<NWAnalysisAvailableYear>;
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
