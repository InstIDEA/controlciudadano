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
        <Card className="data-box" title="Salarios s/ el Ministerio de Hacienda"
              extra={<Icon component={HaciendaIcon} className="icon-card"/>}
              actions={[
                  <a href={`https://datos.hacienda.gov.py/doc/nomina/${props.document}`} target="_blank"
                     rel="noopener noreferrer">Ver más información en el portal del Ministerio de Hacienda</a>
              ]}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={4}>
                    <Typography.Text><strong>Año/Mes</strong></Typography.Text>
                </Col>
                <Col span={12}>
                    <Typography.Text><strong>Entidad</strong></Typography.Text>
                </Col>
                <Col span={8} style={{textAlign: 'right'}}>
                    <Typography.Text><strong>Monto presupuestado (Gs.)</strong></Typography.Text>
                </Col>
            </Row>
            {lista.map(election => <Row gutter={[8, 8]} key={election.key}>
                    <Col span={4}>
                        {election.year}/{election.month}
                    </Col>
                    <Col span={12}>
                        {election.place.replace("�", "")} / {election.charge.replace("�", "")}
                    </Col>
                    <Col span={8} style={{textAlign: 'right'}}>
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
        const month = value.mes < 10 ? `0${value.mes}` : `${value.mes}`;
        const key = `${value.anio}${month}${value.descripcionentidad}`;
        let current = toRet[key];
        if (current) {
            current.salary += value.montopresupuestado;
            current.charge = current.charge || value.descripcionunidadresponsable;
        } else {
            toRet[key] = {
                key: key,
                year: value.anio,
                month: value.mes,
                charge: value.descripcionunidadresponsable,
                salary: value.montopresupuestado,
                place: (value.descripcionentidad || "").replace("�", "")
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
    place: string;
}
