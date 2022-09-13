import {
    Affidavit,
    AnalysisSearchResult,
    LocalSearchResult,
    OCDSBuyer,
    OCDSBuyerWithSuppliers,
    OCDSItemPriceEvolutionResponse,
    OCDSItemRelatedParty,
    OCDSItemResult,
    OCDSPaginatedResult,
    OCDSSupplierContract,
    OCDSSupplierResult,
    OCDSSuppliersPaginatedResult,
    PaginatedResult,
    SimpleAPINotPaginatedResult
} from './Model';
import {DeclarationData, NetWorthIncreaseAnalysis} from "./APIModel";
import {ApiError} from "./RedashAPI";

const BASE_API = "https://api.controlciudadanopy.org/api";
const CDN_API = "https://data.controlciudadanopy.org/cdn/";

export class SimpleApi {

    async findPeople(query: string): Promise<LocalSearchResult> {
        const d = await fetch(`${BASE_API}/find?query=${query}`);
        return await d.json();
    }

    async findPeopleInAnalysis(query: string): Promise<AnalysisSearchResult> {
        const d = await fetch(`${BASE_API}/findAnalysis?query=${query}`);
        return d.json();
    }

    async getItems(pagination: { page: number, pageSize: number }): Promise<OCDSPaginatedResult> {
        const d = await fetch(`${BASE_API}/ocds/items?page=${pagination.page}&size=${pagination.pageSize}`);
        return d.json();
    }

    async getSuppliers(pagination: { page: number, pageSize: number }): Promise<OCDSSuppliersPaginatedResult> {
        const d = await fetch(`${BASE_API}/ocds/suppliers?page=${pagination.page}&size=${pagination.pageSize}`);
        return d.json();
    }

    async getSupplier(ruc: string): Promise<OCDSSupplierResult> {
        const d = await fetch(`${BASE_API}/ocds/suppliers/${ruc}`);
        return d.json();
    }

    async getItemInfo(itemId: string): Promise<OCDSItemResult> {
        const d = await fetch(`${BASE_API}/ocds/items/${itemId}`);
        return d.json();
    }

    async getItemPriceEvolution(id: string): Promise<OCDSItemPriceEvolutionResponse> {
        const d = await fetch(`${BASE_API}/ocds/items/${id}/evolution`);
        return d.json();
    }

    async getItemParties(id: string): Promise<SimpleAPINotPaginatedResult<OCDSItemRelatedParty>> {
        const d = await fetch(`${BASE_API}/ocds/items/${id}/parties`);
        return d.json();
    }

    async getSupplierContracts(ruc: string, pagination: { page: number, pageSize: number }): Promise<PaginatedResult<OCDSSupplierContract>> {
        const d = await fetch(`${BASE_API}/ocds/suppliers/${ruc}/contracts?page=${pagination.page}&size=${pagination.pageSize}`);
        return d.json();
    }

    async getDeclarationsOf(document: string): Promise<PaginatedResult<Affidavit>> {

        const d = await fetch(`${BASE_API}/people/${document}/declarations`);
        return d.json();
    }

    async getAllDeclarations(page: number, size: number): Promise<PaginatedResult<Affidavit>> {

        const d = await fetch(`${BASE_API}/contralory/declarations?page=${page}&size=${size}`);
        return d.json();
    }

    async getBuyerInfo(buyerId: string): Promise<{ data: OCDSBuyer }> {
        const d = await fetch(`${BASE_API}/ocds/buyer/${buyerId}`);
        return d.json();
    }

    async getSuppliersByBuyer(buyerId: string): Promise<SimpleAPINotPaginatedResult<OCDSBuyerWithSuppliers>> {
        return this.doGet(`ocds/buyer/${buyerId}/suppliers`);
    }

    async getGeoJson() {
        const d = await fetch(`${CDN_API}/paraguay.json`);
        return d.json();
    }

    async analysisNetWorth(document: string): Promise<NetWorthIncreaseAnalysis> {
        return this.doGet<NetWorthIncreaseAnalysis>(`analysis/net_worth_increment?document=${document}`);
    }

    async analysisGetYear(document: string, id: number): Promise<DeclarationData> {
        return this.doGet<DeclarationData>(`analysis/net_worth_increment/byDec?document=${document}&id=${id}`);
    }

    async doGet<T>(url: string): Promise<T> {
        const d = await fetch(`${BASE_API}/${url}`)
        if (d.ok)
            return d.json();

        const body = await d.text();
        throw new ApiError(d.statusText, d.status, body);
    }
}
