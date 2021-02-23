import React, {PropsWithChildren} from "react";
import {Header} from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {Card, Col, Input, Layout, Result, Row, Typography} from "antd";
import {Link} from "react-router-dom";
import inProgressIcon from "../../assets/imgs/analysis_in_progress.svg";


export function AnalysisLanding() {

    return <>
        <Header/>

        <Layout>
            <Layout.Content style={{minHeight: '75vh', padding: '0 5%'}}>
                <Row gutter={[16, 16]} style={{flexDirection: 'column'}}>
                    <Col>
                        <Typography.Title style={{textAlign: 'center'}} className="title-color">
                            Análisis
                        </Typography.Title>
                    </Col>
                    <Col>
                        <Typography.Paragraph style={{textAlign: 'center'}}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque nibh elit, eleifend
                            laci-nia bibendum sed, placerat sed sem. Sed vitae elit nibh. Maecenas non posuere justo,
                            varius
                            accumsan eros. Mauris vel dui at metus rutrum varius. Aliquam vitae est ac augue tristique
                            cursus. Morbi cursus tellus non placerat rhoncus. Nulla vehicula ligula justo, sed viverra
                            sem
                            gravida quis. Pellentesque ornare.
                        </Typography.Paragraph>
                    </Col>
                    <Col>
                        <Analysis videoUrl="https://www.youtube.com/embed/C_LruTtdrgo"
                                  title="Crecimiento patrimonial"
                                  description="Lorem  ipsum  dolor  sit  amet,  consectetur  adipiscing  elit.  Donec  eu  faucibus  odio,  vitae  elementum  tortor.  Suspendisse  ut  velit  tincidunt,  sollicitudin  tortor  eget,  venenatis   leo.   Aenean   venenatis   purus   dolor,   eget   mollis."
                        >
                            <Row gutter={[8, 8]} justify="center">
                                <Col>
                                    <LinkButton linkTo="/analysis/net_worth/123456" text="Ejemplo 1"/>
                                </Col>
                                <Col>
                                    <LinkButton linkTo="/analysis/net_worth/492599" text="Ejemplo 2"/>
                                </Col>
                                <Col>
                                    <Input style={{width: '100%', borderRadius: 5}}
                                           placeholder="Ingrese una cédula"/>
                                </Col>
                            </Row>
                        </Analysis>
                    </Col>
                    <Col xs={24}>
                        <Card className="custom-card" style={{width: '100%'}}>
                            <Result
                                status="info"
                                icon={<img src={inProgressIcon} alt="En progreso" style={{
                                    minWidth: 300
                                }}/>}

                                title={<Typography.Paragraph style={{color: "#CD5534"}}>
                                    Estamos trabajando en más análisis
                                </Typography.Paragraph>}
                                subTitle=""
                            />
                        </Card>
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>
        <Footer/>
    </>
}


function Analysis(props: PropsWithChildren<{
    videoUrl: string,
    title: string,
    description: string,
}>) {
    return <Card className="custom-card">
        <Row style={{minHeight: 512}} gutter={[16, 16]}>

            <Col md={12} sm={24}>
                <iframe title={props.title} src={props.videoUrl} width="100%" height="100%"/>
            </Col>
            <Col md={12} sm={24}>
                <Row gutter={[8, 8]} justify="center">
                    <Col>
                        <Typography.Title className="title-color">
                            {props.title}
                        </Typography.Title>
                    </Col>
                    <Col>
                        <Typography.Paragraph>
                            {props.description}
                        </Typography.Paragraph>
                    </Col>
                    <Col>
                        {props.children}
                    </Col>
                </Row>
            </Col>
        </Row>
    </Card>
}

function LinkButton(props: {
    linkTo: string,
    text: string
}) {
    return <Link to={props.linkTo}>
        <button className="round-button" style={{fontSize: 14}}>
            {props.text}
        </button>
    </Link>
}

