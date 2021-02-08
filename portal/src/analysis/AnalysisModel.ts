export interface DeclarationData {
    /**
     * Should be removed in favor of active details
     */
    otherActives: number;
    year: number,
    netWorth: number,
    active: number,
    passive: number,
    income: number,
    activeDetails: Array<{
        name: string,
        amount: number,
        periodicity: 'yearly' | 'monthly'
    }>
}

export interface NetWorthIncrementData {

    person: {
        name: string,
        document: string
    }
    /**
     * Duration of this period (difference between declaration data)
     */
    duration: number;
    firstYear: DeclarationData,
    lastYear: DeclarationData
}
