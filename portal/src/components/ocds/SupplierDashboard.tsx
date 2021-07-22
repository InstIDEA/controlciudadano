import React from "react";
import {Async, AsyncHelper, OCDSSupplierContract, OCDSSupplierRelation, Supplier} from "../../Model";
import {ApiError} from "../../RedashAPI";
import {Button, Col, Result, Row, Statistic} from "antd";
import {Loading} from "../Loading";
import {getStatus} from "../AsyncRenderer";
import {millionFormatter} from "../../formatters";
import {groupBy} from "../../pages/OCDSItem";
import './SupplierDashboard.css';


export function SupplierDashBoard(props: {
                                      header: Supplier
                                      contracts: Async<OCDSSupplierContract[], ApiError>,
                                      relations: Async<OCDSSupplierRelation[], ApiError>
                                  }
) {

    return <Row gutter={[24, 24]} className="ocds-supplier-dashboard">
        <Widget title="Relaciones"
                data={AsyncHelper.map(props.relations, t => t.length)}
                children={relations => <Statistic
                    title="Relaciones"
                    value={relations}
                    precision={0}
                />}/>
        <Widget title="Contratos Adjudicado"
                data={AsyncHelper.map(props.contracts, t => t.length)}
                children={relations => <Statistic
                    title="Contratos Adjudicados"
                    value={relations}
                    precision={0}
                />}/>
        <Widget title="Contratos Adjudicado"
                data={AsyncHelper.map(props.contracts, t => t.map(c => parseFloat(c.amount)).reduce(sumReducer, 0))}
                children={relations => <Statistic
                    title="Monto total adjudicado"
                    value={millionFormatter(relations, 'PYG ')}
                    precision={0}
                />}/>
        <Widget title="Contratos Adjudicado"
                data={AsyncHelper.map(props.contracts,
                    t => Object.keys(groupBy(t, t => t.buyer_id)).length
                )}
                children={buyers => <Statistic
                    title="Entidades contratantes"
                    value={buyers}
                    precision={0}
                />}/>
    </Row>
}

function sumReducer(a: number, b: number) {
    return a + b
}

function Widget<T>(props: {
    title: string,
    data: Async<T, ApiError>,
    loadingText?: string | string[],
    errorMsg?: string,
    refresh?: () => void,
    children: (d: T) => React.ReactElement,
    height?: number
}) {

    return <Col xxl={6} xl={8} md={12} xs={24} className="widget">
        <div className="widget-wrapper">
            <WidgetRenderer {...props} />
        </div>
    </Col>
}

function WidgetRenderer<T>(props: {
    title: string,
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
            return <Loading text={props.loadingText}/>;
        case "LOADED":
            if (props.data.data === null || props.data.data === undefined || isEmptyArray(props.data.data))
                return <></>;
            return props.children(props.data.data);
        case "NO_REQUESTED":
        default:
            return <Result title={props.title}/>
    }

}

function isEmptyArray(dat: unknown) {
    return Array.isArray(dat) && dat.length === 0;
}
