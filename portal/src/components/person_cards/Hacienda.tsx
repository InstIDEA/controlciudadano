import {Hacienda} from "../../Model";
import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as HaciendaIcon} from "../../assets/logos/hacienda.svg";
import * as React from "react";
import {useMemo} from "react";
import {formatMoney} from "../../formatters";

export function HaciendaCard(props: {
    data: Hacienda[],
    document: string
}) {
    let lista = useMemo(() => groupByYear(props.data), [props.data]);

    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="Salarios de Hacienda"
              extra={<Icon component={HaciendaIcon} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}
              actions={[
                  <a href={`https://datos.hacienda.gov.py/doc/nomina/${props.document}`} target="_blank"
                     rel="noopener noreferrer">Mas info</a>
              ]}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={4}>
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={10}>
                    <Typography.Text><strong>Unidad</strong></Typography.Text>
                </Col>
                <Col span={10} style={{textAlign: 'right'}}>
                    <Typography.Text><strong>Monto</strong></Typography.Text>
                </Col>
            </Row>
            {lista.map(election => <Row gutter={[8, 8]} key={election.key}>
                    <Col span={4}>
                        {election.year}/{election.month}
                    </Col>
                    <Col span={10}>
                        {election.charge}
                    </Col>
                    <Col span={10} style={{textAlign: 'right'}}>
                        {formatMoney(election.salary)}
                    </Col>
                </Row>
            )}
        </Card>
    </Col>
}

function groupByYear(list: Array<Hacienda>): Array<GroupedInfo> {

    const toRet: Record<string, GroupedInfo> = {};

    list.forEach(value => {
        const key = `${value.anio}${value.mes}`
        let current = toRet[key];
        if (current) {
            current.salary += value.montodevengado;
            current.charge = current.charge || value.descripcionunidadresponsable;
        } else {
            toRet[key] = {
                key: key,
                year: value.anio,
                month: value.mes,
                charge: value.descripcionunidadresponsable,
                salary: value.montodevengado
            };
        }

    });
    return Object.values(toRet)
        .sort((v1, v2) => v2.key.localeCompare(v1.key))
        .slice(0, 3);
}

interface GroupedInfo {
    key: string;
    year: number;
    month: number;
    salary: number;
    charge: string;
}
