import {useMemo} from "react";
import {Card, Col, Row, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Sfp} from "../../assets/logos/sfp.svg";
import * as React from "react";
import {SFPRow} from "../../SFPHelper";


export function SFPCard(props: {
    data: SFPRow[],
    document: string
}) {
    let lista = useMemo(() => agrupameEsta(props.data), [props.data]);
    return <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
        <Card className="data-box" title="Secretaría de la Función Pública"
              extra={<Icon component={Sfp} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}
              actions={[
                  <a href={`https://datos.sfp.gov.py/doc/funcionarios/${props.document}`} target="_blank" rel="noopener noreferrer">Mas info</a>
              ]}>
            <Row gutter={[8, 8]} style={{background: '#fafafa'}}>
                <Col span={3} >
                    <Typography.Text><strong>Año</strong></Typography.Text>
                </Col>
                <Col span={11}>
                    <Typography.Text><strong></strong></Typography.Text>
                </Col >

            </Row>
            {lista.map(
                election =>
                    <Row gutter={[8, 8]}>
                        <Col span={3} >
                            {election.anio}
                        </Col>
                        <Col span={11}>
                            {election.cargo}
                        </Col >

                    </Row>
            )}
        </Card>
    </Col>
}

interface Resume{ key: string, mes: number, anio: number, cargo: string}

function agrupameEsta(list: SFPRow[]): Array<Resume> {
    let sum = new Map<String, Resume>();
    let lista = new Array();
    list.forEach(value => {
        const key = `${value.anho}`
        let v = sum.get(key);
        if((v && v.mes< value.mes) || !v) {
            sum.set(key,{key: key, mes: value.mes, anio: value.anho, cargo: value.descripcionNivel});
        }
    });
    sum.forEach(value => lista.push(value));
    return lista;
}