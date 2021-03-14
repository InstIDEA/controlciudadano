import React from "react";
import {Button, Result} from "antd";
import {Async} from "../Model";
import {Loading} from "./Loading";
import {ApiError} from "../RedashAPI";


export function AsyncRenderer<T>(props: {
    resourceName: string;
    data: Async<T, ApiError>;
    errorMsg?: string;
    refresh?: () => void;
    loadingText?: string | string[];
    children: (data: T) => React.ReactNode;
}) {

    switch (props.data.state) {
        case "ERROR":
            return <Result status={getStatus(props.data.error)}
                           title={props.errorMsg || "Error obteniendo información"}
                           extra={[
                               <Button key="console" onClick={props.refresh}>
                                   Reintentar
                               </Button>,
                           ]}
            />;
        case "FETCHING":
            return <Loading text={props.loadingText}/>
        case "LOADED":
            return <>{props.children(props.data.data)}</>
        case "NO_REQUESTED":
        default:
            return <Result title={props.resourceName}/>
    }
}

function getStatus(error: Error) {
    if (error instanceof ApiError) {
        return error.asSimpleCode()
    }
    return '500';
}
