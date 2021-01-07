import * as React from 'react';
import {useEffect, useState} from 'react';
import {LoadingGraphComponent} from './LoadingGraph';
import {ChartData, ListChart} from './ListChart';

interface ByChargeAggregation {
    buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[]
}

export function ByChargeChart(props: {
    loading: boolean;
    aggregations: { "charge.keyword"?: ByChargeAggregation };
    width: number;
    height: number;
    inPopup: boolean;
    requestModal: () => void;
}) {

    const data = props.aggregations?.["charge.keyword"];
    const [lastShowedData, setLastShowedData] = useState<ByChargeAggregation>();

    useEffect(() => {
        if (data) setLastShowedData(data);
    }, [data])


    if (!data && !lastShowedData) return <LoadingGraphComponent/>;

    const originalLength = (data || lastShowedData || emptyAgg).buckets.length;
    const numberOfItemsThatFit = props.inPopup ? 9_000 : Math.floor(props.height / 25);
    const finalData: ChartData[] = (data || lastShowedData || emptyAgg)
        .buckets.map(element => {
            return {
                name: element.key,
                label: element.key,
                total: element.doc_count,
                "Presentados": element.presented.doc_count,
                "No presentados": element.doc_count - element.presented.doc_count
            };
        })
        .sort((c1, c2) => c2.total - c1.total)
        .slice(0, numberOfItemsThatFit)
        .sort((c1, c2) => c1.total - c2.total)
    ;

    const showDisclaimer = numberOfItemsThatFit < originalLength;
    const finalHeight = showDisclaimer ? props.height - 18 : props.height;

    return <div>
        <ListChart data={finalData}
                   width={props.width}
                   padRight={15}
                   height={finalHeight}
                   leftTickOnlyInitials
        />
        {showDisclaimer &&
        <div style={{
            textAlign: 'center',
            width: '100%',
            fontSize: '0.7em',
            textDecoration: 'underline',
            cursor: 'pointer'
        }}
             onClick={props.requestModal}>Presiona para ver todos los tipos</div>}
    </div>
}

const emptyAgg: ByChargeAggregation = {
    buckets: [{
        key: '',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}
