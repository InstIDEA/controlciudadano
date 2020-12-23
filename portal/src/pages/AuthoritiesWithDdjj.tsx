import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Avatar, Card, Col, Collapse, Comment, Divider, Layout, message, Row, Tag, Tooltip, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './AuthoritiesWithDdjj.css'
import Footer from '../components/layout/Footer';
import {MultiList, ReactiveBase, ReactiveComponent, ReactiveList, SelectedFilters} from '@appbaseio/reactivesearch';
import {useMediaQuery} from '@react-hook/media-query'
import {formatMoney} from '../formatters';
import {Link} from 'react-router-dom';
import {fixName} from '../nameUtils';
import {ResponsiveBar} from '@nivo/bar'
import {ResponsivePie} from '@nivo/pie';
import {ResponsiveChoropleth} from '@nivo/geo'
import {SimpleApi} from '../SimpleApi';
import {LoadingGraphComponent} from '../components/ddjj/LoadingGraph';
import {SexChart} from '../components/ddjj/SexChart';


export function AuthoritiesWithDdjj() {

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');

    const filter = useMemo(() => <Filter/>, []);

    return <ReactiveBase url="https://data.controlciudadanopy.org/" app="fts_authorities_ddjj">
        <Header tableMode={true}/>

        <Layout>
            {!isSmall && <Layout.Sider width="20vw">
                {filter}
            </Layout.Sider>}
            <Layout>
                <Layout.Content className="content-padding">
                    {isSmall && <Row>
                      <Col xs={{span: 24}}>
                        <Collapse defaultActiveKey={['2']} bordered={false}>
                          <Collapse.Panel header="Filtros" key="1">
                              {filter}
                          </Collapse.Panel>
                        </Collapse>
                      </Col>
                    </Row>}
                    <Row>
                        <Col xs={{span: 24}}>
                            <Card className="card-style" title="Filtros" style={{width: '100%'}}>
                                <CurrentFilters/>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Card className="card-style info-ddjj" style={{width: '100%'}}>
                            <Typography.Text style={{color: "white", fontSize: '18px'}}>
                                Podrían existir Declaraciones Juradas presentadas pero no así publicadas por la
                                Contraloría General de la República
                            </Typography.Text>
                        </Card>
                    </Row>
                    <ChartsComponent/>
                    <ResultComponent isSmall={isSmall}/>
                </Layout.Content>
            </Layout>
        </Layout>
        <Footer tableMode={true}/>
    </ReactiveBase>

}


function Filter() {

    return <Col xs={{span: 24}} style={{padding: 5}}>
        <Card title="" className="card-style">

            <Typography.Title className="ant-card-head"
                              style={{paddingLeft: 0, paddingTop: 10}}>Año</Typography.Title>
            <MultiList componentId="year_elected"
                       dataField="year_elected"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={false}
                       react={{
                           and: ['departament', 'list', 'year_elected'],
                       }}
            />
            <Divider orientation="left" plain/>
            <Typography.Title className="ant-card-head"
                              style={{paddingLeft: 0, paddingTop: 10}}>Departamento</Typography.Title>
            <MultiList componentId="departament"
                       dataField="departament.keyword"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={true}
                       placeholder='Buscar'
                       react={{
                           and: ['year_elected', 'list', 'departament'],
                       }}
            /><Divider orientation="left" plain/>
            <Typography.Title className="ant-card-head"
                              style={{paddingLeft: 0, paddingTop: 10}}>Partido Político</Typography.Title>
            <MultiList componentId="list"
                       dataField="list.keyword"
                       queryFormat="and"
                       className="multi-list"
                       innerClass={{
                           listSearch: 'list-search'
                       }}
                       showCheckbox
                       URLParams
                       showSearch={true}
                       placeholder='Buscar'
                       style={{}}
                       react={{
                           and: ['year_elected', 'departament', 'list'],
                       }}
            />
        </Card>
    </Col>
}

function CurrentFilters() {

    return <SelectedFilters showClearAll={true}
                            clearAllLabel="Limpiar"
                            render={(props) => {
                                const {selectedValues, setValue} = props;
                                const clearFilter = (component: string) => {
                                    setValue(component, null);
                                };

                                return <>
                                    {Object.keys(selectedValues).map(key => {
                                        const component = selectedValues[key];

                                        if (!component.value) {
                                            return <> </>
                                        }

                                        if (Array.isArray(component.value)) {
                                            return component.value.map((val: unknown) => <Tag
                                                color={FilterColors[key] || 'gray'}
                                                closable
                                                key={`${key}_${val}`}
                                                onClose={() => setValue(key, component.value.filter((sb: unknown) => sb !== val))}
                                            >
                                                {getFilterKeyName(key)}: {val}
                                            </Tag>)
                                        }

                                        let label = JSON.stringify(component.value);
                                        if (typeof component.value === 'string') {
                                            label = component.value;
                                        }
                                        if (typeof component.value === 'object' && 'label' in component.value) {
                                            label = component.value.label;
                                        }

                                        return <Tag closable
                                                    color={FilterColors[key] || 'gray'}
                                                    onClose={() => clearFilter(key)}
                                                    key={key}>
                                            {getFilterKeyName(key)}: {label}
                                        </Tag>
                                    })}
                                </>;
                            }}
    />
}

function ResultComponent(props: {
    isSmall: boolean
}) {

    return <Col xs={{span: 24}}>
        <Card title="Autoridades Electas" className="card-style">
            <Col xs={{span: 24}}>
                {!props.isSmall && <ResultHeader/>}
                <ReactiveList
                    dataField="document.keyword"
                    componentId="SearchResult"
                    react={{
                        and: ['list', 'year_elected', 'department']
                    }}
                    infiniteScroll={false}
                    renderNoResults={() => "Sin resultados que cumplan con tu búsqueda"}
                    size={10}
                    pagination
                    paginationAt="bottom"
                    renderResultStats={() => <></>}
                    renderItem={(item: ElasticDdjjDataResult) => <SingleResultCard
                        data={mapFullDataToFTS(item)}
                        isSmall={props.isSmall}
                        id={item._id}
                        key={item._id}
                    />}
                />
            </Col>
        </Card>
    </Col>
}

function ChartsComponent() {

    return <Card className="card-style">
        <Col xl={24}>
            <Row gutter={[8, 0]}>
                <Col xl={12} lg={12} sm={24} xs={24}>
                    <Row gutter={[8, 8]}>
                        <Col xl={24} lg={24} sm={24} xs={24}>
                            <GraphWrapper title="Presentados">
                                <ReactiveComponent
                                    componentId="PresentedDeclarationsChart"
                                    defaultQuery={() => ({
                                        aggs: {
                                            "presented.keyword": {
                                                terms: {
                                                    field: 'presented',
                                                    order: {_count: 'desc'}
                                                }
                                            }
                                        }
                                    })}
                                    render={props => <PresentedChart {...props} />}
                                    react={{
                                        and: ['list', 'year_elected', 'departament'],
                                    }}
                                />
                            </GraphWrapper>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <GraphWrapper title="Sexo">
                                <ReactiveComponent
                                    componentId="DeclarationsSexChart"
                                    defaultQuery={() => ({
                                        aggs: {
                                            "sex.keyword": {
                                                terms: {
                                                    field: 'sex.keyword',
                                                    order: {_count: 'desc'}
                                                },
                                                aggs: {
                                                    presented: {
                                                        filter: {
                                                            term: {
                                                                presented: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })}
                                    render={props => (
                                        <BySexChart {...props} />
                                    )}
                                    react={{
                                        and: ['list', 'year_elected', 'departament'],
                                    }}
                                />
                            </GraphWrapper>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <GraphWrapper title="Tipo Candidatura">
                                <ReactiveComponent
                                    componentId="DeclarationsChargeChart"
                                    defaultQuery={() => ({
                                        aggs: {
                                            "charge.keyword": {
                                                terms: {
                                                    field: 'charge.keyword',
                                                    order: {_count: 'desc'}
                                                },
                                                aggs: {
                                                    presented: {
                                                        filter: {
                                                            term: {
                                                                presented: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })}
                                    render={props => (
                                        <ByChargeChart {...props} />
                                    )}
                                    react={{
                                        and: ['list', 'year_elected', 'departament'],
                                    }}
                                />
                            </GraphWrapper>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <GraphWrapper title="Partido">
                                <ReactiveComponent
                                    componentId="DeclarationsListChart"
                                    defaultQuery={() => ({
                                        aggs: {
                                            "list.keyword": {
                                                terms: {
                                                    field: 'list.keyword',
                                                    order: {_count: 'desc'}
                                                },
                                                aggs: {
                                                    presented: {
                                                        filter: {
                                                            term: {
                                                                presented: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })}
                                    render={props => (
                                        <ByListChart {...props} />
                                    )}
                                    react={{
                                        and: ['list', 'year_elected', 'departament'],
                                    }}
                                />
                            </GraphWrapper>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <GraphWrapper title="Edad">
                                <ReactiveComponent
                                    componentId="DeclarationsAgeChart"
                                    defaultQuery={() => ({
                                        aggs: {
                                            "age": {
                                                terms: {
                                                    field: 'age',
                                                    order: {_count: 'desc'}
                                                },
                                                aggs: {
                                                    presented: {
                                                        filter: {
                                                            term: {
                                                                presented: true
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })}
                                    render={(props) => (
                                        <ByAgeChart {...props} />
                                    )}
                                    react={{
                                        and: ['list', 'year_elected', 'departament'],
                                    }}
                                />
                            </GraphWrapper>
                        </Col>
                    </Row>
                </Col>
                <Col xl={12} lg={12} sm={24} xs={24}>
                    <Col xl={24} lg={24}>
                        <GraphWrapper height={616}>
                            <ReactiveComponent
                                componentId="DeclarationsDepartmentChart"
                                defaultQuery={() => ({
                                    aggs: {
                                        "departament.keyword": {
                                            terms: {
                                                field: 'departament.keyword',
                                                order: {_count: 'desc'}
                                            },
                                            aggs: {
                                                presented: {
                                                    filter: {
                                                        term: {
                                                            presented: true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                })}
                                render={(props) => (
                                    <ByDepartmentChart {...props} />
                                )}
                                react={{
                                    and: ['list', 'year_elected', 'departament'],
                                }}
                            />
                        </GraphWrapper>
                    </Col>
                </Col>

            </Row>
        </Col>

    </Card>

}

function BySexChart(props: {
    loading: boolean,
    aggregations: Record<string, { buckets: { key: string; doc_count: number; presented: { doc_count: number; } }[] }>
}) {
    if (props.loading || !props.aggregations || !props.aggregations["sex.keyword"]) return <LoadingGraphComponent/>;
    const data = props.aggregations["sex.keyword"].buckets;
    const chart = {m: {presented: 0, notPresented: 0}, f: {presented: 0, notPresented: 0}};
    data.forEach(element => {
        if (!element.presented) return;
        if (element.key === 'M') {
            chart.m.presented = element.presented.doc_count;
            chart.m.notPresented = element.doc_count - element.presented.doc_count;
        }
        if (element.key === 'F') {
            chart.f.presented = element.presented.doc_count;
            chart.f.notPresented = element.doc_count - element.presented.doc_count;
        }
    });
    return <SexChart m={chart.m} f={chart.f}/>
}

function PresentedChart(props: any,) {
    if (props.loading || !props.aggregations || !props.aggregations["presented.keyword"]) return <LoadingGraphComponent/>
    const data = props.aggregations["presented.keyword"].buckets;
    let d: { id: string, label: string, value: number }[] = [];
    data.forEach((element: { key: string; doc_count: number; }) => {
        d.push({id: element.key.toString(), label: element.key.toString(), value: element.doc_count})
    });
    return <PieChart data={d}/>
}

function ByListChart(props: any) {
    if (props.loading || !props.aggregations || !props.aggregations["list.keyword"]) return <LoadingGraphComponent/>
    const data = props.aggregations["list.keyword"].buckets;

    console.log('ByListChart', data);

    let d: { key: string, presented: number, notPresented: number }[] = [];
    data.forEach((element: { key: string; doc_count: number; presented: { doc_count: number; } }) => {
        if (!element.presented) return;
        d.push({
            key: element.key,
            presented: element.presented.doc_count,
            notPresented: element.doc_count - element.presented.doc_count
        })
    });
    return <>
        <BarChart data={d}/>
    </>
}

function ByAgeChart(props: any, key: string) {
    if (props.loading || !props.aggregations || !props.aggregations["age"]) return <LoadingGraphComponent/>
    const data = props.aggregations["age"].buckets;
    let d: { key: string, presented: number, notPresented: number }[] = [];
    data.forEach((element: { key: string; doc_count: number; presented: { doc_count: number; } }) => {
        if (!element.presented) return;
        d.push({
            key: element.key.toString(),
            presented: element.presented.doc_count,
            notPresented: element.doc_count - element.presented.doc_count
        })
    });
    return <>
        <BarChart data={d}/>
    </>
}

function ByChargeChart(props: any) {
    if (props.loading || !props.aggregations || !props.aggregations["charge.keyword"]) return <LoadingGraphComponent/>
    const data = props.aggregations["charge.keyword"].buckets;
    let d: { key: string, presented: number, notPresented: number }[] = [];
    console.log('ByChargeChart', data);
    data.forEach((element: { key: string; doc_count: number; presented: { doc_count: number; } }) => {
        if (!element.presented) return;
        d.push({
            key: element.key,
            presented: element.presented.doc_count,
            notPresented: element.doc_count - element.presented.doc_count
        })
    });
    return <>
        <BarChart data={d}/>
    </>
}

function ByDepartmentChart(props: any) {
    if (props.loading || !props.aggregations || !props.aggregations["departament.keyword"]) return <LoadingGraphComponent/>
    const data = props.aggregations["departament.keyword"].buckets;
    let d: { key: string, value: number, total: number, presented: number }[] = [];
    data.forEach((element: { key: string; doc_count: number; presented: { doc_count: number; } }) => {
        if (!element.presented) return;
        d.push({
            key: element.key,
            value: +((element.presented.doc_count / element.doc_count) * 100).toFixed(2),
            total: element.doc_count,
            presented: element.presented.doc_count
        })
    });
    return <>
        <HeatMap data={d}/>
    </>
}

function ResultHeader() {

    return <Row gutter={[8, 8]} justify="start" align="middle">
        <Col span={1}>
        </Col>
        <Col span={10}>
            <b>Nombre</b>
        </Col>
        <Col span={12} style={{textAlign: 'right', fontSize: '1em'}}>
            <b>Año</b>
        </Col>
    </Row>
}

function SingleResultCard(props: {
    data: ElasticDdjjPeopleResult[],
    id: string,
    isSmall: boolean
}) {

    const data = getData(props.data);

    if (props.isSmall) {
        return <Card className="card-style">
            <Comment className="small-card"
                     content={<>
                         <Link className="name-result-link" to={`/person/${data.document}`}>
                             {data.name}
                         </Link>
                         <Row justify="space-between" align="middle">
                             <Col span={24} style={{textAlign: 'right'}}>
                                 <Tooltip title={data.start_declaration ? 'Presentó' : 'No presentó'}
                                          style={{marginLeft: 20}}>
                                     <Typography.Text style={{
                                         fontSize: 20,
                                         color: data.end_declaration ? 'green' : 'red',
                                         textAlign: 'right'
                                     }}>
                                         {data.year_elected}
                                     </Typography.Text>
                                 </Tooltip>
                                 <Tooltip title={data.end_declaration ? 'Presentó' : 'No presentó'}
                                          style={{marginLeft: 20}}>
                                     <Typography.Text style={{
                                         marginLeft: 20,
                                         fontSize: 20,
                                         color: data.end_declaration ? 'green' : 'red',
                                         textAlign: 'right'
                                     }}>
                                         {data.year_elected + 5}
                                     </Typography.Text>
                                 </Tooltip>
                             </Col>
                         </Row>
                     </>
                     }
            />
        </Card>
    }

    return <Row gutter={[8, 8]} justify="start" align="middle">
        <Col span={1}>
            <Avatar
                style={{backgroundColor: getColorByIdx(props.id), verticalAlign: 'middle'}}
                alt={data.name}>{getInitials(data.name)}</Avatar>
        </Col>
        <Col span={10}>
            <Link className="name-result-link" to={`/person/${data.document}`}>
                {data.name}
            </Link>
            <br/>
            <small>Cédula: <b>{formatMoney(data.document)}</b></small>
        </Col>
        <Col span={12} style={{textAlign: 'right'}}>
            <Tooltip title={data.start_declaration ? 'Presentó' : 'No presentó'} style={{marginLeft: 20}}>
                <Typography.Text style={{
                    marginLeft: 20,
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: data.end_declaration ? 'green' : 'red'
                }}>
                    {data.year_elected}
                </Typography.Text>
            </Tooltip>
            <Tooltip title={data.end_declaration ? 'Presentó' : 'No presentó'} style={{marginLeft: 20}}>
                <Typography.Text style={{
                    marginLeft: 20,
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: data.end_declaration ? 'green' : 'red'
                }}>
                    {data.year_elected + 5}
                </Typography.Text>
            </Tooltip>
        </Col>
    </Row>
}


function BarChart(props: { data: { key: string, presented: number, notPresented: number }[] }) {

    return <ResponsiveBar
        data={props.data}
        keys={['presented', 'notPresented']}
        indexBy="key"
        margin={{top: 20, right: 20, bottom: 50, left: 50}}
        padding={0.3}
        colors={{scheme: 'nivo'}}
        defs={[
            {
                id: 'dots',
                type: 'patternDots',
                background: 'inherit',
                color: '#38bcb2',
                size: 4,
                padding: 1,
                stagger: true
            },
            {
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
            legend: 'Declaraciones',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Cantidad',
            legendPosition: 'middle',
            legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}
        animate={true}
        motionStiffness={90}
        motionDamping={15}
    />
}

function PieChart(props: { data: { id: string, label: string, value: number }[] }) {
    return <ResponsivePie
        data={props.data}
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
        slicesLabelsSkipAngle={10}
        slicesLabelsTextColor="#333333"
        animate={true}
        tooltipFormat={v => formatMoney(v)}
        motionStiffness={90}
        motionDamping={15}
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
}

function HeatMap(props: { data: { key: string, value: number, total: number, presented: number }[] }) {

    const [geojson, setGeoJson] = useState<any>();

    useEffect(() => {
        new SimpleApi().getGeoJson()
            .then(d => setGeoJson(d))
            .catch(e => message.warn("No se pudo obtener geojson"))
        ;
    }, []);
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
              return value + '%'
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
        />}
    </>

}

function GraphWrapper(
    props: {
        title?: string,
        children: React.ReactNode,
        height?: number
    }
) {

    const finalHeight = props.height || 200;
    const graphHeight = props.title ? finalHeight - 50 : finalHeight;
    return <div style={{width: '100%', height: finalHeight, border: '1px solid #002E4D', borderRadius: 5}}>
        {props.title && <Typography.Title level={4} style={{textAlign: 'center'}}>{props.title}</Typography.Title>}

        <div style={{height: graphHeight, width: '100%'}}>
            {props.children}
        </div>
    </div>
}

const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

const FilterColors: Record<string, string> = {
    'list': 'rgb(205 83 52)',
    'departament': '#f50',
    'year_elected': '#108ee9',
    'Patrimonio': '#00a2ae'
}

function getInitials(name: string = ""): string {
    return (name || "").split(/\s+/)
        .map((n) => n[0])
        .join(".")
        .toUpperCase();
}

function getColorByIdx(_id: string) {
    let asNumber = parseInt(_id);
    if (isNaN(asNumber)) asNumber = _id.length;
    return ColorList[asNumber % ColorList.length];
}

function getData(data: Array<ElasticDdjjPeopleResult>) {
    const name: { val: string, confidence: number } = {val: "", confidence: 0};
    const document: { val?: string, confidence: number } = {val: "", confidence: 0};
    const year_elected: { val: number, confidence: number } = {val: 0, confidence: 0};
    const start_declaration: { val?: boolean, confidence: number } = {val: false, confidence: 0};
    const end_declaration: { val?: boolean, confidence: number } = {val: false, confidence: 0};
    for (const row of data) {
        name.val = row.name;
        document.val = row.document;
        year_elected.val = row.year_elected;
        start_declaration.val = row.start !== null;
        end_declaration.val = row.end !== null;
    }

    return {
        name: fixName(name.val),
        document: document.val,
        year_elected: year_elected.val,
        start_declaration: start_declaration.val,
        end_declaration: end_declaration.val
    }
}


interface ElasticDdjjPeopleResult {
    _id: string;
    name: string;
    department: string;
    document: string;
    start: string;
    end: string;
    nacionality: string;
    sex: string;
    year_elected: number;
    charge: string;
    list: string;
}

interface ElasticDdjjDataResult {
    _id: string;
    first_name: string;
    last_name: string;
    department: string;
    document: string;
    start: string;
    end: string;
    nacionality: string;
    sex: string;
    year_elected: number;
    charge: string;
    list: string;
}

function mapFullDataToFTS(item: ElasticDdjjDataResult): ElasticDdjjPeopleResult[] {
    const toRet: Array<ElasticDdjjPeopleResult> = [];

    toRet.push({
        _id: item._id,
        name: item.first_name + ' ' + item.last_name,
        department: item.department,
        charge: item.charge,
        document: item.document,
        list: item.list,
        year_elected: item.year_elected,
        nacionality: item.nacionality,
        sex: item.sex,
        end: item.end,
        start: item.start,
    })

    return toRet;
}

function getFilterKeyName(val: string): string {

    const keys: Record<string, string> = {
        "list": "Partido",
        "departament": "Departamento",
        "year_elected": "Año"
    };

    return keys[val] || val;
}
