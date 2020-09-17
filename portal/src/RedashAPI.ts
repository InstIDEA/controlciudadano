import {
    Affidavit,
    AndeExonerated,
    Authorities,
    EssapExonerated,
    OCDSBuyerWithAmount,
    OCDSCovidTender,
    OCDSItemRankingListRow,
    OCDSItemsAwardedCOVID19,
    OCDSSupplierRelation,
    OCDSSupplierWithSanction,
    SourceData,
    Supplier
} from './Model';

const BASE_API = "https://datapy.redash.cds.com.py/api";

const API_KEYS: Record<number, string> = {
    1: "Wtp9iNNTzO2yTbUwfoE4bOM7qd9msWnWIJ9aeatl",
    18: 'a2kmZeR9AdGeldeP0RXg2JWSZeevSA62xzpN15jb',
    21: "tfBr4sqHm3JYSUxktgeu16EwHKO3Qh9tSEgz6Pui",
    25: "ILEsnIawXqNOajocI8PrxH0QfbdGeeyaEEbzkLsQ",
    26: "YQP3k6QFEDgFDDXLDvyFrI1HWp2OvT07mZUL7ht8",
    27: "DhDrVfrcpeV1sNxk0uAsFDLPxhef7CGRXKOm9lnn",
    28: "qMecN8ma9IkW2Tekpebk8ygk4c3fzzos2mk6ya0A",
    35: "WYy6Jsk51sOOQuhzOwCriygodvlolhxwjyIxbpRH",
    36: "vX16f20urPFfYsebawg3Kda9qhN6JDTCexhH8Trf",
    37: "N0DHcr72NbiWC5n3IBEVmkSoViBxud8GTxKNLi3z"
}


export class RedashAPI {

    constructor(private apiKey?: string) {
    }

    getItems(): Promise<BaseRedashResponse<OCDSItemsAwardedCOVID19>> {
        return this.fetchQuery(1);
    }

    getSuppliers(): Promise<BaseRedashResponse<Supplier>> {
        return this.fetchQuery(13);
    }

    getItemRanking(): Promise<BaseRedashResponse<OCDSItemRankingListRow>> {
        return this.fetchQuery(21)
    }

    private async fetchQuery(queryNr: number) {
        const apiKey = API_KEYS[queryNr] || this.apiKey;
        const response = await fetch(`${BASE_API}/queries/${queryNr}/results.json?api_key=${apiKey}`);

        if (response.status >= 200 && response.status < 300) return response.json();

        const body = await response.text();
        throw  new ApiError(response.statusText, response.status, body);
    }

    getRelations(): Promise<BaseRedashResponse<OCDSSupplierRelation>> {
        return this.fetchQuery(18);
    }

    getAffidavit(): Promise<BaseRedashResponse<Affidavit>> {
        return this.fetchQuery(19);
    }

    getAndeExonerated(): Promise<BaseRedashResponse<AndeExonerated>> {
        return this.fetchQuery(25);
    }

    getSources(): Promise<BaseRedashResponse<SourceData>> {
        return this.fetchQuery(26);
    }

    getEssapExonerated(): Promise<BaseRedashResponse<EssapExonerated>> {
        return this.fetchQuery(27);
    }

    getAuthorities(): Promise<BaseRedashResponse<Authorities>> {
        return this.fetchQuery(28);
    }

    getBuyers(): Promise<BaseRedashResponse<OCDSBuyerWithAmount>> {
        return this.fetchQuery(35);

    }

    getSupplierCOVIDWithSanctions(): Promise<BaseRedashResponse<OCDSSupplierWithSanction>> {
        return this.fetchQuery(36);
    }

    getCovidTenders(): Promise<BaseRedashResponse<OCDSCovidTender>> {
        return this.fetchQuery(37);
    }
}

interface BaseRedashResponse<T> {
    query_result: {
        data: {
            columns: object,
            rows: T[]
        },
        data_source_id: number,
        id: number,
        query: string,
        query_hash: number,
        retrieved_at: string,
        runtime: number
    }
}

export function filterRedashList<T>(
    source: T[],
    toSearch: string,
    columns: (keyof T)[]
): T[] {
    if (!toSearch || toSearch.trim() === "") return source;

    const fToSearch = toSearch.toLowerCase();

    function isMatch(t: T) {
        return columns
            .map(name => t[name])
            .join('')
            .toLowerCase()
            .includes(fToSearch);
    }

    return source
        .filter(isMatch)
}

export function removeDuplicated<T>(
    source: T[],
    keyProvider: (t: T) => string
): T[] {
    const toRet: { [k: string]: T} = {};

    source.forEach(s => {
        toRet[keyProvider(s)] = s
    })

    return Object.values(toRet);
}

export class ApiError extends Error {
    constructor(msg: string, private code: number, private body: string) {
        super(msg);
    }

    getJson() {
        return JSON.stringify(this.body || '');
    }

    getText() {
        return this.body;
    }

    getCode() {
        return this.code;
    }
}

(window as any).RedashAPI = RedashAPI;
