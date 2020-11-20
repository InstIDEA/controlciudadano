import {Affidavit} from "../../Model";
import {Card, Col, Row} from "antd";
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
              extra={<Icon component={Ddjj} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={3} >
                    Año
                </Col>
                <Col span={7}>
                    Activos
                </Col >
                <Col span={7}>
                    Pasivos
                </Col>
                <Col span={7}>
                    Patrimonio Neto
                </Col>
            </Row>
            {affidavit.map(
                declaracion =>
                    <DJResumeCols data={declaracion} />
            )}
        </Card>
    </Col>
}


export function DJResumeCols(props: {
    data: Affidavit}
) {
    const declaracion = props.data;
    if(declaracion.actives) {
        return  <Row gutter={[8, 8]}>
            <Col span={3} >
                <a href={declaracion.linksandwich || declaracion.link} target="_blank" rel="noopener noreferrer"
                   title="Ver">
                    {declaracion.year}
                </a>
            </Col>
            <Col span={7}>
                {formatMoney(declaracion.actives)}
            </Col >
            <Col span={7}>
                {formatMoney(declaracion.passive)}
            </Col>
            <Col span={7}>
                {formatMoney(declaracion.networth)}
            </Col>
        </Row>
    } else {
        return  <Row gutter={[8, 8]}>
            <Col span={3} >
                <a href={declaracion.linksandwich || declaracion.link} target="_blank" rel="noopener noreferrer"
                   title="Ver">
                    {declaracion.year}
                </a>
            </Col>
            <Col span={21}>
                Ayudanos a completar!
            </Col >
        </Row>;
    }
}