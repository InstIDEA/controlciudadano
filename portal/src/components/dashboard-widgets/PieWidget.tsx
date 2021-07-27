import {formatMoney} from "../../formatters";
import * as React from "react";
import {Widget} from "./BaseWidget";
import {ApiError} from "../../RedashAPI";
import {Async} from "../../Model";
import {ResponsivePie} from "@nivo/pie";

export function PieWidget(props: {
    data: Async<Array<object>, ApiError>,
    indexBy?: string,
    title: string,
    keys: string[]
}) {

    return <Widget title={props.title}
                   data={props.data}
                   height={300}
                   children={value => <Pie
                       keys={props.keys}
                       data={value}
                       indexBy={props.indexBy}
                   />}/>
}


function Pie(props: {
    keys: Array<string>,
    data: Array<object>,
    indexBy?: string,
}) {
    return <ResponsivePie
        data={props.data}
        margin={{top: 0, right: 0, bottom: 10, left: 0}}
        innerRadius={0.20}
        padAngle={0.0}
        fit={true}
        cornerRadius={5}
        startAngle={90}
        endAngle={450}
        borderWidth={2}
        borderColor="white"
        colors={{scheme: 'nivo'}}
        enableRadialLabels={false}
        enableSliceLabels={false}

        valueFormat={formatMoney}
    />
}
