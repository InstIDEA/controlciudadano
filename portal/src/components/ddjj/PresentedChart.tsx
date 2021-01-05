import * as React from 'react';
import {useEffect, useState} from 'react';
import {formatMoney} from '../../formatters';
import {ResponsivePie} from '@nivo/pie';
import {LoadingGraphComponent} from './LoadingGraph';

export const CHART_COLORS = {
    'presented': '#ccebc5',
    'no_presented': '#fbb4ae'
}

export function PresentedChart(props: {
    data: { id: string, label: string, value: number, color: string }[]
}) {

    return <ResponsivePie
        data={props.data}
        margin={{top: 0, right: 0, bottom: 0, left: 0}}
        innerRadius={0.20}
        padAngle={0.0}
        fit={true}
        cornerRadius={5}
        startAngle={97}
        endAngle={457}
        colors={t => t.data.color}
        borderWidth={2}
        borderColor="white"
        enableRadialLabels={false}
        enableSliceLabels={false}

        valueFormat={v => formatMoney(v)}
        // motionStiffness={90}
        // motionDamping={15}
        legends={[{
            anchor: 'right',
            direction: 'column',
            justify: false,
            translateX: -20,
            translateY: 0,
            itemsSpacing: 0,
            itemWidth: 120,
            itemHeight: 20,
            itemTextColor: '#999',
            itemDirection: 'right-to-left',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
                {
                    on: 'hover',
                    style: {
                        itemTextColor: '#000'
                    }
                }
            ]
        }]}
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
            const label = element.key_as_string === 'true' ? 'Presentados' : 'No Presentados';
            return {
                id: label,
                label: `${label}: ${formatMoney(element.doc_count)}`,
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
            {percentage.toPrecision(2)}%
        </text>
    )
}
