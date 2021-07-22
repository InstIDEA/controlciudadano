import {NetWorthIncreaseAnalysis} from "../../../APIModel";
import {Col, Row, Typography} from "antd";
import React, {useMemo} from "react";
import {ResponsiveLine} from "@nivo/line";
import {formatMoney, formatWF, millionFormatter} from "../../../formatters";
import {NetWorthCalculations} from "../../NetWorthHook";
import {BasicTooltip} from '@nivo/tooltip'
import './Graphs.css'

export function Graphs({data, calc}: {
    data: NetWorthIncreaseAnalysis,
    calc: NetWorthCalculations
}) {

    const netWorthIncrease = useMemo(() => {
        if (data.lastYear?.date) {
            return [{
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount
                }, {
                    x: formatWF(data.lastYear.date, 'dd-MM-yyyy'),
                    y: data.lastYear.netWorth.amount
                }],
                color: calc.result.amount > 1.1
                    ? '#C44040'
                    : calc.result.amount > 1
                        ? 'hsl(55, 70%, 50%)'
                        : 'hsl(99,98%,18%)',
                id: "Real"
            }, {
                id: "Leve",
                color: "hsl(55, 70%, 50%)",
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount
                }, {
                    x: formatWF(data.lastYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount + calc.smallIncrement.amount
                }],
            }, {
                id: "Normal",
                color: "hsl(99,98%,18%)",
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount
                }, {
                    x: formatWF(data.lastYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount + calc.normalIncrement.amount
                }],
            }];
        } else {
            return [{
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount
                }],
                color: calc.result.amount > 1.1
                    ? '#C44040'
                    : calc.result.amount > 1
                        ? 'hsl(55, 70%, 50%)'
                        : 'hsl(99,98%,18%)',
                id: "Real"
            }, {
                id: "Leve",
                color: "hsl(55, 70%, 50%)",
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount
                }],
            }, {
                id: "Normal",
                color: "hsl(99,98%,18%)",
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.netWorth.amount
                }],
            }];
        }

    }, [data, calc]);

    const periodicity: 'every 1 month' | 'every 1 year' = useMemo(() => {
        if (data.duration > 12) return 'every 1 year';
        return 'every 1 month';
    }, [data.duration])

    const incomeIncrease = useMemo(() => {
        if (data.lastYear?.date) {
            return [{
                id: "Ingresos",
                color: "#364D79",
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.totalIncome.amount
                }, {
                    x: formatWF(data.lastYear.date, 'dd-MM-yyyy'),
                    y: data.lastYear.totalIncome.amount
                }]
            },]
        } else {
            return [{
                id: "Ingresos",
                color: "#364D79",
                data: [{
                    x: formatWF(data.firstYear.date, 'dd-MM-yyyy'),
                    y: data.firstYear.totalIncome.amount
                }]
            },]
        }

    }, [data]);

    return <Row justify="center" className="graphs">
        <Col md={12} xs={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento Patrimonial
            </Typography.Title>
            <div className="graph">
                <NetWorthIncrement data={netWorthIncrease} periodicity={periodicity}/>
            </div>
        </Col>
        <Col md={12} xs={24}>
            <Typography.Title level={5} className="title-color">
                Crecimiento de Ingresos
            </Typography.Title>
            <div className="graph">
                <NetWorthIncrement data={incomeIncrease} periodicity={periodicity}/>
            </div>
        </Col>
    </Row>
}


export function NetWorthIncrement(props: {
    periodicity: 'every 1 month' | 'every 1 year'
    data: Array<{
        id: string,
        color: string,
        data: Array<{
            x: string,
            y: number
        }>
    }>
}) {

    const colors = useMemo(() => props.data.map(d => d.color), [props.data]);
    const min = useMemo(() => Math.min(...props.data[0].data.map(d => d.y)) * 0.9, [props.data]);

    return <ResponsiveLine
        data={props.data}
        margin={{top: 50, right: 110, bottom: 50, left: 60}}
        xScale={{
            type: "time",
            format: "%d-%m-%Y"
        }}
        xFormat="time:%Y"
        colors={colors}
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
            format: props.periodicity === 'every 1 month' ? "%m-%Y" : '%Y',
            tickValues: props.periodicity,
            // tickRotation: -90,
            legend: "",
            legendOffset: -12
        }}
        areaBaselineValue={min}
        pointSize={2}
        pointColor={{theme: "background"}}
        pointBorderWidth={2}
        pointBorderColor={{from: "serieColor"}}
        animate
        motionStiffness={10}

        tooltip={({point}) => {
            return <BasicTooltip
                id={
                    <span>
                        {point.serieId} {point.data.xFormatted}: <b>{point.data.yFormatted}</b> Gs.
                    </span>
                }
                enableChip={true}
                color={point.serieColor}
            />

        }}

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
