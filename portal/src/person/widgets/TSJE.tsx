import {Authorities} from "../../Model";
import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";
import {fixName} from "../../nameUtils";

export function TSJECard(props: {
    tsje: Authorities[]
}) {
    const tsje = props.tsje;
    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="TSJE"
              extra={<Icon component={Ddjj} className="icon-card"/>}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={3}>
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={11}>
                    <Typography.Text><strong>Candidatura</strong></Typography.Text>
                </Col>
                <Col span={10}>
                    <Typography.Text><strong>Lista</strong></Typography.Text>
                </Col>
            </Row>
            {tsje.map(election => <Row gutter={[8, 8]} key={election.year_elected}>
                    <Col span={3}>
                        {election.year_elected}
                    </Col>
                    <Col span={11}>
                        {election.charge} ({fixName(election.department)})
                    </Col>
                    <Col span={10}>
                        {election.list}
                    </Col>
                </Row>
            )}
        </Card>
    </Col>
}
