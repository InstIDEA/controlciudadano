import * as React from 'react';
import {useEffect, useState} from 'react';
import {formatMoney} from '../../formatters';
import {ResponsivePie} from '@nivo/pie';
import {LoadingGraphComponent} from './LoadingGraph';

const NAMES: Record<string, string> = {
    'true': 'Presentados',
    'false': 'No Presentados',
    'presented': 'Presentados',
    'notPresented': 'No presentados'
}

export function PresentedChart(props: {
    data: { id: string, label: string, value: number }[]
}) {

    return <ResponsivePie
        data={props.data}
        margin={{top: 15, right: 10, bottom: 15, left: 10}}
        innerRadius={0.5}
        padAngle={0.0}
        cornerRadius={3}
        colors={{scheme: 'nivo'}}
        borderWidth={1}
        borderColor={{from: 'color', modifiers: [['darker', 0.2]]}}
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={10}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={-10}
        radialLabelsLinkDiagonalLength={0}
        radialLabelsLinkHorizontalLength={24}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{from: 'color'}}
        sliceLabel={r => formatMoney(r.value)}
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        radialLabel={v => NAMES[v.id]}
        tooltipFormat={v => formatMoney(v)}
        motionStiffness={90}
        motionDamping={15}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 0,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        legends={[{
            anchor: 'right',
            direction: 'column',
            translateY: 56,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#999',
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [{
                on: 'hover',
                style: {
                    itemTextColor: '#000'
                }
            }
            ]
        }
        ]}
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

    const finalData = (data || lastShowedData || emptyAgg).buckets.map((element) => {
        return {
            id: element.key_as_string.toString(),
            label: element.key_as_string === 'true' ? 'Presentados' : 'No Presentados',
            value: element.doc_count
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
