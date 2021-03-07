import React from "react";
import {Header} from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {Button, Card, Col, Layout, Result, Row, Space, Typography} from "antd";
import {Link, useParams} from "react-router-dom";
import {DownloadOutlined} from "@ant-design/icons";
import {DisclaimerComponent} from "../../components/Disclaimer";
import {Calculations} from "../components/net_worth/Calculations";
import {InputData} from "../components/net_worth/InputData";
import {Graphs} from "../components/net_worth/Graphs";
import {useNetWorthAnalysis} from "../../hooks/useApi";
import {NetWorthIncreaseAnalysis} from "../../APIModel";
import {Loading} from "../../components/Loading";
import {useNWHook} from "../NetWorthHook";


export function AnalysisNetWorthIncrement() {

    const {document} = useParams<{ document: string }>();
    const fetched = useNetWorthAnalysis(document);


    return <>
        <Header/>

        <Layout>
            <Layout.Content style={{padding: '0 30px', minHeight: '75vh'}}>
                <Row gutter={[16, 16]} justify="center">
                    {fetched.state === 'LOADED' && <Analysis data={fetched.data}/>}
                    {fetched.state === 'FETCHING' && <Loading text={[
                        "Buscando datos de " + document,
                        "Obteniendo datos de la Contraloría General de la República",
                        "Buscando en fuentes de datos abiertos",
                    ]}/>}
                    {fetched.state === 'ERROR' && <Result status={fetched.error.asSimpleCode()}
                                                          title={`No se encontraron datos de ${document}`}
                                                          extra={<Link to="/analysis/">
                                                              <Button>
                                                                  Volver
                                                              </Button>
                                                          </Link>}
                    />}
                </Row>
            </Layout.Content>
        </Layout>
        <Footer/>
    </>
}

function Analysis(props: {
    data: NetWorthIncreaseAnalysis
}) {

    const data = useNWHook(props.data);

    return <>
        <Row gutter={[16, 16]} justify="center">
            <Col xs={24} xl={18}>
                <Row align="middle" justify="center">
                    <Col xs={22}>
                        <Typography.Title className="title-color" style={{textAlign: 'center'}}>
                            Crecimiento Patrimonial de '{data.data.person.name}' según Declaraciones Juradas de Bienes y
                            Rentas.
                        </Typography.Title>
                    </Col>
                    <Col md={{span: 1, offset: 1}} xs={{span: 13, offset: 11}}>
                        <Button type="primary"
                                shape="circle"
                                size="large"
                                color="#003459"
                                icon={<DownloadOutlined/>}/>
                    </Col>
                </Row>
            </Col>
            <Col xs={24} xl={{span: 18}}>
                <Card className="custom-card custom-shadow-small">
                    <Graphs data={data.data}/>
                </Card>
            </Col>
            <Col md={12} sm={24} xl={9}>
                <Card className="custom-card custom-shadow-small">
                    <Calculations data={data.data}/>
                </Card>
            </Col>
            <Col md={12} sm={24} xl={9}>
                <Card className="custom-card custom-shadow-small">
                    <InputData data={data.data}
                               disabled={data.working}
                               updateDate={data.setYearData}
                               updateSingleYear={data.changeYear}
                    />
                </Card>
            </Col>
            <Col sm={24} xl={18}>
                <DisclaimerComponent full card>
                    <Space>
                        <Typography.Paragraph style={{margin: 'inherit'}}>
                            Para ver mas detalles sobre este análisis, por favor revista este documento
                        </Typography.Paragraph>
                        <button className="round-button">Ver más</button>
                    </Space>
                </DisclaimerComponent>
            </Col>
        </Row>
    </>
}




