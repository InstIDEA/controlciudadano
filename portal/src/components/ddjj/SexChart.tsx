import * as React from 'react';
import {ResponsiveBar} from '@nivo/bar';
import {formatMoney} from '../../formatters';

const NAMES: Record<string, string> = {
    'm': 'Masculino',
    'f': 'Femenino',
    'presented': 'Presentados',
    'notPresented': 'No presentados'
}

export function SexChart(props: {
    m: { presented: number, notPresented: number },
    f: { presented: number, notPresented: number }
}) {

    const min = Math.min(props.m.presented + props.m.notPresented, props.f.presented, props.f.notPresented);
    const max = Math.max(props.m.presented + props.m.notPresented, props.f.presented, props.f.notPresented);

    const data = [{
        key: 'm',
        presented: props.m.presented,
        notPresented: props.m.notPresented
    }, {
        key: 'f',
        presented: props.f.presented,
        notPresented: props.f.notPresented
    }];
    return <ResponsiveBar
        data={data}
        keys={['presented', 'notPresented']}
        indexBy="key"
        margin={{top: 20, right: 20, bottom: 50, left: 50}}
        padding={0.3}
        colors={{scheme: 'nivo'}}
        enableGridX={false}
        enableGridY={true}
        defs={[{
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: '#38bcb2',
            size: 4,
            padding: 1,
            stagger: true
        }, {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: '#eed312',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
        }
        ]}
        borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            format: t => NAMES[`${t}`],
            legend: null
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            tickValues: 7,
            format: t => `${formatMoney(t)}`,
            legend: null,
        }}

        labelFormat={t => formatMoney(t)}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}

        tooltip={(props) => <span>
            {NAMES[props.id]}: <b>{formatMoney(props.value)}</b>
        </span>}

        tooltipFormat={t => `${formatMoney(t)}`}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
    />
}
