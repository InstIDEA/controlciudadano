import {Bar} from '@nivo/bar';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {LoadingGraphComponent} from './LoadingGraph';
import {CHART_COLORS} from './PresentedChart';
import {ResponsiveWrapper} from '@nivo/core';

export function ListChart(props: {
    data: ChartData[],
    width: number,
    height: number,
    padRight: number
}) {

    const count = props.data.length;

    return <Bar height={props.height}
                width={props.width}
                data={props.data}
                keys={['Presentados', 'No presentados']}
                indexBy="name"
                margin={{top: 0, right: props.padRight, bottom: 20, left: 50}}
                padding={count < 3 ? 0.6 : 0.2}
                layout="horizontal"
                valueScale={{type: 'linear'}}
                colors={[CHART_COLORS.presented, CHART_COLORS.no_presented]}
                borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
                axisTop={null}
                axisRight={null}
                axisLeft={{
                    tickSize: 4,
                    tickPadding: 4,
                    tickRotation: 0,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
                labelSkipWidth={15}
                labelSkipHeight={15}
                labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
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

    const finalData: ChartData[] = (data || lastShowedData || emptyAgg)
        .buckets.map(element => {
            return {
                name: element.key,
                total: element.doc_count,
                "Presentados": element.presented.doc_count,
                "No presentados": element.doc_count - element.presented.doc_count
            }
        })
        .sort((c1, c2) => c1.total - c2.total)
    ;

    const count = finalData.length;
    return <ResponsiveWrapper>
        {({width, height}) => {
            const finalHeight = Math.max(height, 20 * count);
            const requireScroll = finalHeight > height;
            const finalWidth = requireScroll // if the height is equal to the available, no scroll is needed
                ? width - 10
                : width;
            return <div style={{height, overflowX: 'hidden', overflowY: 'auto', position: 'relative'}}>
                <ListChart data={finalData}
                           width={finalWidth}
                           padRight={15}
                           height={finalHeight}/>
            </div>
        }}
    </ResponsiveWrapper>
}

type ChartData = {
    name: string;
    total: number;
    "Presentados": number;
    "No presentados": number;
}

const emptyAgg: ByListAggregation = {
    buckets: [{
        key: '',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}
