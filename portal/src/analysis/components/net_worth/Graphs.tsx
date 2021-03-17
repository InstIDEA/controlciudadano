import {NetWorthIncreaseAnalysis} from "../../../APIModel";
import {Col, Row, Typography} from "antd";
import React, {useMemo} from "react";
import {ResponsiveLine} from "@nivo/line";
import {formatMoney, millionFormatter} from "../../../formatters";
import {NetWorthCalculations} from "../../NetWorthHook";
import './Graphs.css'

export function Graphs({data, calc}: {
    data: NetWorthIncreaseAnalysis,
    calc: NetWorthCalculations
}) {

    const netWorthIncrease = useMemo(() => {
        return [{
            data: [{
                x: `${data.firstYear.year}-01-01`,
                y: data.firstYear.netWorth.amount
            }, {
                x: `${data.lastYear.year}-01-01`,
                y: data.lastYear.netWorth.amount
            }],
            color: calc.result > 1.1
                ? '#C44040'
                : calc.result > 1
                    ? 'hsl(55, 70%, 50%)'
                    : 'hsl(99,98%,18%)',
            id: "Real"
        }, {
            id: "Leve",
            color: "hsl(55, 70%, 50%)",
            data: [{
                x: `${data.firstYear.year}-01-01`,
                y: data.firstYear.netWorth.amount
            }, {
                x: `${data.lastYear.year + 1}-01-01`,
                y: data.firstYear.netWorth.amount + (calc.nextYearForInversion * 1.1)
            }],
        }, {
            id: "Normal",
            color: "hsl(99,98%,18%)",
            data: [{
                x: `${data.firstYear.year}-01-01`,
                y: data.firstYear.netWorth.amount
            }, {
                x: `${data.lastYear.year + 1}-01-01`,
                y: data.firstYear.netWorth.amount + calc.nextYearForInversion
            }],
        }];
    }, [data]);

    const incomeIncrease = useMemo(() => {
        return [{
            id: "Ingresos",
            color: "#364D79",
            data: [{
                x: `${data.firstYear.year}-01-01`,
                y: data.firstYear.totalIncome.amount
            }, {
                x: `${data.lastYear.year}-01-01`,
                y: data.lastYear.totalIncome.amount
            }]
        },]
    }, [data]);

    return <Row justify="center" className="graphs">
        <Col md={12} xs={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento Patrimonial
            </Typography.Title>
            <div className="graph">
                <NetWorthIncrement data={netWorthIncrease}/>
            </div>
        </Col>
        <Col md={12} xs={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento de Ingresos
            </Typography.Title>
            <div className="graph">
                <NetWorthIncrement data={incomeIncrease}/>
            </div>
        </Col>
    </Row>
}


export function NetWorthIncrement(props: {
    data: Array<{
        id: string,
        color: string,
        data: Array<{
            x: string,
            y: number
        }>
    }>
}) {

    return <ResponsiveLine
        data={props.data}
        margin={{top: 50, right: 110, bottom: 50, left: 60}}
        xScale={{
            type: "time",
            format: "%Y-%m-%d"
        }}
        xFormat="time:%Y"
        colors={props.data.map(d => d.color)}
        // colors={{scheme: "nivo"}}
        yScale={{
            type: "linear",
            min: "auto",
            max: "auto",
            stacked: false,
            reverse: false
        }}
        yFormat={formatMoney}
        axisTop={null}
        axisRight={null}
        axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "",
            legendOffset: -40,
            legendPosition: "middle",
            format: millionFormatter
        }}
        axisBottom={{
            format: "%Y",
            tickValues: "every 1 year",
            // tickRotation: -90,
            legend: "",
            legendOffset: -12
        }}
        areaBaselineValue={Math.min(...props.data[0].data.map(d => d.y))}
        pointSize={2}
        pointColor={{theme: "background"}}
        pointBorderWidth={2}
        pointBorderColor={{from: "serieColor"}}
        pointLabel="y"
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: "left-to-right",
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0, 0, 0, .5)",
                effects: [
                    {
                        on: "hover",
                        style: {
                            itemBackground: "rgba(0, 0, 0, .03)",
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />;
}
