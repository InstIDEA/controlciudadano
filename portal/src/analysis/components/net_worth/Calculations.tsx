import {Card, Col, Row, Space, Tooltip, Typography} from "antd";
import React from "react";
import {formatMoney, formatNumber} from "../../../formatters";
import {NetWorthIncreaseAnalysis, DeclarationData} from "../../../APIModel";
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

    return <div>
        <div className="screen-only">
            <Row justify="center" gutter={[8, 8]}>
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
        </div>
        <div className="print-only">
            <table className="nw-calc">
                <tr className="row-header">
                    <th colSpan={3} className="col-align-left">ANÁLISIS</th>
                    <th className="col-align-right">FUENTE</th>
                </tr>
                <tr>
                    <td colSpan={4} className="row-divider"></td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">TIEMPO DE ANÁLISIS</td>
                    <td></td>
                    <td className="col-align-right col-value">{props.data.duration + " AÑOS"}</td>
                    <td className="col-align-right col-value">DJBR</td>
                </tr>
                <tr>
                    <td colSpan={4} className="row-divider"></td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">VARIACIÓN</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(variation.amount)}</td>
                    <td className="col-align-right col-value">{variation.source}</td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">PATRIMONIO NETO INICIAL</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(props.data.firstYear.netWorth.amount)}</td>
                    <td className="col-align-right col-value">{props.data.firstYear.netWorth.source}</td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">PATRIMONIO NETO FINAL</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(props.data.lastYear.netWorth.amount)}</td>
                    <td className="col-align-right col-value">{props.data.lastYear.netWorth.source}</td>
                </tr>
                <tr>
                    <td colSpan={4} className="row-divider"></td>
                </tr>
                <tr className="row-header">
                    <td className="col-align-left">INGRESOS</td>
                    <td></td>
                    <td className="col-align-right">TOTALES</td>
                    <td></td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">POR AÑO</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(earnings.amount)}</td>
                    <td className="col-align-right col-value">{earnings.source}</td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">EN PERIODO</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(totalIncome.amount * props.data.duration)}</td>
                    <td className="col-align-right col-value">{totalIncome.source}</td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">PARA MANTENIMIENTO</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(totalIncome.amount * 0.65)}</td>
                    <td className="col-align-right col-value">{totalIncome.source}</td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">PARA INVERSIÓN</td>
                    <td></td>
                    <td className="col-align-right col-value">{formatMoney(forInversion.amount)}</td>
                    <td className="col-align-right col-value">{forInversion.source}</td>
                </tr>
                <tr>
                    <td colSpan={4} className="row-divider"></td>
                </tr>
                <tr className="row-header">
                    <td></td>
                    <td className="col-align-right">CONSISTENCIA</td>
                    <td className="col-align-right">VALOR</td>
                    <td></td>
                </tr>
                <tr>
                    <td className="row-header col-align-left">RESULTADO DEL ANÁLISIS</td>
                    <td className="col-align-right col-value">
                        { result.amount >  1.1 ? "ALTA" : 
                        result.amount >  1 ? "MEDIA" : 
                        "BAJA" }
                    </td>
                    <td className="col-align-right col-value">{result.amount.toFixed(2)}</td>
                    <td className="col-align-right col-value">{variation.source}</td>
                </tr>
            </table>
            <div className="print-pagebreak"></div>
            <DeclarationDataTable data={props.data.firstYear}/>
            <div className="print-pagebreak"></div>
            <DeclarationDataTable data={props.data.lastYear}/>
        </div>
    </div>
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

function DeclarationDataTable(props: {
        data: DeclarationData
}) {
    return <table className="nw-calc">
        <tr className="row-header">
            <th colSpan={4} className="col-align-left">DECLARACIÓN {props.data.year}</th>
        </tr>
        <tr>
            <td colSpan={4} className="row-divider"></td>
        </tr>
        <tr className="row-header">
            <td colSpan={2} className="col-align-left">DATOS</td>
            <td className="col-align-right">VALOR</td>
            <td className="col-align-right">FUENTE</td>
        </tr>
        <tr>
            <td className="row-header col-align-left">TOTAL ACTIVOS</td>
            <td></td>
            <td className="col-align-right col-value">{formatMoney(props.data.totalActive.amount)}</td>
            <td className="col-align-right col-value">{props.data.totalActive.source}</td>
        </tr>
        <tr>
            <td className="row-header col-align-left">TOTAL PASIVOS</td>
            <td></td>
            <td className="col-align-right col-value">{formatMoney(props.data.totalPassive.amount)}</td>
            <td className="col-align-right col-value">{props.data.totalPassive.source}</td>
        </tr>
        <tr>
            <td className="row-header col-align-left">PATRIMONIO NETO</td>
            <td></td>
            <td className="col-align-right col-value">{formatMoney(props.data.netWorth.amount)}</td>
            <td className="col-align-right col-value">{props.data.netWorth.source}</td>
        </tr>
        <tr>
            <td colSpan={4} className="row-divider"></td>
        </tr>
        <tr className="row-header">
            <td className="col-align-left">INGRESOS</td>
            <td></td>
            <td className="col-align-right"></td>
            <td></td>
        </tr>
        <tr>
            <td className="row-header col-align-left">ANUAL</td>
            <td></td>
            <td className="col-align-right col-value">{formatMoney(props.data.totalIncome.amount)}</td>
            <td className="col-align-right col-value">{props.data.totalIncome.source}</td> 
        </tr>
        {props.data.incomes.map(ingreso =><tr key="ingreso.name">
            <td className="row-header col-align-left">
                {ingreso.periodicity.replaceAll("monthly", "Mensual").replaceAll("yearly", "Anual").toUpperCase()}
            </td>
            <td></td>
            <td className="col-align-right col-value">{formatMoney(ingreso.amount)}</td>
            <td className="col-align-right col-value">{ingreso.source}</td>
        </tr>
        )}
    </table>
}

