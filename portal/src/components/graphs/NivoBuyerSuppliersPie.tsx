import {ResponsivePie} from '@nivo/pie'
import React from 'react';
import {formatMoney} from '../../formatters';

export const NivoBuyerSuppliersPie = ({data /* see data tab */}: { data: any }) => (
    <ResponsivePie
        data={data}
        margin={{top: 40, right: 80, bottom: 80, left: 80}}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        colors={{scheme: 'nivo'}}
        borderWidth={1}
        borderColor={{from: 'color', modifiers: [['darker', 0.2]]}}
        radialLabelsSkipAngle={10}
        radialLabelsTextXOffset={6}
        radialLabelsTextColor="#333333"
        radialLabelsLinkOffset={0}
        radialLabelsLinkDiagonalLength={16}
        radialLabelsLinkHorizontalLength={24}
        radialLabelsLinkStrokeWidth={1}
        radialLabelsLinkColor={{from: 'color'}}
        sliceLabel={r => formatMoney(r.value)}
        sliceLabelsSkipAngle={10}
        sliceLabelsTextColor="#333333"
        valueFormat={v => formatMoney(v, 'PYG')}
        // animate={true}
        // tooltip={v => <>{formatMoney(v.datum.value, 'PYG')}</>}
        // tooltip={v => <PieTooltip />}
        // motionStiffness={90}
        // motionDamping={15}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
                id: 'lines',
                type: 'patternLines',
                background: 'inherit',
                color: 'rgba(255, 255, 255, 0.3)',
                rotation: -45,
                lineWidth: 6,
                spacing: 10
            }
        ]}
        legends={[{
            anchor: 'right',
            direction: 'column',
            translateY: 56,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#999',
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [{
                on: 'hover',
                style: {
                    itemTextColor: '#000'
                }
            }
            ]
        }
        ]}
    />
)
