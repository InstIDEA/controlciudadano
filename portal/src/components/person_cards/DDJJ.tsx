import {Affidavit} from "../../Model";
import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";
import {formatMoney} from "../../formatters";

export function DDJJCard(props: {
    affidavit: Affidavit[]
}) {
    const affidavit = props.affidavit;
    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="Declaraciones juradas de bienes y rentas"
              extra={<Icon component={Ddjj} className="icon-card"/>}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={3}>
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={7}>
                    <Typography.Text><strong>Activos</strong></Typography.Text>
                </Col>
                <Col span={7}>
                    <Typography.Text><strong>Pasivos</strong></Typography.Text>
                </Col>
                <Col span={7}>
                    <Typography.Text><strong>Patrimonio Neto</strong></Typography.Text>
                </Col>
            </Row>
            {affidavit.map(declaracion => <DJResumeCols data={declaracion} key={declaracion.id}/>)}
        </Card>
    </Col>
}


export function DJResumeCols(props: { data: Affidavit }) {

    const declaracion = props.data;
    if (declaracion.actives) {
        return <Row gutter={[8, 8]}>
            <Col span={3}>
                <a href={declaracion.linksandwich || declaracion.link} target="_blank" rel="noopener noreferrer"
                   title="Ver">
                    {declaracion.year}
                </a>
            </Col>
            <Col span={7}>
                {formatMoney(declaracion.actives)}
            </Col>
            <Col span={7}>
                {formatMoney(declaracion.passive)}
            </Col>
            <Col span={7}>
                {formatMoney(declaracion.networth)}
            </Col>
        </Row>
    } else {
        return <Row gutter={[8, 8]}>
            <Col span={3}>
                <a href={declaracion.linksandwich || declaracion.link} target="_blank" rel="noopener noreferrer"
                   title="Ver">
                    {declaracion.year}
                </a>
            </Col>
            <Col span={21}>
                Ayudanos a completar!
            </Col>
        </Row>;
    }
}
