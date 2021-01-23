import {useEffect, useState} from "react";
import {Affidavit, Async, AsyncHelper, AuthoritiesWithoutDocument, StatisticsDJBR} from "../Model";
import {RedashAPI} from "../RedashAPI";

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

type ApiType<T extends number> =
    T extends 19 ? Affidavit :
        T extends 45 ? AuthoritiesWithoutDocument :
            T extends 49 ? StatisticsDJBR : unknown;
