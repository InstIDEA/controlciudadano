/**
 * Represent a single point of income or expense
 */
export interface FinancialDetail extends AmountWithSource {
    name: string;
    periodicity: 'yearly' | 'monthly';
    observation: string;
}

export interface DeclarationData {

    date: Date;
    netWorth: AmountWithSource;

    /**
     * Should be removed in favor of active details
     */
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

export interface AmountWithSource {
    amount: number;
    source: string;
}

export interface NetWorthIncreaseAnalysis {

    person: {
        name: string,
        document: string
    }

    duration: number;
    firstYear: DeclarationData,
    lastYear: DeclarationData

    availableYears: Array<{
        id: number;
        link: string;
        date: Date;
        downloadedDate: string;
    }>;
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
    download_date: Date;

    monthly_expenses: string;
    monthly_income: string;
    anual_expenses: string;
    anual_income: string;
    date: Date;
}

