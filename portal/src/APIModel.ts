/**
 * Represent a single point of income or expense
 */
export interface FinancialDetail extends AmountWithSource {
    name: string;
    periodicity: 'yearly' | 'monthly';
    observation: string;
}

export interface AmountWithSource {
    amount: number;
    source: string;
}

export interface DeclarationData {

    date: string;

    netWorth: AmountWithSource;

    totalActive: AmountWithSource;
    totalPassive: AmountWithSource;
    totalIncome: AmountWithSource;
    totalExpenses: AmountWithSource;

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
