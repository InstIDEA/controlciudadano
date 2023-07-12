import * as React from 'react';
import {useEffect, useState} from 'react';
import {ResponsiveBar} from '@nivo/bar';
import {formatMoney} from '../../formatters';
import {LoadingGraphComponent} from './LoadingGraph';
import {CHART_COLORS} from './PresentedChart';


export function SexChart(props: {
    m: { presented: number, notPresented: number },
    f: { presented: number, notPresented: number }
}) {

    const data = [{
        key: 'Masculino',
        "Presentados": props.m.presented,
        "No presentados": props.m.notPresented,
    }, {
        key: 'Femenino',
        "Presentados": props.f.presented,
        "No presentados": props.f.notPresented
    }];
    return <ResponsiveBar
        data={data}
        keys={['Presentados', 'No presentados']}
        indexBy="key"
        margin={{top: 10, right: 10, bottom: 20, left: 10}}
        padding={0.6}
        colors={[CHART_COLORS.presented, CHART_COLORS.no_presented]}

        enableGridX={false}
        enableGridY={false}

        borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
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
        valueFormat={formatMoney}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}



        animate={true}
    />
}

interface BySexAggregation {
    buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[]
}

export function BySexChart(props: {
    loading: boolean,
    aggregations: { "sex.keyword"?: BySexAggregation }
}) {

    const data = props.aggregations?.["sex.keyword"];
    const [lastShowedData, setLastShowedData] = useState<BySexAggregation>();

    useEffect(() => {
        if (data) setLastShowedData(data);
    }, [data])


    if (!data && !lastShowedData) return <LoadingGraphComponent/>;

    const chart = {m: {presented: 0, notPresented: 0}, f: {presented: 0, notPresented: 0}};
    (data || lastShowedData || emptyAgg).buckets.forEach(element => {
        if (!element.presented) return;
        if (element.key === 'M') {
            chart.m.presented = element.presented.doc_count;
            chart.m.notPresented = element.doc_count - element.presented.doc_count;
        }
        if (element.key === 'F') {
            chart.f.presented = element.presented.doc_count;
            chart.f.notPresented = element.doc_count - element.presented.doc_count;
        }
    });
    return <SexChart m={chart.m} f={chart.f}/>
}

const emptyAgg: BySexAggregation = {
    buckets: [{
        key: 'M',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}
