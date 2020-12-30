import * as React from 'react';
import {useEffect, useState} from 'react';
import {LoadingGraphComponent} from './LoadingGraph';
import {ResponsiveSunburst} from '@nivo/sunburst';
import {formatMoney} from '../../formatters';

export function ListChart(props: {
    data: SunburstData
}) {

    return <ResponsiveSunburst
        data={props.data}
        margin={{top: 10, right: 10, bottom: 10, left: 10}}
        id="name"
        value="value"
        cornerRadius={2}
        borderWidth={1}
        valueFormat={formatMoney}
        borderColor="white"
        colors={{scheme: 'pastel1'}}
        childColor={{from: 'color'}}
        animate={true}
        motionConfig="gentle"
        isInteractive={true}

    />
}

interface ByListAggregation {
    buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[]
}

export function ByListChart(props: {
    loading: boolean,
    aggregations: { "list.keyword"?: ByListAggregation }
}) {

    const data = props.aggregations?.["list.keyword"];
    const [lastShowedData, setLastShowedData] = useState<ByListAggregation>();

    useEffect(() => {
        if (data) setLastShowedData(data);
    }, [data])


    if (!data && !lastShowedData) return <LoadingGraphComponent/>;

    const d = (data || lastShowedData || emptyAgg)
        .buckets.map(element => {
            return {
                name: element.key + " No presentado",
                value: element.doc_count - element.presented.doc_count,
                children: [
                    {
                        name: element.key + " Presentado",
                        value: element.presented.doc_count,
                    }
                ]
            }
        });
    const finalData: SunburstData = {
        name: "list",
        children: d
    }
    return <ListChart data={finalData}/>
}

interface SunburstData {
    name: string;
    children: {
        name: string;
        value: number;
        children: {
            name: string;
            value: number;
        }[];
    }[];
}

const emptyAgg: ByListAggregation = {
    buckets: [{
        key: '',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}
