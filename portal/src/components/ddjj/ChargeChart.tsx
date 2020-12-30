import * as React from 'react';
import {useEffect, useState} from 'react';
import {ResponsiveBar} from '@nivo/bar';
import {formatMoney} from '../../formatters';
import {LoadingGraphComponent} from './LoadingGraph';
import {CHART_COLORS} from './PresentedChart';


export function ChargeChart(props: {
    data: { key: string, "Presentados": number, 'No presentados': number }[]
}) {

    return <ResponsiveBar
        data={props.data}
        keys={['Presentados', 'No presentados']}
        colors={[CHART_COLORS.presented, CHART_COLORS.no_presented]}
        indexBy="key"
        margin={{top: 10, right: 10, bottom: 20, left: 10}}
        padding={0.2}
        enableGridX={false}
        enableGridY={false}
        defs={[{
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: '#38bcb2',
            size: 4,
            padding: 1,
            stagger: true
        }, {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: '#eed312',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        }
        ]}
        borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 1,
            tickPadding: 2,
            legendPosition: 'start',
            tickRotation: -45,
            legend: null,
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickValues: 0,
            legend: 'Cantidad',
            legendPosition: 'middle'
        }}

        labelFormat={formatMoney}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}
        tooltipFormat={formatMoney}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
    />
}

interface ByChargeAggregation {
    buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[]
}

export function ByChargeChart(props: {
    loading: boolean,
    aggregations: { "charge.keyword"?: ByChargeAggregation }
}) {

    const data = props.aggregations?.["charge.keyword"];
    const [lastShowedData, setLastShowedData] = useState<ByChargeAggregation>();

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
    return <ChargeChart data={d}/>
}

const emptyAgg: ByChargeAggregation = {
    buckets: [{
        key: '',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}
