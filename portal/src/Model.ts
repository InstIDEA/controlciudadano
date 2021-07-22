export interface LocalSearchPersonResult {

    query: string;
    data: {
        [key: string]: [
            {
                source: string;
                document: string;
                names: string[];
                net_worth?: number;
            }

        ]
    }
}

export interface LocalSearchResult {

    query: string;
    staging: {
        pytyvo: Array<{
            department: string,
            district: string,
        }>;
        nangareko: Array<{
            department: string,
            district: string
        }>;
        nangareko_2: object[];
        nangareko_transparencia: object[];
        hacienda_funcionarios: Hacienda[];
        sfp: Array<SFPLocalData>;
        policia: Array<{
            ano: string,
            presupuesto: string,
            remuneracion: string,
        }>;
        ande_exonerados: AndeExonerated[];
        a_quien_elegimos: AquienesElegimos[];
    }
}

export interface SFPLocalData {
    descripcion_entidad: string;
    devengado: number;
    presupuestado: number;
    mes: number;
    fecha_nacimiento: string;
    nombres: string;
    apellidos: string;
    cargo: string;
    anho: number,
    profesion: string,
    funcion: string,
    source: string
}

export interface AnalysisSearchResult {

    query: string;
    analysis: {
        djbr: Affidavit[],
        tsje_elected: Authorities[]
    }
}


export interface Atributo {
    id: string;
    name: string;
    value: string;
}

export interface OCDSItemsAwardedCOVID19 {
    llamado_nombre: string;
    llamado_slug: string;
    procurement_method: string;
    llamado_numero: string;
    precio_unitario: number;
    cantidad: string;
    unidad_medida: string;
    atributos: Atributo[];
    item_adjudicado: string;
    item_classification_nivel_5_id: string;
    item_classification_nivel_5_nombre: string;
    supplier_name: string;
    supplier_ruc: string;
    porcentaje_mayor_precio_antes_pandemia: number;
    covered_by: string[];
    buyer_id: string;
    buyer_name: string;
}


export interface OCDSBuyer {
    id: string;
    name: string;
}

export interface OCDSBuyerWithAmount {
    buyer_id: string;
    buyer: string;
    ocid: string;
    inflated_awarded_amount: number;
    inflated_tender_amount: number;

    awarded_amount: number;
    total_awards: number;
    different_suppliers: number;
}

export interface OCDSBuyerWithSuppliers {
    ocid: string;
    supplier_id: string;
    supplier: string;
    currency: string;
    awarded: number;
    referential: number;
    percentage: number;
    date: string;
    is_covid: boolean;
    tender_slug: string;
    tender_title: string;
    procurement_method: string;
}

export interface OCDSItemRankingListRow {
    monto_total: number;
    cantidad_total: number;
    monto_promedio: number;
    moneda: string;
    unidad_medida: string;
    presentacion: string;
    item_classification_nivel_5_id: string,
    item_classification_nivel_5_nombre: string;
}


export interface OCDSPaginatedResult {
    page: number;
    size: number;
    data: OCDSItemsAwardedCOVID19[];
}

export interface Supplier {
    name: string;
    ruc: string;
    telephone: string;
    contact_point: string;
    country: string;
    department: string;
    city: string;
    address: string;
}

export interface Buyer {
    name: string;
    id: string;
}

export interface OCDSSuppliersPaginatedResult {
    page: number;
    size: number;
    data: Supplier[];
}

export interface OCDSSupplierResult {
    data: Supplier;
}

export interface OCDSItemResult {
    data: OCDSItemAwardInfo[];
}


export interface OCDSItemTenderInfo {
    id: string;
    title: string;
    slug: string;
    method: string;
    method_description: string;
    flags: string[];
    date: string;
    local_name: string;
    tenders: string | null;
    status: string;
    sign_date: string | null;
    process_duration: string | null;
    quantity: string;
    amount: string;
    total: string;
    currency: string;
    supplier?: {
        id: string;
        name: string;
    },
    buyer?: {
        id: string;
        name: string;
    }
}

export interface OCDSItemAwardInfo {
    count: string;
    total_amount: string;
    tenders: Array<OCDSItemTenderInfo>;
    quantity: number;
    avg_amount: string;
    max_amount: string;
    min_amount: string;
    currency: string;
    unit: string;
    presentation: string;
    id: string;
    name: string;
    total_tenders: string | null;
    avg_tenders: string | null;
}

export interface SimpleAPINotPaginatedResult<T> {
    data: T[];
}

export interface OCDSItemPriceEvolutionResponse {
    data: OCDSItemPriceEvolution[];
}

export interface OCDSItemRelatedParty {
    slug: string;
    tender_method: string;
    tender_flags: string[];
    tender_date_published: string;
    tender_title: string;
    roles: string[];
    party_id: string;
    party_name: string;
}

export interface AdjustedAmount {
    in_gs: number,
    inflated: number,
    original_amount: number,
    original_currency: string;
}


export interface OCDSItemPriceEvolution {
    ocid: string,
    date: string,
    item: string,
    catalog: string,
    price: AdjustedAmount,
    quantity: string,
    flags: string[] | null,
    attributes: Array<{
        id: string,
        name: string,
        value: string
    }>,
    presentation: string,
    unit: string
}

export interface PaginatedResult<T> {
    page: number,
    size: number,
    data: T[]
}

export interface Affidavit {
    revision: string;
    id: number;
    name: string;
    document: string;
    year: number;
    version: number;
    link: string;
    source: string;
    link_sandwich: string;
    type: string;
    active: number;
    passive: number;
    net_worth: number;
    charge: string;
}

export interface OCDSSupplierContract {
    contract_award_id: string;
    tender_slug: string;
    tender_title: string;
    published_date: string;
    buyer_id: string;
    buyer_name: string;
    contract_id: string;
    name: string;
    ruc: string;
    amount: string;
    currency: string;
    sign_date: string;
    procurement_method: string;
    is_covid: boolean;
}

export interface OCDSSupplierRelation {
    p1ruc: string;
    p2ruc: string;
    p1name: string;
    p2name: string;
    relation: string;
    weight: number;
    date: string;
    data: unknown;
}

export interface AndeExonerated {
    agencia: string;
    nis: string;
    tarifa: number;
    cliente: string;
    documento: string;
    fecha_exoneracion: string;
}

export interface EssapExonerated {
    numero: string;
    ciudad: string;
    zona: string;
    catastro: string;
    promedio: number;
    marzo_19: string;
    abril_19: string;
    mayo_19: string;
    junio_19: string;
    julio_19: string;
    agosto_19: string;
    septiembre_19: string;
    octubre_19: string;
    noviembre_19: string;
    diciembre_19: string;
    enero_20: string;
    febrero_20: string;
}

export interface SourceData {
    id: number;
    file_name: string;
    dataset: string;
    hash: string;
    date: string;
    original_uri?: string;
}

export interface Authorities {
    document?: string;
    full_name: string;
    year_elected: string;
    list: string;

    department: string;
    charge: string;
    title: string;
}


export interface OCDSSupplierSanctionCategory {
    id: string;
    name: string;
}

export interface OCDSSupplierSanctionPeriod {
    startDate: string;
    endDate?: string;
}

export interface OCDSSupplierSanctionEvent {
    date: string;
    description: string;
    title: string;
}

export interface OCDSSupplierSanction {
    status: string;
    period: OCDSSupplierSanctionPeriod;
    type: string;
    description: string;
    id: string;
    events: OCDSSupplierSanctionEvent[];
}

export interface OCDSSupplierSanctionProduct {
    id: string;
    name: string;
}

export interface OCDSSupplierSanctionDetail {
    legalEntityTypeDetail: string;
    activityTypes: string;
    size: string;
    categories: OCDSSupplierSanctionCategory[];
    sanctions: OCDSSupplierSanction[];
    products?: OCDSSupplierSanctionProduct[];
    scale: string;
    activityTypeDetails: string;
}

export interface OCDSSupplierSanctions {
    type: string | null;
    details: OCDSSupplierSanctionDetail;
}

export interface OCDSSupplierWithSanction {
    supplier_name: string;
    supplier_id: string;
    awarded_amount: any;
    sanctions: OCDSSupplierSanctions[];
}


export interface OCDSCovidTender {
    ocid: string;
    tender_slug: string;
    tender_title: string;
    tender_amount: number;
    status: string;
    is_covid: boolean;
    start_date: string;
    duration?: number;
    procurement_method: string;
    supplier?: Array<{
        name: string;
        id: string;
    }>;
    buyer?: Array<{
        name: string;
        id: string;
    }>;
}

export interface GlobalStatistics {
    current_year: number;
    payed_salaries: number;
    payed_salaries_month: string;
    ocds_current_year_contracts: number;
    ocds_covid_contracts: number;
    calc_date: string
}

export interface PersonDataStatistics {
    treasury_data_payed_salaries: number,
    ande_count: number,
    pytyvo_count: number,
    sfp_payed_salaries: number,
    treasury_data_payed_salaries_month: string,
    affidavid_count: number,
    sfp_payed_salaries_month: string,
    calc_date: string,
    current_year: number,
    nangareko_count: number
}

export interface DataSetFile {
    hash: string,
    original_url: string,
    file_name: string,
    file_date: string,
    loaded_date: string,
    local_suffix: string | null,
    id: number
}

export interface DataSet {
    files: null | Array<DataSetFile>,
    kind: "OTHER" | "MONTHLY",
    description: string,
    base_url: string,
    last_update: string,
    id: number,
    institution: string,
    name: string
}

export interface AquienesElegimos {
    identifier: number;
    id: number,
    name: string,
    lastname: string,
    date_of_birth: string,
    date_of_death: string,
    estado_civil: string,
    fb: string,
    tw: string,
    insta: string,
    city_of_residence: string,
    decendents: string,
    email_address: string,
    head_shot: string,
    national_identity: string,
    phone: string,
    contact_detail: string
}
export interface Hacienda {
    montopresupuestado: number;
    nombres: string;
    descripcionentidad: string;
    apellidos: string;
    anio: number,
    mes: number,
    cargo: string,
    montodevengado: number,
    montopresupestado:number,
    descripcionunidadresponsable: string,
    nivelabr: string
}
export interface VideoTutorialesSemillas {
    titulo: string;
    description: string;
    link: string;
    type: string;
}

export interface AuthoritiesWithoutDocument {
    first_name: string;
    last_name: string;
    document: string;
    year_elected: number;
    departament: string;
    charge: string;
    list: string;
    title: string;
    presented: boolean;
    start: null | {
        link: string;
        origin: string;
        active: null | number;
    }
}

export interface StatisticsDJBR {
    total_parsed: number;
    count_employees: number;
    total_authorities: number;
    total_declarations: number;
    count_declarations_auths: number;
    last_success_fetch: string;
    total_authorities_in_order: number;
    first_election_year: number;
    last_election_year: number;
    count_auths_with_decs: number;
}

/**
 * Represents a networks resource.
 *
 * Useful in switches and with pattern matching
 */
export type Async<T, E = Error> = {
    state: 'NO_REQUESTED'
} | {
    state: 'FETCHING'
} | {
    state: 'LOADED',
    data: T
} | {
    state: 'ERROR',
    error: E
}

/**
 * A single helper to produce NetworkResource instances quickly
 */
export const AsyncHelper = {
    noRequested: () => ({state: 'NO_REQUESTED' as const}),
    fetching: () => ({state: 'FETCHING' as const}),
    loaded: <T>(data: T) => ({state: 'LOADED' as const, data}),
    error: <E>(error: E) => ({state: 'ERROR' as const, error}),

    or: function <T, E>(nr: Async<T, E>, def: T) {
        if (nr.state === 'LOADED') return nr.data;
        return def;
    },

    map: function <T, E, K>(nr: Async<T, E>, mapper: (toMap: T) => K): Async<K, E> {
        switch (nr.state) {
            case 'ERROR':
                return AsyncHelper.error(nr.error);
            case 'FETCHING':
                return AsyncHelper.fetching();
            case 'LOADED':
                const mapped: K = mapper(nr.data);
                return AsyncHelper.loaded<K>(mapped);
            case 'NO_REQUESTED':
            default:
                return AsyncHelper.noRequested();

        }
    },

    filter: function <T, E>(nr: Async<T[], E>, filter: (toFilter: T) => boolean): Async<T[], E> {
        switch (nr.state) {
            case 'ERROR':
                return AsyncHelper.error(nr.error);
            case 'FETCHING':
                return AsyncHelper.fetching();
            case 'LOADED':
                const filtered = nr.data.filter(filter);
                return AsyncHelper.loaded(filtered);
            case 'NO_REQUESTED':
            default:
                return AsyncHelper.noRequested();

        }
    }
};
