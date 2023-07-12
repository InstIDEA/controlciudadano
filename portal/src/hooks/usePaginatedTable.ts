/**
 * Simple datasource that keeps reference to the current and previous pages
 *
 */
import {Async, AsyncHelper} from "../Model";
import {ApiError} from "../RedashAPI";
import {useCallback, useEffect, useRef, useState} from "react";
import {SimpleApi} from "../SimpleApi";
import {SorterResult} from "antd/es/table/interface";
import {TablePaginationConfig} from "antd/lib/table";

export interface APIResponse<T> {
    rows: T[];
    total: number;
}

export interface TableDS<T> {

    /**
     * The current data
     */
    current: Async<APIResponse<T>>;

    /**
     * The last fetched data.
     *
     * Used to keep the pagination in place and to present
     * a different view the first time and the subsequent
     * page changes.
     */
    previous?: APIResponse<T>;

}

export const TDHelper = {
    noRequested: function <T>(): TableDS<T> {
        return {
            current: AsyncHelper.noRequested()
        }
    },
    beginLoadPage: function <T>(prev: TableDS<T>): TableDS<T> {
        return {
            current: AsyncHelper.fetching(),
            previous: prev.current.state === 'LOADED' ? prev.current.data : undefined
        };
    },
    finishLoadPage: function <T>(newData: APIResponse<T>) {
        return function (prev: TableDS<T>): TableDS<T> {
            return {
                current: AsyncHelper.loaded(newData),
                previous: prev.current.state === 'LOADED' ? prev.current.data : undefined
            };
        }
    },
    mapAndFinish: function <S, T>(newData: APIResponse<S>, mapper: (s: S) => T) {
        return function (prev: TableDS<T>): TableDS<T> {
            return {
                current: AsyncHelper.loaded({
                    ...newData,
                    rows: newData.rows.map(mapper)
                }),
                previous: prev.current.state === 'LOADED' ? prev.current.data : undefined
            };
        }
    },
    map: function <S, T>(ds: TableDS<S>, mapper: (s: S) => T): TableDS<T> {
        let curr: Async<APIResponse<T>>;
        if (ds.current.state === 'LOADED') {
            curr = {
                state: 'LOADED',
                data: {
                    ...ds.current.data,
                    rows: ds.current.data.rows.map(mapper)
                }
            }
        } else {
            curr = {
                ...ds.current
            }
        }
        return {
            current: curr,
            previous: ds.previous ? {...ds.previous, rows: ds.previous.rows.map(mapper)} : undefined
        }
    },
    error: function <T>(error: ApiError) {
        return function (prev: TableDS<T>): TableDS<T> {
            return {
                current: AsyncHelper.error(error),
                previous: prev.current.state === 'LOADED' ? prev.current.data : undefined
            };
        }
    },
};

interface TableQueryConfig<T> {
    page: number,
    size: number,
    filter: Partial<T>,
    sorting: Record<string, string>
}

export function usePaginatedTable<T>(
    url: string
) {


    const [data, setData] = useState<TableDS<T>>(TDHelper.noRequested());

    const [config, setConfig] = useState<TableQueryConfig<T>>({
        page: 1,
        size: 10,
        filter: {},
        sorting: {}
    })

    const lastPromise = useRef<Promise<APIResponse<T>>>();


    const loadData = useCallback(async (newConf: TableQueryConfig<T>) => {
        setData(TDHelper.beginLoadPage);
        const currentPromise = new SimpleApi().doGet<APIResponse<T>>(buildUrl(url, newConf.filter, {
            page: newConf.page,
            size: newConf.size,
        }, newConf.sorting));
        lastPromise.current = currentPromise;
        try {
            const response = await currentPromise;
            if (lastPromise.current !== currentPromise) return;
            setData(TDHelper.finishLoadPage(response))
        } catch (e) {
            if (lastPromise.current !== currentPromise) return;
            if (e instanceof ApiError) {
                setData(TDHelper.error(e))
            } else {
                console.log('unhandled error', e);
                setData(TDHelper.error(new ApiError("error", 500, "")));
            }

        }
    }, [url]);

    const refresh = useCallback(() => {
        loadData(config);
    }, [loadData, config]);

    useEffect(() => {
        refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    let rows: T[] = [];
    let total: number = 0;
    if (data.current.state === 'LOADED') {
        rows = data.current.data.rows;
        total = data.current.data.total;
    } else if (data.previous) {
        rows = data.previous.rows;
        total = data.previous.total;
    }

    console.log(data);

    // TODO: evaluate usage of a effect to check for changes on config
    return {
        hasError: data.current.state === 'ERROR',
        isLoading: data.current.state === 'FETCHING',
        firstLoad: data.current.state === 'FETCHING' && !data.previous,
        rows,
        page: config.page,
        total,
        size: config.size,
        filters: config.filter,
        refresh,
        updateFilters: (newF: Partial<T>) => {
            setConfig(cf => ({...cf, filters: newF}));
            loadData({...config, filter: newF});
        },
        setPage: (newP: number) => {
            setConfig(cf => ({...cf, page: newP}));
            loadData({...config, page: newP});
        },
        setPageSize: (newSize: number) => {
            setConfig(cf => ({...cf, size: newSize}));
            loadData({...config, size: newSize});
        },
        setSort: (newOptions: Record<string, string | undefined>) => {
            setConfig(cf => ({...cf, sorting: removeUndefined(newOptions)}));
            loadData({...config, sorting: removeUndefined(newOptions)});
        },
        onChange: (
            pagination: TablePaginationConfig,
            filter: unknown,
            newOptions: SorterResult<T> | SorterResult<T>[]
        ) => {
            const newSorting = mapFromAntd(newOptions);

            setConfig(cf => ({
                ...cf,
                sorting: newSorting,
                page: pagination.current || 1,
                size: pagination.pageSize || 10
            }));

            loadData({
                ...config,
                sorting: newSorting,
                page: pagination.current || 1,
                size: pagination.pageSize || 10
            });
        }
    };
}

function encodeAsQueryURL(obj: Record<string, string>) {
    return new URLSearchParams(obj).toString();
}

function buildUrl(base: string,
                  filters: object,
                  pagination: object,
                  sorting: Record<string, string>) {

    const sortObj: Record<string, string> = {};
    for (const key in sorting) {
        if (!sorting.hasOwnProperty(key)) continue;
        sortObj[`${key}.order`] = sorting[key];
    }

    return `${base}?${encodeAsQueryURL({...pagination, ...filters, ...sortObj})}`;
}

function removeUndefined(param: Record<string, string | undefined>): Record<string, string> {
    const toRet: Record<string, string> = {};
    for (const key in param) {
        if (!param.hasOwnProperty(key)) continue;
        const val = param[key];
        if (val !== undefined) {
            toRet[key] = val;
        }
    }
    return toRet;
}

function mapFromAntd<T>(newOptions: SorterResult<T> | SorterResult<T>[]) {
    const asArr = Array.isArray(newOptions)
        ? newOptions
        : [newOptions];

    return asArr.reduce((result, curr) => {
        const field = curr.field;
        if (!field
            || !curr.order
            || typeof field != 'string'
        ) return result;
        result[field] = curr.order === 'descend'
            ? 'DESC'
            : 'ASC';
        return result;
    }, {} as Record<string, string>)
}
