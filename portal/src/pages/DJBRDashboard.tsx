import * as React from 'react';
import {useMemo} from 'react';
import {Avatar, Card, Col, Collapse, Comment, Divider, Layout, Row, Tag, Tooltip, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './AuthoritiesWithDdjj.css'
import Footer from '../components/layout/Footer';
import {MultiList, ReactiveBase, ReactiveComponent, ReactiveList, SelectedFilters} from '@appbaseio/reactivesearch';
import {useMediaQuery} from '@react-hook/media-query'
import {formatMoney, getInitials} from '../formatters';
import {Link} from 'react-router-dom';
import {BySexChart} from '../components/ddjj/SexChart';
import {ByChargeChart} from '../components/ddjj/ChargeChart';
import {ByAgeChart} from '../components/ddjj/AgeChart';
import {PresentedDeclarationChart} from '../components/ddjj/PresentedChart';
import {ByListChart} from '../components/ddjj/ListChart';
import {ByDepartamentHeatMap} from '../components/ddjj/HeatMap';
import useMetaTags from 'react-metatags-hook';


export function DJBRDashboard() {

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');

    const filter = useMemo(() => <Filter/>, []);

    useMetaTags({
        title: `Declaraciones juradas de bienes y rentas`,
        description: `Portal para ver el progreso de carga de las declaraciones juradas de bienes y rentas.`,
        charset: 'utf8',
        lang: 'en',
        openGraph: {
            title: 'Declaraciones juradas de bienes y rentas',
            site_name: 'controlciudadanopy.org'
        },
        twitter: {
            card: 'summary',
            creator: '@InstIDEA',
            title: 'Dashboard de declaraciones juradas de bienes y rentas',
        }
    }, [])

    return <ReactiveBase url="https://data.controlciudadanopy.org/" app="fts_authorities_ddjj">
        <Header tableMode={true}/>

        <Layout>
            {!isSmall && <Layout.Sider width="20vw">
                {filter}
            </Layout.Sider>}
            <Layout style={{
                overflowX: 'visible'
            }}>
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
                              style={{paddingLeft: 0, paddingTop: 10}}>Elecciones</Typography.Title>
            <MultiList componentId="election"
                       dataField="election.keyword"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={false}
                       react={{
                           and: ['departament', 'list', 'year_elected', 'district', 'election'],
                       }}
            />
            <Divider orientation="left" plain/>
            <Typography.Title className="ant-card-head"
                              style={{paddingLeft: 0, paddingTop: 10}}>Año</Typography.Title>
            <MultiList componentId="year_elected"
                       dataField="year_elected"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={false}
                       react={{
                           and: ['departament', 'list', 'year_elected', 'district', 'election'],
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
                           and: ['year_elected', 'list', 'departament', 'district', 'election'],
                       }}
            /><Divider orientation="left" plain/>
            <Typography.Title className="ant-card-head"
                              style={{paddingLeft: 0, paddingTop: 10}}>Distrito</Typography.Title>
            <MultiList componentId="district"
                       dataField="district.keyword"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={true}
                       placeholder='Buscar'
                       react={{
                           and: ['year_elected', 'list', 'departament', 'district', 'election'],
                       }}/>
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
                           and: ['year_elected', 'departament', 'list', 'district', 'election'],
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
                                                {getFilterKeyName(key)}: {getMappedValName(val)}
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
                                            {getFilterKeyName(key)}: {getMappedValName(label)}
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
                        and: ['list', 'year_elected', 'department', 'district', 'election']
                    }}
                    infiniteScroll={false}
                    renderNoResults={() => "Sin resultados que cumplan con tu búsqueda"}
                    scrollOnChange={false}
                    size={10}
                    sortOptions={[
                        {label: 'Ordenar por presentados', sortBy: 'desc', dataField: "presented"},
                        {label: 'Ordenar por nombre', sortBy: 'asc', dataField: "full_name.keyword"},
                    ]}
                    pagination
                    paginationAt="bottom"
                    renderResultStats={() => <></>}
                    renderItem={(item: ElasticDdjjDataResult) => <SingleResultCard
                        data={item}
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

    return <Card className="card-style" style={{paddingTop: 24}}>
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
                                    render={props => <PresentedDeclarationChart {...props} />}
                                    react={{
                                        and: ['list', 'year_elected', 'departament', 'district', 'election'],
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
                                    render={props => <BySexChart {...props} />}
                                    react={{
                                        and: ['list', 'year_elected', 'departament', 'district', 'election'],
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
                                                    order: {_count: 'desc'},
                                                    size: 5
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
                                    render={props => <ByChargeChart {...props} />}
                                    react={{
                                        and: ['list', 'year_elected', 'departament', 'district', 'election'],
                                    }}
                                />
                            </GraphWrapper>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <GraphWrapper title="Partido" height={200}>
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
                                    render={props => <ByListChart {...props} />}
                                    react={{
                                        and: ['list', 'year_elected', 'departament', 'district', 'election'],
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
                                                range: {
                                                    field: 'age',
                                                    "ranges": [
                                                        {"to": 29},
                                                        {"from": 30, "to": 39},
                                                        {"from": 40, "to": 49},
                                                        {"from": 50, "to": 59},
                                                        {"from": 60, "to": 69},
                                                        {"from": 70, "to": 190},
                                                    ]
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
                                        and: ['list', 'year_elected', 'departament', 'district', 'election'],
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
                                                order: {_count: 'desc'},
                                                size: 40,
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
                                render={(props) => <ByDepartamentHeatMap {...props} />}
                                react={{
                                    and: ['list', 'year_elected', 'departament', 'district', 'election'],
                                }}
                            />
                        </GraphWrapper>
                    </Col>
                </Col>

            </Row>
        </Col>

    </Card>

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
    data: ElasticDdjjDataResult,
    id: string,
    isSmall: boolean
}) {

    const data = props.data;

    if (props.isSmall) {
        return <Card className="card-style">
            <Comment className="small-card"
                     content={<>
                         {data.document &&
                         <Link className="name-result-link" to={`/person/${data.document}`}>
                             {data.full_name}
                         </Link>
                         }
                         {!data.document &&
                         <Typography.Text className="name-result-link">
                             {data.full_name}
                         </Typography.Text>
                         }
                         <Row justify="space-between" align="middle">
                             <Col span={24} style={{textAlign: 'right'}}>
                                 <LinkToDeclaration year={data.year_elected} data={data.start}/>
                                 <LinkToDeclaration year={data.year_elected + 5} data={data.end}/>
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
                alt={data.full_name}>{getInitials(data.full_name)}</Avatar>
        </Col>
        <Col span={10}>
            {data.document &&
            <Link className="name-result-link" to={`/person/${data.document}`}>
                {data.full_name}
            </Link>
            }
            {!data.document &&
            <Typography.Text className="name-result-link">
                {data.full_name}
            </Typography.Text>
            }
            <br/>
            <small>Cédula: <b>{formatMoney(data.document)}</b></small>
        </Col>
        <Col span={12} style={{textAlign: 'right'}}>
            <LinkToDeclaration year={data.year_elected} data={data.start}/>
            <LinkToDeclaration year={data.year_elected + 5} data={data.end}/>
        </Col>
    </Row>
}

function LinkToDeclaration(props: {
    year: number,
    data: null | {
        link: string
    }
}) {

    const {year, data} = props;
    const currentYear = new Date().getFullYear();
    if (year > currentYear) {
        return <Typography.Text style={{
            marginLeft: 20,
            fontSize: 20,
            color: 'darkgray',
            textAlign: 'right'
        }}>
            {year}
        </Typography.Text>;
    }

    if (data) {
        return <Tooltip title='Presentó'
                        style={{marginLeft: 20}}>
            <a href={data.link} target="_blank" rel="noreferrer noopener">
                <Typography.Text style={{
                    marginLeft: 20,
                    fontSize: 20,
                    color: 'green',
                    textAlign: 'right'
                }}>
                    {year}
                </Typography.Text>
            </a>
        </Tooltip>
    }

    return <Tooltip title='No presentó'
                    style={{marginLeft: 20}}>
        <Typography.Text style={{
            marginLeft: 20,
            fontSize: 20,
            color: 'red',
            textAlign: 'right'
        }}>
            {year}
        </Typography.Text>
    </Tooltip>

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
        {props.title && <Typography.Title level={5} style={{
            textAlign: 'center',
            color: 'rgba(0, 52, 91, 1)'
        }}>{props.title}</Typography.Title>}

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
    'election': 'rgb(205 83 52)',
    'district': '#108ee9'
}

function getColorByIdx(_id: string) {
    let asNumber = parseInt(_id);
    if (isNaN(asNumber)) asNumber = _id.length;
    return ColorList[asNumber % ColorList.length];
}

interface ElasticDdjjDataResult {
    _id: string;
    full_name: string;
    department: string;
    district: string;
    election: string;
    document: string;
    start: {
        link: string
    } | null;
    end: {
        link: string
    } | null;
    nacionality: string;
    sex: string;
    year_elected: number;
    charge: string;
    list: string;
}

function getFilterKeyName(val: string): string {

    const keys: Record<string, string> = {
        "list": "Partido",
        "departament": "Departamento",
        "year_elected": "Año",
        "district": "Distrito",
        "election": "Elecciones"
    };

    return keys[val] || val;
}

function getMappedValName(val: unknown): string {

    if (val && `${val}`.endsWith('EEMBUCU')) return 'ÑEEMBUCU';
    return `${val}`;
}