import {BarDatum, ResponsiveBar} from "@nivo/bar";
import {formatMoney, millionFormatter} from "../../formatters";
import * as React from "react";
import {Widget} from "./BaseWidget";
import {ApiError} from "../../RedashAPI";
import {Async} from "../../Model";

export function BarWidget(props: {
    data: Async<Array<BarDatum>, ApiError>,
    indexBy?: string,
    title: string,
    leftLegend?: string,
    keys: string[]
}) {

    return <Widget title={props.title}
                   data={props.data}
                   height={300}
                   children={value => <Bar
                       keys={props.keys}
                       data={value}
                       indexBy={props.indexBy}
                       leftLegend={props.leftLegend}
                   />}/>
}


function Bar(props: {
    keys: Array<string>,
    data: Array<BarDatum>,
    indexBy?: string,
    leftLegend?: string
}) {
    console.log(props.data);

    return <ResponsiveBar
        data={props.data}
        keys={props.keys}
        indexBy={props.indexBy ?? 'key'}
        margin={{top: 10, right: 10, bottom: 20, left: 10}}
        padding={0.2}
        enableGridX={false}
        enableGridY={false}
        groupMode="grouped"
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
            tickSize: 4,
            tickPadding: 5,
            tickRotation: 0,
            legend: null
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickValues: 0,
            legend: props.leftLegend || 'Monto (Gs.)',
            legendPosition: 'middle'
        }}

        labelFormat={millionFormatter}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}
        valueFormat={formatMoney}
        animate={true}
    />
}
