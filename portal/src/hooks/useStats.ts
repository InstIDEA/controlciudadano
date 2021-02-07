import {useRedashApi} from "./useApi";
import {AsyncHelper} from "../Model";


export function useDJBRStats() {

    const data = useRedashApi(49)

    return AsyncHelper.or(AsyncHelper.map(data, d => d[0]), {
        count_declarations_auths: 4827,
        last_success_fetch: '2021/01/28',
        total_authorities: 113742,
        total_declarations: 707810,
        first_election_year: 1996,
        total_authorities_in_order: 862
    });
}

export function useGlobalStats() {

    const data = useRedashApi(39)

    return AsyncHelper.map(data, d => d[0]);
}
