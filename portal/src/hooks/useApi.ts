import {useEffect, useState} from "react";
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

const cacheEnabled = true;

// TODO change this with a data fetcher hook library
export function useRedashApi<T extends number>(id: T): Async<Array<ApiType<T>>> {

    const [data, setData] = useState<Async<Array<ApiType<T>>>>(AsyncHelper.noRequested());

    useEffect(() => {
        setData(AsyncHelper.fetching());
        new RedashAPI().fetchQuery(id)
            .then(d => setData(AsyncHelper.loaded(d.query_result.data.rows)))
            .catch(e => setData(AsyncHelper.error(e)))
    }, [id])

    return data;
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
