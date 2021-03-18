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
import useMetaTags from "react-metatags-hook";
import {ExternalLinkIcon} from "../../components/icons/ExternalLinkIcon";
import {useMediaQuery} from "@react-hook/media-query";
import './AnalysisNetWorthIncrement.css';


export function AnalysisNetWorthIncrement() {

    const {document} = useParams<{ document: string }>();
    const fetched = useNetWorthAnalysis(document);

    useMetaTags({
        title: `Análisis de crecimiento patrimonial de ${document}`,
        description: `Análisis de crecimiento patrimonial de ${document}`,
        charset: 'utf8',
        lang: 'en',
        openGraph: {
            title: `Análisis de crecimiento patrimonial de ${document}`,
            site_name: 'controlciudadanopy.org'
        },
        twitter: {
            card: 'summary',
            creator: '@InstIDEA',
            title: `Análisis de crecimiento patrimonial de ${document}`,
        }
    }, [])

    return <div className="nw-increment-page">
        <Header/>

        <Layout>
            <Layout.Content style={{padding: '10px 30px', minHeight: '75vh'}}>
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
    </div>
}

function Analysis(props: {
    data: NetWorthIncreaseAnalysis
}) {

    const data = useNWHook(props.data);
    const isSmall = useMediaQuery('only screen and (max-width: 900px)');
    const xsSpan = 24;
    const lgSpan = 24;
    const xlSpan = 22;
    const xxlSpan = 21;

    return <Row gutter={[16, 16]} justify="center">
        <Col xs={xsSpan} lg={lgSpan} xl={xlSpan} xxl={xxlSpan}>
            <Row align="middle" justify="center">
                <Col xs={22}>
                    <Typography.Title className="title-color main-title" style={{textAlign: 'center'}}>
                        Crecimiento Patrimonial de '{data.data.person.name}' según Declaraciones Juradas de Bienes y
                        Rentas.
                    </Typography.Title>
                </Col>


                <Col md={{span: 1, offset: 1}} xs={{span: 13, offset: 9}} className="global-actions">
                    <Space direction={isSmall ? 'horizontal' : 'vertical'}>
                        <Button type="primary"
                                shape="circle"
                                size="large"
                                color="#003459"
                                onClick={doPrint}
                                icon={<DownloadOutlined/>}/>
                        <Link to={`/person/${data.data.person.document}?name=${data.data.person.name}`}>
                            <Button type="primary"
                                    shape="circle"
                                    size="large"
                                    icon={<ExternalLinkIcon color="white"/>}/>
                        </Link>
                    </Space>
                </Col>
            </Row>
        </Col>

        <Col span={24} className="print-only top-disclaimer">
            <DisclaimerComponent>
                <Space>
                    <Typography.Paragraph style={{margin: 'inherit'}}>
                        El resultado del análisis es un indicador que clasifica el crecimiento
                        patrimonial y que da una probabilidad de inconsistencia. El resultado no es
                        concluyente y requiere de verificación manual y análisis más profundo de los
                        datos.
                        <br/>
                        Para ver mas detalles sobre este análisis, por favor revista este documento
                    </Typography.Paragraph>
                    <button className="round-button">Ver más</button>
                </Space>
            </DisclaimerComponent>
        </Col>

        <Col xs={xsSpan} lg={lgSpan} xl={xlSpan} xxl={xxlSpan - 1}>
            <Card className="custom-card custom-shadow-small print-horizontal-margin">
                <Graphs data={data.data} calc={data.analysis}/>
            </Card>
        </Col>
        <Col md={xsSpan} lg={lgSpan / 2} sm={24} xl={xlSpan / 2} xxl={xxlSpan / 2}>
            <Card className="custom-card custom-shadow-small">
                <Calculations data={data.data} calculations={data.analysis}/>
            </Card>
        </Col>
        <Col md={xsSpan} lg={lgSpan / 2} sm={24} xl={xlSpan / 2} xxl={xxlSpan / 2} className="input-data-panel">
            <Card className="custom-card custom-shadow-small">
                <InputData data={data.data}
                           disabled={data.working}
                           updateDate={data.setYearData}
                           updateSingleYear={data.changeYear}
                />
            </Card>
        </Col>
        <Col sm={xsSpan} lg={lgSpan} xl={xlSpan} xxl={xxlSpan}>
            <DisclaimerComponent full card>
                <Space>
                    <Typography.Paragraph style={{margin: 'inherit'}}>
                        El resultado del análisis es un indicador que clasifica el crecimiento
                        patrimonial y que da una probabilidad de inconsistencia. El resultado no es
                        concluyente y requiere de verificación manual y análisis más profundo de los
                        datos.
                        <br/>
                        Para ver mas detalles sobre este análisis, por favor revista este documento
                    </Typography.Paragraph>
                    <button className="round-button">Ver más</button>
                </Space>
            </DisclaimerComponent>
        </Col>
    </Row>
}





function doPrint() {
    (window as any).print();
}
