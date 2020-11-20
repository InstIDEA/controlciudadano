import {Header} from "../components/layout/Header";
import {Col, Row, Typography} from "antd";
import React from "react";
import Footer from "../components/layout/Footer";


export function DisclaimerPage() {
    return <>
        <Header tableMode={false}/>
        <Row>
            <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{textAlign: 'center'}}>
                <Typography.Title level={2} className="about-title">Descargo de responsabilidad</Typography.Title>
            </Col>

        </Row>
        <Row>
            <Col offset={1} xxl={22} xl={22} lg={22} md={22} sm={22} xs={22} style={{textAlign: 'center'}}>
                <Typography.Title level={3} className="about-title">¿Qué hacer con la Detección de posibles casos de
                    corrupción?</Typography.Title>
            </Col>
        </Row>
        <Row gutter={[8, 24]} className="about-paragraph" style={{fontSize: '20px'}}>
            <Col span={12} offset={6}>
                <Typography.Paragraph style={{textAlign: 'justify'}}>
                    Si bien los datos son reflejo exacto de las fuentes enunciadas, esta iniciativa tiene la función
                    de ser una plataforma de control de uso de los recursos públicos y de los gastos de emergencia
                    por el Covid-19 a través de formatos amigables que permitan su uso, re-uso y procesamiento
                    continuo. Los cruces de datos, análisis realizados, y otras conclusiones arribadas por los
                    usuarios son de su exclusiva responsabilidad.<br/>
                    Las presuntas irregularidades detectadas pueden ser denunciadas a las instancias de control,
                    como la SENAC (<a href="https://senac.gov.py/" target="__blank"
                                      rel="noopener noreferrer">https://senac.gov.py/</a>) y la Contraloría General
                    de la República (<a href="https://www.contraloria.gov.py/" target="__blank"
                                        rel="noopener noreferrer">https://www.contraloria.gov.py/</a>) o al
                    Ministerio Público.<br/>
                    Se sugiere que toda investigación y/o denuncia explique de manera clara y precisa los parámetros
                    utilizados. Las contribuciones a las investigaciones pueden ser enviadas a <a
                    href="mailto:idea@idea.org.py" target="__blank" rel="noopener noreferrer">idea@idea.org.py</a>,
                    aunque esta organización no se hace responsable de publicar o divulgar dicha investigación.
                    Contribuciones sobre los análisis arribados podrán ser divulgados en la misma plataforma.<br/>
                    Si el usuario detecta alguna presunta irregularidad, a la par de elevar su denuncia a las
                    instancias de control, puede emitir recomendaciones o solicitar información pública a través del
                    portal <a href="https://informacionpublica.paraguay.gov.py/" target="__blank"
                              rel="noopener noreferrer">https://informacionpublica.paraguay.gov.py/</a> para obtener
                    mayor información sobre el caso específico. Recordamos que es obligación de todas las
                    instituciones del Estado paraguayo responder en el plazo máximo de 15 días hábiles las
                    solicitudes de información.<br/>
                    De igual manera, se pueden remitir recomendaciones a la institución pública analizada o de
                    acuerdo con la situación analizada. Esta contribución también puede ser remitida a <a
                    href="mailto:idea@idea.org.py" target="__blank"
                    rel="noopener noreferrer">idea@idea.org.py</a> aunque esta organización no se hace responsable
                    de elevar estas recomendaciones ni divulgarlas. No obstante, podrá divulgarla si así lo estima
                    conveniente en la misma plataforma.
                </Typography.Paragraph>
            </Col>
        </Row>
        <Footer tableMode={false} aboutFooter={true}/>
    </>;
}

