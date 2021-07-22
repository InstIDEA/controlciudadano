import {Pool} from "pg";
import {ApiError} from "../index";
import express from "express";

export interface ColumnConfig {
    name: string;
    filterType: 'equals' | 'starts_with' | 'ends_with' | 'contain' | 'no_filter';
    descNullLast?: boolean;
}

export interface DSConfig {
    table: string;
    idColumn?: string;
    columns: Array<ColumnConfig>;
    baseWhere?: Array<{
        column: string;
        val: string;
    }>;
    baseOrder?: Record<string, SortOrder>;
}

export type SortOrder = 'ASC' | 'DESC';

export interface Params {
    filter?: Array<{
        column: string;
        val: string;
    }>;
    page: number;
    size: number;
    order?: Record<string, SortOrder>;
}

const AVAILABLE_SORTS: SortOrder[] = ["ASC", "DESC"];

export class DataTablesService {

    constructor(private pool: Pool) {
    }

    /**
     * TODO: check if it's better to receive here the express req
     * @param config the config of the table
     * @param params the client-side params
     */
    async query(config: DSConfig, params: Params): Promise<{ rows: unknown[], total: number }> {

        // TODO fetch the columns to prevent the usage of extra columns

        const finalConfig = {
            ...config,
            idColumn: 'id',
            columns: (config.columns || []),
            baseWhere: (config.baseWhere || [])
        }

        if (!finalConfig.table) throw new ApiError("Invalid table name", 500, {finalConfig});
        if (!finalConfig.columns.length) throw new ApiError("Invalid column config", 500, {finalConfig});

        const table = config.table;
        const columns = (config.columns || []).map(c => c.name);

        let baseWhere = "1=1";
        let paramIndex = 1; // the first one is the limit and the second the offset

        const currentPage = Math.max(params.page, 1);
        if (!currentPage || isNaN(currentPage)) throw new ApiError("Invalid page", 400, {page: params.page});

        const pageSize = Math.min(params.size, 100);
        if (!pageSize || isNaN(pageSize)) throw new ApiError("Invalid pageSize", 400, {size: params.size});

        const queryParams: Array<unknown> = [];

        const allWhere = [
            ...(finalConfig.baseWhere || []),
            ...(params.filter || [])
        ].filter(f => !!f);

        const allSort = {
            ...finalConfig.baseOrder,
            ...params.order,
        }

        for (const filter of allWhere) {
            if (!columns.includes(filter.column)) {
                throw new ApiError("Invalid column name", 400, {column: filter.column});
            }
            const localConfig = getColumnConfig(config.columns, filter.column);
            const paramWhereConfig = getParamString(localConfig, filter.val);
            baseWhere += ` AND t.${filter.column} ${paramWhereConfig.operator} \$${paramIndex++}`;
            queryParams.push(paramWhereConfig.val);
        }

        let baseSort = `${config.idColumn} DESC`;
        console.log(allSort)
        for (const orderColumn of Object.keys(allSort)) {
            let orderDir: string = allSort[orderColumn];
            const cConfig = getColumnConfig(finalConfig.columns, orderColumn);
            if (!columns.includes(orderColumn)) {
                throw new ApiError("Invalid column name", 400, {column: orderColumn});
            }
            const sortDirection = orderDir || 'ASC';
            if (!verifySort(sortDirection)) {
                throw new ApiError("Invalid sort direction", 400, {sortDirection});
            }
            if (cConfig.descNullLast && orderDir === 'DESC') orderDir = 'DESC NULLS LAST';
            baseSort = `t.${orderColumn} ${orderDir}, ${baseSort}`;
        }

        const finalQuery = `
            SELECT ${columns.join(', ')}
            FROM ${table} t
            WHERE ${baseWhere}
            ORDER BY ${baseSort}
            LIMIT \$${paramIndex} OFFSET \$${paramIndex + 1}`;
        const whereParams = [...queryParams, pageSize, (currentPage - 1) * pageSize];

        console.log("Executing query", finalQuery, whereParams);
        const [result, totalCount] = await Promise.all([
            this.pool.query(finalQuery, whereParams),
            this.pool.query(`SELECT count(*) FROM ${table} t WHERE ${baseWhere}`, queryParams)
        ]);

        const total = getCountFromResult(totalCount.rows);
        console.log(`Fetched ${result.rowCount} of a total of ${total}`);

        return {
            rows: result.rows,
            total
        };
    }


    extractColumnFilter(req: express.Request["query"], config: ColumnConfig[]): Params["filter"] {

        return Object.keys(req)
            .filter(key => !!getColumnConfig(config, key))
            .map(key => {

                const paramVal = req[key];

                return {
                    column: key,
                    val: Array.isArray(paramVal)
                        ? paramVal.join(",")
                        : `${paramVal}`
                }
            });
    }

    extractSortOrder(query: express.Request["query"], columns: ColumnConfig[]): Params["order"] {

        const toRet: Record<string, SortOrder> = {};

        for (const key of Object.keys(query)) {
            console.log('checking', key);
            if (!key.endsWith(".order")) continue;

            const columnName = key.substr(0, key.indexOf(".order"));
            const whereConfig = getColumnConfig(columns, columnName);

            if (!whereConfig) {
                throw new ApiError("Invalid sort order", 400, {column: columnName, sortOption: query[key]});
            }

            const val = `${query[key]}`.toUpperCase();

            if (verifySort(val)) {
                toRet[columnName] = val;
            } else {
                throw new ApiError("Invalid sort order", 400, {column: key, sortOption: query[key]});
            }
        }

        return toRet;
    }
}


function getColumnConfig(config: ColumnConfig[], column: string): ColumnConfig | null {
    if (!column) return null;

    for (const conf of config) {
        if (conf.name !== column) continue;
        return conf;
    }

    return null;
}

function getParamString(config: DSConfig["columns"][0], val: string): { operator: string, val: unknown } {
    switch (config.filterType) {
        case "contain":
            return {operator: 'ilike', val: `%${val}%`};
        case "ends_with":
            return {operator: 'ilike', val: `${val}%`};
        case "equals":
            return {operator: '=', val: `${val}`};
        case "starts_with":
            return {operator: 'ilike', val: `%${val}`};
        case "no_filter":
            throw new ApiError('You can filter with this column', 400, {name: config.name});
        default:
            throw new ApiError("Invalid config", 500, {config});
    }
}

function getCountFromResult(rows: any[]): number {
    for (const row of (rows || [])) {
        if (typeof row === 'number') return row;
        if ('count' in row) {
            return parseInt(row.count);
        }
    }
    return 0;
}

function verifySort(val: string): val is SortOrder {
    return AVAILABLE_SORTS.includes(val as SortOrder);
}
