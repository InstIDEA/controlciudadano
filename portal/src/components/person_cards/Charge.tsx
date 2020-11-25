import {Card, Col, Row} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";
import {ColProps} from "antd/es/col";

export function ChargeCard(props: {
    cargos: Cargo[],
    spans: ColProps
}) {
    const cargos = props.cargos;
    const spans = props.spans
    return <Col {...spans}>
        <Card className="data-box" title="Cargos públicos"
              extra={<Icon component={Ddjj} className="icon-card"/>}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={4} >
                    Año
                </Col>
                <Col span={20}>
                    Cargo
                </Col >
            </Row>
            {cargos.map(
                cargo =>
                    <Row gutter={[8, 8]}>
                        <Col span={4} >
                            {cargo.ano}
                        </Col>
                        <Col span={20}>
                            {cargo.cargo}
                        </Col >
                    </Row>
            )}
        </Card>
    </Col>
}
export interface Cargo {
    cargo: string, ano:number
}