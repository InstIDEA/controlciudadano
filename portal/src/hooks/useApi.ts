import {useEffect, useState} from "react";
import {Async, AsyncHelper} from "../Model";
import {BaseRedashResponse} from "../RedashAPI";

// TODO change this with a data fetcher hook library
export function useRedashApi<T>(producer: () => Promise<BaseRedashResponse<T>>): Async<T[]> {

    const [data, setData] = useState<Async<T[]>>(AsyncHelper.noRequested());

    useEffect(() => {
        setData(AsyncHelper.fetching());
        producer()
            .then(d => setData(AsyncHelper.loaded(d.query_result.data.rows)))
            .catch(e => setData(AsyncHelper.error(e)))
        // eslint-disable-next-line
    }, [])

    return data;
}
