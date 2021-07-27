import {useRedashApi} from "./useApi";
import {AsyncHelper, StatisticsDJBR} from "../Model";


export function useDJBRStats(): StatisticsDJBR {

    const data = useRedashApi(49)

    return AsyncHelper.or(AsyncHelper.map(data, d => d[0]), {
        count_declarations_auths: 4827,
        last_success_fetch: '2021/01/28',
        total_authorities: 113742,
        total_declarations: 758753,
        first_election_year: 1996,
        total_authorities_in_order: 862,
        count_auths_with_decs: 4360,
        last_election_year: 2018,
        total_parsed: 646739,
        count_employees: 348951
    });
}

export function useGlobalStats() {

    const data = useRedashApi(39)

    return AsyncHelper.map(data, d => d[0]);
}
