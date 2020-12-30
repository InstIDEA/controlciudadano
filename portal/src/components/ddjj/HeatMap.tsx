import * as React from 'react';
import {useEffect, useState} from 'react';
import {SimpleApi} from '../../SimpleApi';
import {message} from 'antd';
import {ResponsiveChoropleth} from '@nivo/geo';

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
    return <HeatMap data={d}/>
}

function HeatMap(props: { data: { key: string, value: number, total: number, presented: number }[] }) {

    const [geojson, setGeoJson] = useState<any>();

    useEffect(() => {
        new SimpleApi().getGeoJson()
            .then(d => setGeoJson(d))
            .catch(e => message.warn("No se pudo obtener geojson"))
        ;
    }, []);

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
    return <>
        {geojson &&
        <ResponsiveChoropleth
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
          projectionTranslation={[5.8, -1.95]}
          projectionRotation={[0, 0, 0]}
          projectionScale={3500}
          unknownColor="#ffff"
          borderWidth={0.5}
          borderColor="#333333"
          enableGraticule={false}
          graticuleLineColor="#666666"
          {...extra}
        />}
    </>

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
