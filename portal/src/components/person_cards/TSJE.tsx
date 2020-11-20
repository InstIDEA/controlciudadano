import {Authorities} from "../../Model";
import {Card, Col, Row} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";

export function TSJECard(props: {
    tsje: Authorities[]
}) {
    const tsje = props.tsje;
    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="TSJE"
              extra={<Icon component={Ddjj} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={3} >
                    Año
                </Col>
                <Col span={11}>
                    Candidatura
                </Col >
                <Col span={10}>
                    Lista
                </Col>
            </Row>
            {tsje.map(
                election =>
                    <Row gutter={[8, 8]}>
                        <Col span={3} >
                            {election.ano}
                        </Col>
                        <Col span={11}>
                            {election.cand_desc}
                        </Col >
                        <Col span={10}>
                            {election.nombre_lista} ({election.siglas_lista})
                        </Col>
                    </Row>
            )}
        </Card>
    </Col>
}