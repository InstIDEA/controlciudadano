import * as React from 'react';
import {useEffect, useState} from 'react';
import {LoadingGraphComponent} from './LoadingGraph';
import {ResponsiveTreeMap} from '@nivo/treemap'
import {CHART_COLORS} from './PresentedChart';
import {formatMoney} from '../../formatters';

export function ListChart(props: {
    data: { key: string, "Presentados": number, 'No presentados': number }[]
}) {


    const data = props.data.map(datum => ({
        name: `${datum.key} - Total`,
        children: [{
            name: `${datum.key} - Presentados`,
            color: CHART_COLORS.presented,
            loc: datum.Presentados
        }, {
            name: `${datum.key} - No Presentados`,
            color: CHART_COLORS.no_presented,
            loc: datum["No presentados"]
        }]
    })).slice(0, 10)

    return <ResponsiveTreeMap
        data={{
            name: "Partido político",
            color: "white",
            children: data
        }}
        identity="name"
        value="loc"
        valueFormat={formatMoney as any}
        margin={{top: 0, right: 0, bottom: 0, left: 0}}

        enableParentLabel={true}
        parentLabelTextColor={{from: 'color', modifiers: [['darker', 2]]}}
        parentLabel={((l: { id: string, isLeaf: boolean, width: number }) => {
            if (!l.id || l.isLeaf) return null
            const maxChars = l.width / 8;
            if (l.id.length <= maxChars) return l.id;
            return l.id.substr(0, maxChars) + "..."
        }) as any}

        labelTextColor={{from: 'color', modifiers: [['darker', 1.2]]}}
        labelSkipSize={12}

        borderColor={{from: 'color', modifiers: [['darker', 0.1]]}}
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
                key: element.key,
                "Presentados": element.presented.doc_count,
                "No presentados": element.doc_count - element.presented.doc_count
            }
        });
    return <ListChart data={d}/>
}

const emptyAgg: ByListAggregation = {
    buckets: [{
        key: '',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}
