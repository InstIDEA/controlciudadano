import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";
import {ColProps} from "antd/es/col";

export function ChargeCard(props: {
    cargos: Cargo[],
    spans: ColProps,
    document: string
}) {
    const cargos = props.cargos;
    const spans = props.spans
    return <Col {...spans}>
        <Card className="data-box" title="Cargos públicos (de affidavit)"
              extra={<Icon component={Ddjj} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}
              actions={[
                  <a href={`https://datos.sfp.gov.py/doc/funcionarios/${props.document}`} target="_blank" rel="noopener noreferrer">Mas info</a>
              ]}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={4} >
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={20}>
                    <Typography.Text><strong>Cargo</strong></Typography.Text>
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