import React, {useCallback, useState} from "react";
import {Header} from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {Button, Card, Col, Layout, Row, Space, Typography} from "antd";
import {useParams} from "react-router-dom";
import {DownloadOutlined} from "@ant-design/icons";
import {DisclaimerComponent} from "../../components/Disclaimer";
import {DeclarationData, NetWorthIncrementData} from "../AnalysisModel";
import {Calculations} from "../components/net_worth/Calculations";
import {InputData} from "../components/net_worth/InputData";
import {Graphs} from "../components/net_worth/Graphs";


export function AnalysisNetWorthIncrement() {

    const {document} = useParams<{ document: string }>();
    const data = useDeclarationData(document);

    return <>
        <Header/>

        <Layout>
            <Layout.Content style={{padding: '0 30px'}}>
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} xl={18}>
                        <Row align="middle" justify="center">
                            <Col xs={22}>
                                <Typography.Title className="title-color" style={{textAlign: 'center'}}>
                                    Crecimiento Patrimonial de {document} según Declaraciones Juradas de Bienes y
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
                            <InputData data={data.data} updateDate={data.setYearData}/>
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
            </Layout.Content>
        </Layout>
        <Footer/>
    </>
}

function useDeclarationData(document: string) {

    const [data, setData] = useState<NetWorthIncrementData>({
        person: {
            document,
            name: 'Cargando...'
        },
        duration: 60,
        firstYear: calculateData({
            otherActives: 1200000000,
            income: 10000000,
            active: 0,
            activeDetails: [],
            netWorth: 0,
            passive: 18000000,
            year: 2015
        }),
        lastYear: calculateData({
            otherActives: 1400000000,
            income: 15000000,
            active: 0,
            activeDetails: [],
            netWorth: 0,
            passive: 14000000,
            year: 2020
        })
    })

    const setYearData = useCallback((newData: DeclarationData) => {
        setData(d => ({
            ...d,
            firstYear: newData.year === d.firstYear.year ? calculateData(newData) : d.firstYear,
            lastYear: newData.year === d.lastYear.year ? calculateData(newData) : d.lastYear
        }))

    }, []);

    return {
        data,
        setYearData
    }
}


function calculateData(data: DeclarationData) {

    const active = data.income + data.otherActives;
    const netWorth = active - data.passive;
    return {
        ...data,
        active,
        netWorth
    }
}
