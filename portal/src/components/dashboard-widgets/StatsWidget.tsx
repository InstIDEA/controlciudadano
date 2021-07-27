import {Async} from "../../Model";
import {ApiError} from "../../RedashAPI";
import {Statistic} from "antd";
import React from "react";
import {Widget} from "./BaseWidget";

export function StatsWidget(props: { title: string, precision: number, data: Async<string | number, ApiError> }) {
    return <Widget title={undefined}
                   data={props.data}
                   children={value => <Statistic
                       title={props.title}
                       value={value}
                       precision={props.precision}
                   />}/>

}
