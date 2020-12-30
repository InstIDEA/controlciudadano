import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {SimpleApi} from '../../SimpleApi';
import {message} from 'antd';
import {Choropleth} from '@nivo/geo';

import {ExtendedFeatureCollection, geoMercator, geoPath,} from 'd3-geo'
import {LoadingGraphComponent} from './LoadingGraph';
import {ResponsiveWrapper} from '@nivo/core';

const DEP_ALIAS: Record<string, string> = {
    'PDTE. HAYES': 'PRESIDENTE HAYES',
    'ASUNCION': 'NACIONAL',
    'NACIONAL': 'ASUNCION',
}

interface ByDepartamentAggregation {
    buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[]
}

export function ByDepartamentHeatMap(
    props: {
        loading: boolean,
        aggregations: { "departament.keyword"?: ByDepartamentAggregation }
    }) {


    const data = props.aggregations?.["departament.keyword"];
    const [lastShowedData, setLastShowedData] = useState<ByDepartamentAggregation>();

    useEffect(() => {
        if (data) setLastShowedData(data);
    }, [data])


    const d = (data || lastShowedData || emptyAgg)
        .buckets
        .map(element => {
            return {
                key: fixName(element.key),
                value: +((element.presented.doc_count / element.doc_count) * 100).toFixed(2),
                total: element.doc_count,
                presented: element.presented.doc_count
            }
        });
    return <ResponsiveWrapper>
        {({width, height}) => <HeatMap data={d} width={width} height={height}/>}
    </ResponsiveWrapper>
}

function HeatMap(props: {
    data: { key: string, value: number, total: number, presented: number }[],
    width: number,
    height: number
}) {

    const [geojson, setGeoJson] = useState<ExtendedFeatureCollection>();

    useEffect(() => {
        new SimpleApi().getGeoJson()
            .then(d => setGeoJson(d))
            .catch(_ => message.warn("No se pudo obtener geojson"))
        ;
    }, []);

    const scaleAndProjection: ScaleAndProjection | null = useMemo(() => {
        if (!geojson) return null;
        return getScaleAndProjection(geojson, props.width, props.height)

    }, [geojson, props.width, props.height])

    if (!geojson || !scaleAndProjection) {
        return <LoadingGraphComponent/>
    }


    const extra: any = {
        legends: [{
            anchor: 'bottom-right',
            direction: 'column',
            justify: false,
            translateX: -5,
            translateY: -5,
            itemsSpacing: 0,
            itemWidth: 94,
            itemHeight: 18,
            itemDirection: 'right-to-left',
            itemTextColor: '#444444',
            itemOpacity: 0.85,
            symbolSize: 18,
            effects: [{
                on: 'hover',
                style: {
                    itemTextColor: '#000000',
                    itemOpacity: 1
                }
            }]
        }]
    }
    return <Choropleth
        width={props.width}
        height={props.height}
        data={props.data}
        domain={[0, 100]}
        match={(feature, datum) => {
            return feature.properties.dpto_desc === datum.key;
        }}
        label={(datum) => {
            return datum.data.key + ' (' + datum.data.presented + '/' + datum.data.total + ')\n' +
                ' Porcentaje '
        }}
        valueFormat={(value) => {
            return Math.round(value + 0.5) + '%'
        }}
        features={geojson.features}
        colors="greens"
        margin={{top: 0, right: 0, bottom: 0, left: 0}}
        projectionTranslation={scaleAndProjection.translate}
        projectionRotation={[0, 0, 0]}
        projectionScale={scaleAndProjection.scale}
        unknownColor="#ffff"
        borderWidth={0.5}
        borderColor="#333333"
        enableGraticule={false}
        graticuleLineColor="#666666"
        {...extra}
    />

}

const emptyAgg: ByDepartamentAggregation = {
    buckets: [{
        key: '',
        doc_count: 0,
        presented: {doc_count: 0}
    }]
}

function fixName(deptName: string) {
    return deptName.includes('EEMBUCU')
        ? 'ÑEEMBUCU'
        : DEP_ALIAS[deptName] || deptName;
}


interface ScaleAndProjection {
    scale: number,
    translate: [number, number]
}

function getScaleAndProjection(
    features: ExtendedFeatureCollection,
    width: number,
    height: number
): ScaleAndProjection {
    // Create a unit projection.
    const projection = geoMercator()
        .scale(1)
        .translate([0, 0]);
// Create a path generator.
    const path = geoPath()
        .projection(projection);
// Compute the bounds of a feature of interest, then derive scale & translate.
    const b = path.bounds(features);
    const scale = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height)
    const translate: [number, number] = [
        (width - scale * (b[1][0] + b[0][0])) / 2 / width,
        (height - scale * (b[1][1] + b[0][1])) / 2 / height
    ];

// Update the projection to use computed scale & translate.
    return {scale, translate}
}
