import {RedashAPI} from "../RedashAPI";
import {useRedashApi} from "./useApi";
import {AsyncHelper} from "../Model";


export function useDJBRStats() {

    const data = useRedashApi(new RedashAPI().getDJBRStatistics)

    return AsyncHelper.or(AsyncHelper.map(data, d => d[0]), {
        count_declarations_auths: 1273,
        last_success_fetch: '2020/12/26',
        total_authorities: 113742,
        total_declarations: 13067
    });
}
