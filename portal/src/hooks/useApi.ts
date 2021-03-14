import {useCallback, useEffect, useState} from "react";
import {
    Affidavit,
    Async,
    AsyncHelper,
    AuthoritiesWithoutDocument,
    OCDSSupplierRelation,
    StatisticsDJBR
} from "../Model";
import {ApiError, RedashAPI} from "../RedashAPI";

// TODO change this with a data fetcher hook library
export function useRedashApi<T extends number>(id: T): Async<Array<ApiType<T>>, ApiError> {

    const [data, setData] = useState<Async<Array<ApiType<T>>, ApiError>>(AsyncHelper.noRequested());

    useEffect(() => {
        setData(AsyncHelper.fetching());
        new RedashAPI().fetchQuery(id)
            .then(d => setData(AsyncHelper.loaded(d.query_result.data.rows)))
            .catch(e => setData(AsyncHelper.error(e)))
    }, [id])

    return data;
}

export function useApi<ARGS extends any[], T>(
    func: (...params: ARGS) => Promise<T>,
    args: ARGS
): { data: Async<T, ApiError>, refresh: () => void } {


    const caller = useCallback(() => {
            setData(AsyncHelper.fetching())
            func(...args)
                .then(dat => setData(AsyncHelper.loaded(dat)))
                .catch(err => setData(AsyncHelper.error(err)));
        },
        // the user of this hook should not change the request function
        // eslint-disable-next-line
        [...args])
    const [data, setData] = useState<Async<T, ApiError>>(AsyncHelper.noRequested());

    useEffect(() => caller(), [caller])

    return {
        data: data,
        refresh: caller
    };
}

type ApiType<T extends number> =
    T extends 18 ? OCDSSupplierRelation :
        T extends 19 ? Affidavit :
            T extends 45 ? AuthoritiesWithoutDocument :
                T extends 49 ? StatisticsDJBR : unknown;
