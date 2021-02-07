import React from "react";
import {Header} from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {Button, Card, Col, Layout, Row, Space, Typography} from "antd";
import {useParams} from "react-router-dom";
import {DownloadOutlined} from "@ant-design/icons";
import {DisclaimerComponent} from "../../components/Disclaimer";


export function AnalysisNetWorthIncrement() {

    const {document} = useParams<{ document: string }>();

    return <>
        <Header/>

        <Layout>
            <Layout.Content style={{minHeight: '75vh', padding: '10px 5%'}}>
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24}>
                        <Row align="middle">
                            <Col xs={22} md={{span: 16, offset: 4}}>
                                <Typography.Title className="title-color" style={{textAlign: 'center'}}>
                                    Crecimiento Patrimonial de {document} según Declaraciones Juradas de Bienes y
                                    Rentas.
                                </Typography.Title>
                            </Col>
                            <Col xs={{span: 1, offset: 1}}>
                                <Button type="primary"
                                        shape="circle"
                                        size="large"
                                        color="#003459"
                                        icon={<DownloadOutlined/>}/>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24}>
                        <Card className="custom-card custom-shadow-small">
                            <Graphs/>
                        </Card>
                    </Col>
                    <Col md={12} sm={24}>
                        <Card className="custom-card custom-shadow-small">
                            <Calculations/>
                        </Card>
                    </Col>
                    <Col md={12} sm={24}>
                        <Card className="custom-card custom-shadow-small">
                            <InputData/>
                        </Card>
                    </Col>
                    <Col sm={24}>
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
            </Layout.Content>
        </Layout>
        <Footer/>
    </>
}

export function Graphs() {
    return <Row justify="center">
        <Col md={12} sm={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento Patrimonial
            </Typography.Title>
        </Col>
        <Col md={12} sm={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento salarial
            </Typography.Title>
        </Col>
    </Row>
}

export function Calculations() {
    return <Row justify="center">
        <Col sm={24}>
            <Typography.Title level={5} className="title-color">
                Análisis
            </Typography.Title>
        </Col>
    </Row>
}

export function InputData() {
    return <Row justify="center">
        <Col sm={24}>
            <Typography.Title level={5} className="title-color">
                Datos
            </Typography.Title>
        </Col>
    </Row>
}
