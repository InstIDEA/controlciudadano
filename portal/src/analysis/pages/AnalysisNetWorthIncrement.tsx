import React, {useCallback, useState} from "react";
import {Header} from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {Button, Card, Col, Layout, Row, Space, Typography} from "antd";
import {useParams} from "react-router-dom";
import {DownloadOutlined} from "@ant-design/icons";
import {DisclaimerComponent} from "../../components/Disclaimer";
import {Calculations} from "../components/net_worth/Calculations";
import {InputData} from "../components/net_worth/InputData";
import {Graphs} from "../components/net_worth/Graphs";
import {useNetWorthAnalysis} from "../../hooks/useApi";
import {DeclarationData, NetWorthIncreaseAnalysis} from "../../APIModel";
import {FinancialDetail} from "../../../../api/src/APIModel";
import {AsyncHelper} from "../../Model";
import {debounce} from 'lodash';


export function AnalysisNetWorthIncrement() {

    const {document} = useParams<{ document: string }>();
    const fetched = useNetWorthAnalysis(document);

    const name = AsyncHelper.or(AsyncHelper.map(fetched, dat => dat.person.name), document);

    return <>
        <Header/>

        <Layout>
            <Layout.Content style={{padding: '0 30px', minHeight: '75vh'}}>
                <Row gutter={[16, 16]} justify="center">
                    <Col xs={24} xl={18}>
                        <Row align="middle" justify="center">
                            <Col xs={22}>
                                <Typography.Title className="title-color" style={{textAlign: 'center'}}>
                                    Crecimiento Patrimonial de '{name}' según Declaraciones Juradas de Bienes y
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
                    {fetched.state === 'LOADED' && <Analysis data={fetched.data}/>}
                    {fetched.state !== 'LOADED' && <div>Cargando ...</div>}
                </Row>
            </Layout.Content>
        </Layout>
        <Footer/>
    </>
}

function Analysis(props: {
    data: NetWorthIncreaseAnalysis
}) {

    const data = useDeclarationData(props.data);

    return <Row gutter={[16, 16]} justify="center">
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

}

function useDeclarationData(base: NetWorthIncreaseAnalysis) {

    const [data, setData] = useState<NetWorthIncreaseAnalysis>(() => ({
        ...base,
        firstYear: calcTotals(base.firstYear),
        lastYear: calcTotals(base.lastYear)
    }));

    const setYearData = useCallback(debounce((newData: DeclarationData) => {
        setData(d => ({
            ...d,
            firstYear: newData.year === d.firstYear.year ? calcTotals(newData) : d.firstYear,
            lastYear: newData.year === d.lastYear.year ? calcTotals(newData) : d.lastYear
        }))
    }, 1000), []);

    return {
        data,
        setYearData
    }
}


function calcTotals(base: DeclarationData): DeclarationData {
    const data: DeclarationData = {
        ...base,
        totalActive: validNumber(base.totalActive) ? base.totalActive : sum(base.actives),
        totalPassive: validNumber(base.totalPassive) ? base.totalPassive : sum(base.passives),
        totalIncome: sum(base.incomes),
        totalExpenses: validNumber(base.totalExpenses) ? base.totalExpenses : sum(base.expenses)
    };
    data.netWorth = data.totalActive - data.totalPassive;
    return data;
}

function validNumber(val?: number): boolean {
    return !!(val && val > 0)
}

function sum(arr: Array<FinancialDetail>): number {
    return arr.map(d => d.amount * (d.periodicity === 'yearly' ? 1 : 12))
        .reduce((a, b) => a + b, 0)
}
