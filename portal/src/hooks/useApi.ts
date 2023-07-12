import {useCallback, useEffect, useState} from "react";
import {
    Affidavit,
    Async,
    AsyncHelper,
    AuthoritiesWithoutDocument,
    GlobalStatistics,
    OCDSSupplierRelation,
    StatisticsDJBR,
    VideoTutorialesSemillas
} from "../Model";
import {ApiError, RedashAPI} from "../RedashAPI";
import {NetWorthIncreaseAnalysis} from "../APIModel";
import {SimpleApi} from "../SimpleApi";

const cacheEnabled = import.meta.env.DEV

// TODO change this with a data fetcher hook library
export function useRedashApi<T extends number>(id: T): Async<Array<ApiType<T>>, ApiError> {

    const [data, setData] = useState<Async<Array<ApiType<T>>, ApiError>>(AsyncHelper.noRequested());

    useEffect(() => {
        setData(AsyncHelper.fetching());

        const cacheKey = "cache_" + id;
        const cached = cacheEnabled
            ? localStorage.getItem(cacheKey)
            : undefined;

        if (cached) {
            setData(JSON.parse(cached));
            return;
        }

        new RedashAPI().fetchQuery(id)
            .then(d => {
                console.log('response from redash ', d);
                if (cacheEnabled)
                    localStorage.setItem(cacheKey, JSON.stringify(AsyncHelper.loaded(d.query_result.data.rows)));
                setData(AsyncHelper.loaded(d.query_result.data.rows));
            })
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

            const cacheKey = "cache_" + args.join('_');
            const cached = cacheEnabled
                ? localStorage.getItem(cacheKey)
                : undefined;

            if (cached) {
                setData(JSON.parse(cached));
                return;
            }

            func(...args)
                .then(dat => {
                    if (cacheEnabled)
                        localStorage.setItem(cacheKey, JSON.stringify(AsyncHelper.loaded(dat)));
                    setData(AsyncHelper.loaded(dat));
                })
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

export function useNetWorthAnalysis(doc: string): Async<NetWorthIncreaseAnalysis, ApiError> {

    const [data, setData] = useState<Async<NetWorthIncreaseAnalysis, ApiError>>(AsyncHelper.fetching());

    useEffect(() => {
        setData(AsyncHelper.fetching());

        const cached = cacheEnabled
            ? localStorage.getItem("cache_" + doc)
            : undefined;

        if (!cached) {
            new SimpleApi().analysisNetWorth(doc)
                .then(d => {
                    if (cacheEnabled)
                        localStorage.setItem("cache_" + doc, JSON.stringify(AsyncHelper.loaded(d)));
                    setData(AsyncHelper.loaded(d));
                })
                .catch(e => setData(AsyncHelper.error(e)))
        } else {
            setData(JSON.parse(cached));
        }

    }, [doc])

    return data;
}

type ApiType<T extends number> =
    T extends 18 ? OCDSSupplierRelation :
        T extends 19 ? Affidavit :
            T extends 45 ? AuthoritiesWithoutDocument :
                T extends 49 ? StatisticsDJBR :
                    T extends 39 ? GlobalStatistics :
                        T extends 48 ? VideoTutorialesSemillas : unknown;
