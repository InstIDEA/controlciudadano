import * as React from 'react';
import {useEffect, useState} from 'react';
import {formatMoney} from '../../formatters';
import {ResponsivePie} from '@nivo/pie';
import {LoadingGraphComponent} from './LoadingGraph';

export const CHART_COLORS = {
    'presented': 'rgb(244, 117, 96)',
    'no_presented': 'rgb(232, 193, 160)'
}

export function PresentedChart(props: {
    data: { id: string, label: string, value: number, color: string }[]
}) {

    return <ResponsivePie
        data={props.data}
        margin={{top: 15, right: 10, bottom: 15, left: 10}}
        innerRadius={0.4}
        padAngle={0.3}
        fit={true}
        cornerRadius={5}
        startAngle={95}
        endAngle={455}
        colors={t => t.data.color}
        borderWidth={2}
        borderColor="white"
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={10}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={-10}
        radialLabelsLinkDiagonalLength={0}
        radialLabelsLinkHorizontalLength={24}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{from: 'color'}}
        sliceLabel={r => formatMoney(r.value)}
        sliceLabelsSkipAngle={10}
        sliceLabelsTextColor="#333333"
        valueFormat={v => formatMoney(v)}
        // motionStiffness={90}
        // motionDamping={15}
        defs={[{
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 0,
            stagger: true
        }, {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        }]}
        legends={[]}
        layers={['slices', 'sliceLabels', 'radialLabels', 'legends', CenteredMetric]}
    />
}

interface PresentedAggregation {
    buckets: { key: string; doc_count: number, key_as_string: string }[]
}

export function PresentedDeclarationChart(props: {
                                              loading: boolean,
                                              aggregations: { "presented.keyword"?: PresentedAggregation }
                                          }
) {

    const data = props.aggregations?.["presented.keyword"];
    const [lastShowedData, setLastShowedData] = useState<PresentedAggregation>();

    useEffect(() => {
        if (data) setLastShowedData(data);
    }, [data])

    if (!data && !lastShowedData)
        return <LoadingGraphComponent/>

    const finalData = (data || lastShowedData || emptyAgg).buckets
        .map((element) => {
            return {
                id: element.key_as_string === 'true' ? 'Presentados' : 'No Presentados',
                label: element.key_as_string === 'true' ? 'Presentados' : 'No Presentados',
                color: element.key_as_string === 'true' ? CHART_COLORS.presented : CHART_COLORS.no_presented,
                value: element.doc_count,
            }
        });
    return <PresentedChart data={finalData}/>
}

const emptyAgg: PresentedAggregation = {
    buckets: [{
        key: '0',
        key_as_string: 'Presentados',
        doc_count: 0,
    }]
}

const CenteredMetric = ({dataWithArc, centerX, centerY}: any) => {
    let presented = 0
    let notPresented = 0;
    dataWithArc.forEach((datum: any) => {
        if (datum.label === "Presentados") presented = datum.value;
        if (datum.label === "No Presentados") notPresented = datum.value;
    })

    const percentage = presented === 0 ? 0 : presented / (presented + notPresented) * 100;

    return (
        <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
                fontSize: '14px',
                fontWeight: 600,
            }}
        >
            {Math.round(percentage)}%
        </text>
    )
}
