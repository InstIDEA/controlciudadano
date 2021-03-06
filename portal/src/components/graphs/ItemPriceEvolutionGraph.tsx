import * as React from 'react';
import {useMemo} from 'react';
import {AdjustedAmount, OCDSItemPriceEvolution} from '../../Model';
import {NodeComponent, ResponsiveScatterPlot, Serie} from '@nivo/scatterplot'
import {format} from "date-fns";
import {es} from "date-fns/locale";
import {formatMoney} from '../../formatters';
import {lerpMax} from '../../MathUtils';
import {Descriptions} from 'antd';


const commonProperties = {
    width: 1200,
    height: 700,
    margin: {top: 20, right: 20, bottom: 60, left: 20},
    animate: false,
    enableSlices: 'x',
}

export function ItemPriceEvolutionGraph(props: {
    points: OCDSItemPriceEvolution[],
    adjusted: boolean,
    log: boolean
}) {

    const points = props.points;

    const maxQuantity = useMemo(() => Math.max(...points.map(p => parseInt(p.quantity))), [points]);
    const minPrice = useMemo(() => Math.min(...points.map(p => p.price.inflated)), [points]);
    const maxPrice = useMemo(() => Math.max(...points.map(p => parseInt(p.price.inflated + ""))), [points]);

    const divideBy = useMemo(() => {
        return minPrice > 1_000_000_000
            ? 1_000_000_000
            : minPrice > 1_000_000
                ? 1_000_000
                : minPrice > 1_000
                    ? 1_000
                    : 1
    }, [minPrice]);

    const serie: Serie[] = useMemo(() => [{
        id: 'Precios',
        data: points.map(p => ({
            title: p.item,
            x: format(new Date(p.date), 'yyyy-MM-dd', {locale: es}),
            y: parseInt(props.adjusted ? p.price.inflated + "" : p.price.in_gs + ""),
            quantity: parseInt(p.quantity),
            covid: (p.flags || []).includes('covid_19'),
            amount: p.price
        })).sort((p1, p2) => p1.x.localeCompare(p2.x))
    }], [points, props.adjusted]);

    return <ResponsiveScatterPlot
        {...commonProperties}
        data={serie}
        xScale={{
            type: 'time',
            format: '%Y-%m-%d',
            useUTC: false,
            precision: 'day',
        }}
        xFormat="time:%Y-%m-%d"
        yScale={props.log
            ? {type: 'log', base: 10}
            : {type: 'linear', stacked: false}
        }
        yFormat={x => formatMoney((x as number) / divideBy)}
        nodeSize={(x: any) => lerpMax(9, 19, (x as any).quantity, maxQuantity)}
        tooltip={({node}: any) => {
            return <div style={{
                backgroundColor: 'white',
                width: 300,
                zIndex: 999999,
                overflow: 'visible',
                position: node.data.amount.inflated / maxPrice > 0.5 ? 'absolute' : undefined
            }}>
                <Legend title={node.data.title}
                        amount={node.data.amount}
                        formattedX={node.data.formattedX}
                        quantity={node.data.quantity}
                        covid={node.data.covid}/>
            </div>
        }}
        axisLeft={{
            legend: 'Precio',
            legendOffset: 12,
            format: val => {
                return formatMoney((val as number) / divideBy);
            }
        }}
        margin={{
            top: 60,
            right: 50,
            bottom: 70,
            left: props.log ? 30 : 45,
        }}
        axisBottom={{
            format: '%Y-%m',
            tickValues: 'every 6 month',
            legend: 'Fecha',
            legendOffset: 60,
            tickRotation: -90
        }}
        useMesh={false}
        renderNode={CustomNode}
    />
}


const CustomNode: NodeComponent = ({
                                       node,
                                       x,
                                       y,
                                       size,
                                       color,
                                       blendMode,
                                       onMouseEnter,
                                       onMouseMove,
                                       onMouseLeave,
                                       onClick,
                                   }) => {
    if ((node.data as any).covid) {
        return <g transform={`translate(${x},${y})`}>
            <circle
                r={size / 2}
                stroke={'white'}
                fill="red"
                strokeWidth="1"
                style={{mixBlendMode: blendMode}}
                onMouseEnter={onMouseEnter}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            />
        </g>
    }

    return <g transform={`translate(${x},${y})`}>
        <circle
            r={size / 2}
            stroke={'white'}
            fill={color}
            strokeWidth="1"
            color={'white'}
            style={{mixBlendMode: blendMode}}
            onMouseEnter={onMouseEnter}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
        />
    </g>
}

function Legend(props: {
    title: string
    amount: AdjustedAmount,
    formattedX: string,
    quantity: number,
    covid: boolean,
}) {
    const amount = props.amount;
    return <Descriptions title={props.title} bordered column={1} size="small">
        <Descriptions.Item label="Fecha" className="align-right-desc">
            {props.formattedX}
        </Descriptions.Item>
        <Descriptions.Item label="Cantidad" className="align-right-desc">
            {formatMoney(props.quantity)}
        </Descriptions.Item>
        <Descriptions.Item label="Precio Ajustado" className="align-right-desc">
            {formatMoney(amount.inflated, 'PYG')}
        </Descriptions.Item>
        <Descriptions.Item label="Total Ajustado" className="align-right-desc">
            {formatMoney(props.quantity * amount.inflated, 'PYG')}
        </Descriptions.Item>
        <Descriptions.Item label="Precio original" className="align-right-desc">
            {formatMoney(amount.original_amount, amount.original_currency)}
        </Descriptions.Item>
        <Descriptions.Item label="Total original" className="align-right-desc">
            {formatMoney(props.quantity * amount.original_amount, amount.original_currency)}
        </Descriptions.Item>

    </Descriptions>
}
