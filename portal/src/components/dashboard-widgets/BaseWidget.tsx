import {Async} from "../../Model";
import {ApiError} from "../../RedashAPI";
import React from "react";
import {Button, Col, Result} from "antd";
import {getStatus} from "../AsyncRenderer";
import {Loading} from "../Loading";
import './BaseWidget.css';

export function Widget<T>(props: {
    title?: string,
    data: Async<T, ApiError>,
    loadingText?: string | string[],
    errorMsg?: string,
    refresh?: () => void,
    children: (d: T) => React.ReactElement,
    height?: number
}) {

    return <Col xxl={6} xl={8} md={12} xs={24} className="widget" style={{height: props.height}}>
        <div className="widget-wrapper">
            <WidgetRenderer {...props} />
        </div>
    </Col>
}

function WidgetRenderer<T>(props: {
    title?: string,
    data: Async<T, ApiError>,
    loadingText?: string | string[],
    errorMsg?: string,
    refresh?: () => void,
    children: (d: T) => React.ReactElement,
    height?: number
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
            return <Loading text={props.loadingText} className="widget-loading"/>;
        case "LOADED":
            if (props.data.data === null || props.data.data === undefined || isEmptyArray(props.data.data))
                return <></>;
            if (props.title) {
                return <BodyWithTitle title={props.title} body={props.children(props.data.data)}/>
            }
            return <div className="widget-without-title-content">
                {props.children(props.data.data)}
            </div>
        case "NO_REQUESTED":
        default:
            return <Result title={props.title}/>
    }

}

function isEmptyArray(dat: unknown) {
    return Array.isArray(dat) && dat.length === 0;
}

function BodyWithTitle(props: {
    title: string,
    body: React.ReactElement
}) {
    return <div className="widget-container">
        <header className="widget-header">
            <p>{props.title}</p>
        </header>
        <section className="widget-content">
            <div className="widget-content-body">
                {props.body}
            </div>
        </section>
    </div>
}
