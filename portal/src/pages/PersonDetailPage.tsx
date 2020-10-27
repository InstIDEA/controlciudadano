import * as React from 'react';
import { Row, Col, Card, Space, Typography } from 'antd';
import { AffidavitTable } from '../components/AffidavitTable';
import { Header } from '../components/layout/Header';
import './PersonDetailPage.css'
import Footer from '../components/layout/Footer';
export function PersonDetailPage() {

    const spans = { xxl: { offset: 0, span: 7 }, xl: { offset: 0, span: 7 }, lg: { offset: 0, span: 7 }, md: { offset: 0, span: 9 }, sm: { offset: 0, span: 24 }, xs: { offset: 0, span: 24 } };
    const config = { xxl: { offset: 2, span: 21 }, xl: { offset: 2, span: 21 }, lg: { offset: 2, span: 21 }, md: { offset: 0, span: 20 }, sm: { offset: 0, span: 24 }, xs: { offset: 0, span: 24 } };

    return <>
        <Header tableMode={true} />
        <Row gutter={[16, 16]}>
            <Col {...config}>
                <Typography.Title level={2} className="title-layout-content">
                    Horacio Cartes
                            </Typography.Title>
            </Col>
            <Space direction="vertical" />
            <Col {...config}>
                <Card className="card-style header-title-big" title="Titulo">
                    <Typography.Text className="text-layout-content">
                        Descripción
                                </Typography.Text>
                </Card>
            </Col>
            <Col {...config}>
                <Card className="card-style header-title-big" title="Titulo">
                    <Typography.Text className="text-layout-content" strong>
                        Nombre:
                                </Typography.Text>
                    <Typography.Text className="text-layout-content">
                        Nombre
                                </Typography.Text>
                    <br />
                    <Typography.Text className="text-layout-content" strong>
                        Fecha de Nacimiento:
                                </Typography.Text>
                    <Typography.Text className="text-layout-content">
                        xx/xx/xx
                                </Typography.Text>
                </Card>
            </Col>
            <Col xxl={{ offset: 2, span: 7 }} lg={{ offset: 2, span: 7 }} md={{ offset: 0, span: 9 }} sm={{ offset: 0, span: 24 }} xs={{ offset: 0, span: 24 }}>
                <Card className="data-box" title="Pytyvo" style={{ height: '200px' }}
                >
                </Card>
            </Col>
            <Col {...spans}>
                <Card className="data-box" title="Ñangareko" style={{ height: '200px' }}
                >
                </Card>
            </Col>
            <Col {...spans}>
                <Card className="data-box" title="SFP" style={{ height: '200px' }}
                >
                </Card>
            </Col>
            <Col xxl={{ offset: 2, span: 7 }} lg={{ offset: 2, span: 7 }} md={{ offset: 0, span: 9 }} sm={{ offset: 0, span: 24 }} xs={{ offset: 0, span: 24 }}>
                <Card className="data-box" title="Salarios SFP" style={{ height: '200px' }}
                >
                </Card>
            </Col>
            <Col {...spans}>
                <Card className="data-box" title="Policía Nacional" style={{ height: '200px' }}
                >
                </Card>
            </Col>
            <Col {...spans}>
                <Card className="data-box" title="ANDE" style={{ height: '200px' }}
                >
                </Card>
            </Col>
            <Col xxl={{ offset: 2, span: 21 }} xl={{ offset: 2, span: 21 }} lg={{ offset: 2, span: 21 }} md={{ offset: 0, span: 24 }} sm={{ offset: 0, span: 24 }} xs={{ offset: 0, span: 24 }} style={{ textAlign: 'left' }}>
                <Card className="card-style"
                >
                    <AffidavitTable data={[]} working={false} />
                </Card>
            </Col>
        </Row>
        <Footer tableMode={true} />
    </>

}