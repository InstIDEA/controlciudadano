import {Bar} from '@nivo/bar';
import * as React from 'react';
import {CSSProperties, useEffect, useState} from 'react';
import {LoadingGraphComponent} from './LoadingGraph';
import {CHART_COLORS} from './PresentedChart';
import {ResponsiveWrapper, useTheme} from '@nivo/core';
import {formatMoney, getInitials} from '../../formatters';
import {animated} from 'react-spring'

export function ListChart(props: {
    data: ChartData[],
    width: number,
    height: number,
    padRight: number,
    leftTickOnlyInitials: boolean
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
                labelFormat={formatMoney}
                valueFormat={formatMoney}
                axisLeft={{
                    tickSize: 4,
                    tickPadding: 4,
                    tickRotation: 0,
                    legend: '',
                    legendPosition: 'middle',
                    renderTick: props.leftTickOnlyInitials ? InitialsTick : undefined,
                    legendOffset: -40
                }}
                axisBottom={{
                    tickSize: 5,
                    tickValues: 4,
                    tickPadding: 5,
                    tickRotation: 0,
                    renderTick: AxisTick,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: 0
                }}
                labelSkipWidth={10}
                labelSkipHeight={12}
                labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}
                animate={true}
    />
}

interface ByListAggregation {
    buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[]
}

export function ByListChart(props: {
    loading: boolean;
    aggregations: { "list.keyword"?: ByListAggregation };
    width: number;
    height: number;
    inPopup: boolean;
    requestModal: () => void;
}) {

    const data = props.aggregations?.["list.keyword"];
    const [lastShowedData, setLastShowedData] = useState<ByListAggregation>();

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
                   leftTickOnlyInitials={false}
                   height={finalHeight}/>
        {showDisclaimer &&
        <div style={{
            textAlign: 'center',
            width: '100%',
            fontSize: '0.7em',
            textDecoration: 'underline',
            cursor: 'pointer'
        }}
             onClick={props.requestModal}>Presiona para ver todos los partidos</div>}
    </div>

}

export function ScrollableResponsiveBar(props: {
    data: ChartData[]
}) {
    const count = props.data.length;
    return <ResponsiveWrapper>
        {({width, height}) => {
            const finalHeight = Math.max(height, 25 * count);
            const requireScroll = finalHeight > height;
            const finalWidth = requireScroll // if the height is equal to the available, no scroll is needed
                ? width - 10
                : width;
            return <div style={{height, overflowX: 'hidden', overflowY: 'auto'}}>
                <ListChart data={props.data}
                           width={finalWidth}
                           leftTickOnlyInitials={false}
                           padRight={15}
                           height={finalHeight}/>
            </div>
        }}
    </ResponsiveWrapper>
}

export type ChartData = {
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

// TODO check if this can be replaced with a `format: formatMoney`
const AxisTick = ({
                      value: _value,
                      format,
                      lineX,
                      lineY,
                      onClick,
                      textBaseline,
                      textAnchor,
                      animatedProps,
                  }: any) => {
    const theme = useTheme()

    let value = _value
    if (format !== undefined) {
        value = format(value)
    }

    let gStyle: CSSProperties = {opacity: animatedProps.opacity}
    if (onClick) {
        gStyle['cursor'] = 'pointer'
    }

    return (
        <animated.g
            transform={animatedProps.transform}
            {...(onClick ? {onClick: e => onClick(e, value)} : {})}
            style={gStyle as any}
        >
            <line x1={0} x2={lineX} y1={0} y2={lineY} style={theme.axis.ticks.line}/>
            <animated.text
                dominantBaseline={textBaseline}
                textAnchor={textAnchor}
                transform={animatedProps.textTransform}
                style={theme.axis.ticks.text as any}
            >
                {formatMoney(value)}
            </animated.text>
        </animated.g>
    )
}

// TODO check if this can be replaced with a `format: getInitials`
const InitialsTick = ({
                          value: _value,
                          format,
                          lineX,
                          lineY,
                          onClick,
                          textBaseline,
                          textAnchor,
                          animatedProps,
                      }: any) => {
    const theme = useTheme()

    let value = _value
    if (format !== undefined) {
        value = format(value)
    }

    let gStyle: CSSProperties = {opacity: animatedProps.opacity}
    if (onClick) {
        gStyle['cursor'] = 'pointer'
    }

    return (
        <animated.g
            transform={animatedProps.transform}
            {...(onClick ? {onClick: e => onClick(e, value)} : {})}
            style={gStyle as any}
        >
            <line x1={0} x2={lineX} y1={0} y2={lineY} style={theme.axis.ticks.line}/>
            <animated.text
                dominantBaseline={textBaseline}
                textAnchor={textAnchor}
                transform={animatedProps.textTransform}
                style={theme.axis.ticks.text as any}
            >
                {getInitials(value)}
            </animated.text>
        </animated.g>
    )
}
