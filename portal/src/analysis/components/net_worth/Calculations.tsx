import {Card, Col, Row, Space, Typography} from "antd";
import React from "react";
import {formatMoney, formatNumber} from "../../../formatters";
import {NetWorthIncreaseAnalysis} from "../../../APIModel";
import {NetWorthCalculations} from "../../NetWorthHook";

export function Calculations(props: {
    data: NetWorthIncreaseAnalysis,
    calculations: NetWorthCalculations
}) {

    const {
        earnings,
        totalIncome,
        forInversion,
        variation,
        result
    } = props.calculations;

    return <Row justify="center" gutter={[8, 8]}>
        <Col sm={24}>
            <Typography.Title level={5} className="title-color">
                Análisis
            </Typography.Title>
        </Col>

        <DataCard title="Variación"
                  first={props.data.lastYear.netWorth.amount}
                  second={props.data.firstYear.netWorth.amount}
                  operator="-"
                  result={variation}/>

        <DataCard title="Patrimonio Neto Inicial"
                  first={props.data.firstYear.totalActive.amount}
                  second={props.data.firstYear.totalPassive.amount}
                  operator="-"
                  result={props.data.firstYear.netWorth.amount}/>

        <DataCard title="Patrimonio Neto final"
                  first={props.data.lastYear.totalActive.amount}
                  second={props.data.lastYear.totalPassive.amount}
                  operator="-"
                  result={props.data.lastYear.netWorth.amount}/>

        <DataCard title="Tiempo de análisis"
                  first={props.data.lastYear.year}
                  second={props.data.firstYear.year}
                  operator="a"
                  result={props.data.duration + " años"}/>

        <DataCard title="Ingresos Totales por año"
                  first={props.data.firstYear.totalIncome.amount}
                  second={props.data.lastYear.totalIncome.amount}
                  operator="+"
                  type="division"
                  divider="2"
                  result={earnings}/>

        <DataCard title="Ingresos totales en periodo"
                  first={earnings}
                  second={props.data.duration}
                  operator="x"
                  result={totalIncome}/>

        <DataCard title="Ingresos para mantenimiento"
                  first={totalIncome}
                  second="65%"
                  operator="x"
                  result={totalIncome * 0.65}/>

        <DataCard title="Ingresos para inversión"
                  first={totalIncome}
                  second="35%"
                  operator="x"
                  result={forInversion}/>

        <ResultCard result={result} actives={forInversion} nwVariation={variation}/>
    </Row>
}

function DataCard(props: {
    title: string,
    type?: 'simple' | 'division',
    first: string | number,
    second: string | number,
    divider?: string | number,
    operator: string,
    result: string | number,
}) {

    const second = typeof props.second === 'number'
        ? formatMoney(props.second)
        : props.second;
    const result = typeof props.result === 'number'
        ? formatMoney(props.result)
        : props.result;

    return <Col span={24}>
        <Card className="custom-card-no-shadow" bodyStyle={{padding: 12}}>
            <Row gutter={[16, 0]} align="middle">
                <Col xs={24}>
                    <Typography.Title level={5} style={{textAlign: 'left'}}>
                        {props.title}
                    </Typography.Title>
                </Col>
                <Col xs={24} sm={14} md={14} lg={14}>
                    <Row align="top" gutter={[16, 0]}>
                        <Col span={24}>
                            <Space>
                                <Typography.Paragraph>{formatMoney(props.first)}</Typography.Paragraph>
                                <Typography.Paragraph>{props.operator}</Typography.Paragraph>
                                <Typography.Paragraph>{second}</Typography.Paragraph>
                            </Space>
                        </Col>
                        {props.type === 'division' ? <Col span={24}>
                            <hr/>
                        </Col> : null}
                        {props.type === 'division' ? <Col span={24}>
                            <Typography.Paragraph>{formatMoney(props.divider)}</Typography.Paragraph>
                        </Col> : null}
                    </Row>
                </Col>
                <Col xs={{offset: 1, span: 1}} sm={1}>
                    <Typography.Paragraph>=</Typography.Paragraph>
                </Col>
                <Col xs={20} sm={5} lg={8}>
                    <Typography.Paragraph>{result}</Typography.Paragraph>
                </Col>
            </Row>
        </Card>
    </Col>
}

function ResultCard(props: {
    result: number,
    actives: number,
    nwVariation: number
}) {
    const color = props.result > 1.1
        ? '#DF2935'
        : props.result > 1.0
            ? '#FED766'
            : '#C5D86D';
    const resultFontColor = 'white';
    return <Col span={24}>
        <div>
            <Row align="middle">
                <Col span={21} style={{
                    padding: 0,
                    borderWidth: 2,
                    borderColor: "#003459",
                    borderTopLeftRadius: 20,
                    borderBottomLeftRadius: 20,
                    borderTopStyle: 'solid',
                    borderLeftStyle: 'solid',
                    borderBottomStyle: 'solid',
                }}>
                    <Row align="top" gutter={[8, 0]} style={{padding: 10}}>
                        <Col span={24}>
                            <Typography.Title level={5} style={{textAlign: 'left'}}>
                                Resultado de análisis
                            </Typography.Title>
                        </Col>
                        <Col span={24}>
                            <Space>
                                <Typography.Paragraph>{formatNumber(props.nwVariation)}</Typography.Paragraph>
                                <Typography.Paragraph>/</Typography.Paragraph>
                                <Typography.Paragraph>{formatNumber(props.actives)}</Typography.Paragraph>
                            </Space>
                        </Col>
                        <Col span={24}>
                            <hr/>
                        </Col>
                        <Col span={24}>
                            <Space>
                                <Typography.Paragraph>Variación del Patrimonio</Typography.Paragraph>
                                <Typography.Paragraph>/</Typography.Paragraph>
                                <Typography.Paragraph>35% de ingresos</Typography.Paragraph>
                            </Space>
                        </Col>
                    </Row>
                </Col>
                <Col span={3} style={{
                    backgroundColor: color,
                    borderWidth: 2,
                    borderColor: "#003459",
                    borderTopRightRadius: 20,
                    borderBottomRightRadius: 20,
                    borderTopStyle: 'solid',
                    borderRightStyle: 'solid',
                    borderBottomStyle: 'solid',
                    alignSelf: 'stretch',
                    color: 'black'
                }}>
                    <div style={{
                        display: "flex",
                        fontWeight: "bolder",
                        justifyContent: "center",
                        alignItems: "center",
                        height: '100%',
                        color: resultFontColor,
                    }}>
                        {props.result.toFixed(2)}
                    </div>
                </Col>
            </Row>
        </div>
    </Col>
}
