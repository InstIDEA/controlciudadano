import React, {useMemo} from "react";
import {Async, AsyncHelper, OCDSSupplierContract, OCDSSupplierRelation, Supplier} from "../../Model";
import {ApiError} from "../../RedashAPI";
import {Row} from "antd";
import {millionFormatter} from "../../formatters";
import './SupplierDashboard.css';
import {StatsWidget} from "../dashboard-widgets/StatsWidget";
import {BarWidget} from "../dashboard-widgets/BarWidget";
import {groupBy} from "../../pages/OCDSItem";
import {PieWidget} from "../dashboard-widgets/PieWidget";


export function SupplierDashBoard(props: {
                                      header: Supplier
                                      contracts: Async<OCDSSupplierContract[], ApiError>,
                                      relations: Async<OCDSSupplierRelation[], ApiError>
                                  }
) {

    return <Row gutter={[24, 24]} className="ocds-supplier-dashboard">

        <YearAmountWidget contracts={props.contracts}/>
        <YearCountWidget contracts={props.contracts}/>
        <BuyerWidget contracts={props.contracts}/>

        <StatsWidget title="Relaciones"
                     data={AsyncHelper.map(props.relations, t => t.length)}
                     precision={0}
        />
        <StatsWidget title="Contratos Adjudicados"
                     data={AsyncHelper.map(props.contracts, t => t.length)}
                     precision={0}
        />
        <StatsWidget title="Monto total adjudicado"
                     data={AsyncHelper.map(props.contracts, t => millionFormatter(t.map(c => parseFloat(c.amount)).reduce(sumReducer, 0), 'Gs. '))}
                     precision={0}
        />
        <StatsWidget title="Entidades contratantes"
                     data={AsyncHelper.map(props.contracts,
                         t => Object.keys(groupBy(t, t => t.buyer_id)).length
                     )}
                     precision={0}
        />

    </Row>
}

function YearAmountWidget(props: { contracts: Async<OCDSSupplierContract[], ApiError> }) {

    const data = useMemo(() => {
        return AsyncHelper.map(props.contracts, c => groupByYear(c, 'Monto', d => parseFloat(d.amount)));
    }, [props.contracts]);

    return <BarWidget data={data}
                      title="Montos adjudicados por año"
                      leftLegend="Monto (Gs.)"
                      keys={['Monto']}
                      indexBy="key"
    />

}

function BuyerWidget(props: { contracts: Async<OCDSSupplierContract[], ApiError> }) {

    const data = useMemo(() => {
        return AsyncHelper.map(props.contracts, c => {
            const toRet: Record<string, any> = {};
            for (let row of (c || [])) {
                if (!row.buyer_id) continue;
                if (toRet[row.buyer_id]) {
                    toRet[row.buyer_id].value += parseFloat(row.amount);
                } else {
                    toRet[row.buyer_id] = {
                        name: row.buyer_name,
                        id: row.buyer_name,
                        value: parseFloat(row.amount)
                    }
                }
            }
            return Object.values(toRet)
                .splice(0, 10)
                .sort((r1, r2) => r1.value - r2.value);
        });
    }, [props.contracts]);

    return <PieWidget data={data}
                      title="Entidades contratantes (Monto Gs.)"
                      keys={['Monto']}
                      indexBy="key"
    />

}

function YearCountWidget(props: { contracts: Async<OCDSSupplierContract[], ApiError> }) {

    const data = useMemo(() => {
        return AsyncHelper.map(props.contracts, c => groupByYear(c, 'Cantidad', d => 1));
    }, [props.contracts]);

    return <BarWidget data={data}
                      title="Contratos adjudicados por año"
                      leftLegend="Cantidad"
                      keys={['Cantidad']}
                      indexBy="key"
    />

}


function sumReducer(a: number, b: number) {
    return a + b
}


function groupByYear(data: OCDSSupplierContract[],
                     name: string,
                     dataProducer: (c: OCDSSupplierContract) => number): Array<object> {

    const toRet: Record<string, object> = {};
    for (let d of (data || [])) {
        const key = (d.sign_date || d.published_date).substr(0, 4);
        if (toRet[key]) {
            // TODO view if we can type this
            (toRet[key] as any)[name] += dataProducer(d);
        } else {
            toRet[key] = {[name]: dataProducer(d), key};
        }
    }

    return Object.values(toRet);

}
