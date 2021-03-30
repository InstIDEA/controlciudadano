import {Card, Col, Row, Space, Tooltip, Typography} from "antd";
import React from "react";
import {formatMoney, formatNumber, formatToDay} from "../../../formatters";
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
                  result={variation.amount}
                  source={variation.source}
        />

        <DataCard title="Patrimonio Neto Inicial"
                  first={props.data.firstYear.totalActive.amount}
                  second={props.data.firstYear.totalPassive.amount}
                  operator="-"
                  result={props.data.firstYear.netWorth.amount}
                  source={props.data.firstYear.netWorth.source}
        />

        <DataCard title="Patrimonio Neto final"
                  first={props.data.lastYear.totalActive.amount}
                  second={props.data.lastYear.totalPassive.amount}
                  operator="-"
                  result={props.data.lastYear.netWorth.amount}
                  source={props.data.lastYear.netWorth.source}
        />

        <DataCard title="Tiempo de análisis"
                  first={formatToDay(props.data.firstYear.date)}
                  second={formatToDay(props.data.lastYear.date)}
                  operator="a"
                  result={props.data.duration + " meses"}/>

        <DataCard title="Ingresos Totales por año"
                  first={props.data.firstYear.totalIncome.amount}
                  second={props.data.lastYear.totalIncome.amount}
                  operator="+"
                  type="division"
                  divider="2"
                  result={earnings.amount}
                  source={earnings.source}
        />

        <DataCard title="Ingresos totales en periodo"
                  first={earnings.amount}
                  second={props.data.duration}
                  operator="x"
                  result={totalIncome.amount * props.data.duration}
                  source={totalIncome.source}
        />

        <DataCard title="Ingresos para mantenimiento"
                  first={totalIncome.amount}
                  second="65%"
                  operator="x"
                  result={totalIncome.amount * 0.65}
                  source={totalIncome.source}
        />

        <DataCard title="Ingresos para inversión"
                  first={totalIncome.amount}
                  second="35%"
                  operator="x"
                  result={forInversion.amount}
                  source={forInversion.source}
        />

        <ResultCard result={result.amount}
                    actives={forInversion.amount}
                    nwVariation={variation.amount}
                    sources={variation.source}
        />
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
    source?: string
}) {

    const first = typeof props.first === 'number'
        ? formatMoney(props.first)
        : props.first;
    const second = typeof props.second === 'number'
        ? formatMoney(props.second)
        : props.second;
    const result = typeof props.result === 'number'
        ? formatMoney(props.result)
        : props.result;

    return <Col span={24}>
        <Card className="custom-card-no-shadow"
              title={<Typography.Title level={5} className="left-align">
                  {props.title}
              </Typography.Title>}
              extra={<Tooltip title="Fuente">{props.source}</Tooltip>}
              bodyStyle={{padding: 12}}>
            <Row gutter={[16, 0]} align="middle">
                <Col xs={24} sm={14} md={14} lg={14}>
                    <Row align="top" gutter={[16, 0]}>
                        <Col span={24}>
                            <Space>
                                <Typography.Paragraph>{first}</Typography.Paragraph>
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
    result: number;
    actives: number;
    nwVariation: number;
    sources: string;
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
                    <Row align="top" gutter={[0, 0]} style={{padding: 10}}>
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
                        <Col span={24} style={{color: 'darkgray', fontSize: 14}}>
                            Fuentes utilizadas: {props.sources}
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


