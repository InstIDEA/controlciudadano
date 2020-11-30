import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import * as React from "react";
import {FunctionComponent, useMemo} from "react";
import {ColProps} from "antd/es/col";

export function ChargeCard(props: {
    cargos: Charge[],
    spans: ColProps,
    document: string
}) {
    const cargos = props.cargos;
    const spans = props.spans;
    const icons = useMemo(() => buildIcons(props.cargos), [props.cargos])

    return <Col {...spans}>
        <Card className="data-box" title={`Cargos públicos`}
              extra={Object.keys(icons).map((key: string) => <Icon key={key} component={icons[key]}
                                                                   className="icon-card"/>)}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={4}>
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={12}>
                    <Typography.Text><strong>Cargo</strong></Typography.Text>
                </Col>
                <Col span={8}>
                    <Typography.Text><strong>Fuente</strong></Typography.Text>
                </Col>
            </Row>
            {cargos
                .map(c => c)
                .sort((c1, c2) => c1.year < c2.year ? 1 : -1)
                .map(charge => <Row gutter={[8, 8]} key={`${charge.year}${charge.sourceName}${charge.charge}`}>
                        <Col span={4}>
                            {charge.year}
                        </Col>
                        <Col span={12}>
                            {charge.charge}
                        </Col>
                        <Col span={8}>
                            {charge.sourceName}
                        </Col>
                    </Row>
                )}
        </Card>
    </Col>
}

export interface Charge {
    charge: string;
    year: number;
    source: FunctionComponent;
    sourceName: string;
}

function buildIcons(charges: Charge[]): { [k: string]: FunctionComponent } {
    return charges.reduce((toRet, current) => ({
        ...toRet,
        [current.sourceName]: current.source
    }), {})
}
