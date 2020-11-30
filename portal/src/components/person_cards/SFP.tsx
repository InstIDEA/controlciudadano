import * as React from "react";
import {useMemo} from "react";
import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Sfp} from "../../assets/logos/sfp.svg";
import {SFPLocalData} from '../../Model';
import {formatMoney} from '../../formatters';


export function SFPCard(props: {
    data: SFPLocalData[],
    document: string
}) {
    const data = useMemo(() => groupByYear(props.data), [props.data]);

    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="Salarios s/ la Secretaría de la Función Pública"
              extra={<Icon component={Sfp} className="icon-card" />}
              actions={[
                  <a href={`https://datos.sfp.gov.py/doc/funcionarios/${props.document}`} target="_blank"
                     rel="noopener noreferrer">Ver más información en el portal de la SFP</a>
              ]}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={4}>
                    <Typography.Text><strong>Año/Mes</strong></Typography.Text>
                </Col>
                <Col span={10}>
                    <Typography.Text><strong>Entidad</strong></Typography.Text>
                </Col>
                <Col span={10} style={{textAlign: 'right'}}>
                    <Typography.Text><strong>Monto presupuestado</strong></Typography.Text>
                </Col>
            </Row>
            {data.map(row => <Row gutter={[8, 8]} key={row.key}>
                    <Col span={4}>
                        {row.year}/{row.month}
                    </Col>
                    <Col span={12}>
                        {row.place} / {row.charge}
                    </Col>
                    <Col span={8} style={{textAlign: 'right'}}>
                        {formatMoney(row.salary)}
                    </Col>
                </Row>
            )}
        </Card>
    </Col>
}

function groupByYear(list: Array<SFPLocalData>): Array<GroupedInfo> {

    const toRet: Record<string, GroupedInfo> = {};

    list.forEach(value => {
        const key = `${value.anho}${value.mes}${value.descripcion_entidad}`
        let current = toRet[key];
        if (current) {
            current.salary += value.presupuestado;
            current.charge = current.charge || value.cargo;
        } else {
            toRet[key] = {
                key: key,
                year: value.anho,
                month: value.mes,
                charge: value.cargo,
                salary: value.presupuestado,
                place: (value.descripcion_entidad || "").replace("�", "")
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
