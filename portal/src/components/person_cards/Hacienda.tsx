import {Hacienda} from "../../Model";
import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as HaciendaI} from "../../assets/logos/hacienda.svg";
import * as React from "react";
import {formatMoney} from "../../formatters";
import {useMemo} from "react";

export function HaciendaCard(props: {
    data: Hacienda[],
    document: string
}) {
    let lista = useMemo(() => agrupameEsta(props.data), [props.data]);
    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="Salarios de Hacienda"
              extra={<Icon component={HaciendaI} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}
              actions={[
                  <a href={`https://datos.hacienda.gov.py/doc/nomina/${props.document}`} target="_blank" rel="noopener noreferrer">Mas info</a>
              ]}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={3} >
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={11}>
                    <Typography.Text><strong>Unidad</strong></Typography.Text>
                </Col >
                <Col span={10}>
                    <Typography.Text><strong>Monto</strong></Typography.Text>
                </Col>
            </Row>
            {lista.map(
                election =>
                    <Row gutter={[8, 8]}>
                        <Col span={3} >
                            {election.anio}/{election.mes}
                        </Col>
                        <Col span={11}>
                            {election.cargo}
                        </Col >
                        <Col span={10}>
                            {formatMoney(election.monto)}
                        </Col>
                    </Row>
            )}
        </Card>
    </Col>
}

function agrupameEsta(list: Array<Hacienda>): Array<{ key: string, anio: number, mes: number, monto: number, cargo: string}> {
    let sum = new Map<String, Hacienda>();
    console.log('tamaño ', list.length);
    list.forEach(value => {
        const key = `${value.anio}${value.mes}`
        let v = sum.get(key);
        if(v) {
            console.log(key, ' suma ', v.montodevengado, ' + ', value.montodevengado);
            v.montodevengado += value.montodevengado;
            console.log('= ', v.montodevengado);
            v.descripcionunidadresponsable = value.descripcionunidadresponsable ? value.descripcionunidadresponsable : v.descripcionunidadresponsable;
        } else {
            v = {...value};
        }
        sum.set(key,v);

    });
    let lista = new Array();
    sum.forEach((value, index) => lista.push({ key: index, anio: value.anio, mes: value.mes,
        monto: value.montodevengado, cargo: value.descripcionunidadresponsable}));
    lista.sort((a, b) => `${a.anio}${a.mes}`.localeCompare(`${b.anio}${b.mes}`)*-1);
    lista = lista.slice(0, 5);
    return lista;
}