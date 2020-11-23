import * as React from 'react';
import {useMemo} from 'react';
import {Avatar, Checkbox, Col, Collapse, Comment, Layout, Row, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './PersonSearchPage.css'
import Footer from '../components/layout/Footer';
import {
    DataSearch,
    MultiList,
    ReactiveBase,
    ReactiveComponent,
    ReactiveList,
    SelectedFilters
} from '@appbaseio/reactivesearch';
import {useMediaQuery} from '@react-hook/media-query'
import {formatMoney} from '../formatters';
import {getAQEImage} from '../AQuienElegimosData';

const sourceNameMap: { [k: string]: string } = {
    'tsje_elected': 'Autoridades electas',
    'declarations': 'Declaraciones juradas',
    'a_quien_elegimos': 'A quien elegimos',
    'ande_exonerados': 'Exonerados ANDE',
    'mh': 'Ministerio de Hacienda',
    'sfp': 'Secretaria de la función pública'
}


export function PersonSearchPage() {

    const isSmall = useMediaQuery('only screen and (max-width: 600px)');

    const filter = useMemo(() => <Filter/>, []);

    return <ReactiveBase url="http://data.controlciudadanopy.org:49201/" app="fts_people">
        <Header tableMode={true}/>

        <Layout>
            {!isSmall && <Layout.Sider width="30vw">
                {filter}
            </Layout.Sider>}
            <Layout>
                <Layout.Content className="content-padding">
                    {isSmall && <Row>
                      <Col xs={{span: 24}}>
                        <Collapse defaultActiveKey={['1']} bordered={false}>
                          <Collapse.Panel header="Filtros" key="1">
                              {filter}
                          </Collapse.Panel>
                        </Collapse>
                      </Col>
                    </Row>}
                    <Row>
                        <Col xs={{span: 24}}>
                            <DataSearch componentId="query"
                                        URLParams
                                        placeholder="Búsqueda por nombre o cédula"
                                        dataField={['name', 'lastname', 'document']}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span: 24}}>
                            <SelectedFilters showClearAll={true}
                                             clearAllLabel="Limpiar"/>
                        </Col>
                    </Row>
                    <ResultComponent/>
                </Layout.Content>
            </Layout>
        </Layout>
        <Footer tableMode={true}/>
    </ReactiveBase>

}


function Filter() {
    return <Col xs={{span: 24}} style={{padding: 5}}>
        <MultiList title="Fuente de datos"
                   componentId="Fuente"
                   dataField="source.keyword"
                   showCheckbox
                   URLParams
                   showSearch={false}
                   react={{
                       and: ['query'],
                   }}
                   render={({loading, error, data, handleChange, value}) => {
                       if (loading) {
                           return <div>Cargando ...</div>;
                       }
                       if (error) {
                           return <div>Error al cargar datos</div>;
                       }
                       return (<Row>
                           {data.map((item: { key: string, doc_count: number }) => <React.Fragment key={item.key}>
                               <Col xs={{span: 16}}>
                                   <Checkbox checked={value[item.key]}
                                             onChange={() => handleChange(item.key)}>
                                       {sourceNameMap[item.key] || item.key}
                                   </Checkbox>
                               </Col>
                               <Col xs={{span: 8}} style={{textAlign: 'right'}}>
                                   {formatMoney(item.doc_count)}
                               </Col>
                           </React.Fragment>)}
                       </Row>);
                   }}
        />
    </Col>
}


function ResultComponent() {
    return <Col xs={{span: 24}}>
        <Row>
            <Typography.Title level={3} className="title-layout-content">
                Resultados
            </Typography.Title>
        </Row>
        <Row>
            <Col xs={{span: 24}}>
                <ReactiveComponent componentId="test"
                                   react={{
                                       and: ['query', 'Fuente']
                                   }}
                                   customQuery={(args: any) => {
                                       console.log('rc.cq', args);
                                       return {};
                                   }}
                />
                <ReactiveList
                    dataField="document.keyword"
                    componentId="SearchResult"
                    react={{
                        and: ['query', 'Fuente']
                    }}
                    infiniteScroll={false}
                    // aggregationField="document.keyword"
                    defaultQuery={(args: any) => {
                        // console.log(args)
                        return { "aggs": {
                            "result": {
                                "terms": {
                                    "field": "document.keyword",
                                    "size": 10
                                },
                                "aggs": {
                                    "tops": {
                                        "top_hits": {
                                            "size": 10
                                        }
                                    }
                                }
                            }
                        },
                        "size": 0
                    }}}
                    size={10}
                    pagination
                    paginationAt="bottom"
                    renderResultStats={stats => `Mostrando ${stats.displayedResults} de un total de ${formatMoney(stats.numberOfResults)}`}
                    render={data => {
                        // console.log(data)
                        if (!data.rawData) {
                            return <div>Ingresa un nombre para buscar!</div>
                        }
                        // return <pre>{JSON.stringify(data.aggregationData, null, 2)}</pre>
                        const rows = data.rawData.aggregations.result.buckets;
                        // console.log('rows', rows)
                        return <>
                            {rows.map((r: any) => <ResultCard data={r} key={r.key}/>)}
                        </>
                    }}
                />
            </Col>
        </Row>
    </Col>
}

function ResultCard(props: {
    data: {
        doc_count: number,
        key: string,
        tops: {
            hits: {
                hits: Array<{
                    _id: string,
                    _score: number,
                    _source: ElasticFtsPeopleResult

                }>,
                max_score: number,
                total: {
                    relation: string,
                    value: number
                }
            }
        }
    }
}) {

    const id = props.data.key;
    const rows: Array<ElasticFtsPeopleResult> = props.data.tops.hits.hits.map(h => h._source);
    const data = getData(rows);


    return <Comment avatar={<Avatar
        style={{backgroundColor: getColorByIdx(id), verticalAlign: 'middle'}}
        src={data.photo ? undefined : data.photo}
        alt={data.name}
    >{data.photo ? undefined : getInitials(data.name)}</Avatar>}
                    content={data.name}
                    datetime={props.data.key}
                    author={data.sources.join(", ")}
    />

}

interface ElasticFtsPeopleResult {
    _id: string;
    source: string;
    name: string;
    document: string | null;
    age?: number;
    photo?: string;
}

const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];

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

function getData(data: Array<ElasticFtsPeopleResult>) {
    let name: { val: string, confidence: number } = {val: "", confidence: 0};
    let photo: { val: string, confidence: number } = {val: "", confidence: 0};
    const sources: { [k: string]: boolean } = {};

    for (const row of data) {
        sources[row.source] = true;
        const dsInfo = confidenceByDS[row.source];
        if (!dsInfo) continue;

        if (name.confidence < dsInfo.name) {
            name.val = row.name;
            name.confidence = dsInfo.name;
        }

        if (dsInfo.photo && row.photo && photo.confidence < dsInfo.photo) {
            photo.val = row.source === 'a_quien_elegimos' ? getAQEImage(row.photo) : row.photo;
            photo.confidence = dsInfo.photo;
        }
    }

    return {
        name: name.val,
        photo: photo.confidence === 0 ? undefined : photo.val,
        sources: Object.keys(sources)
    }
}

// 'tsje_elected': 'Autoridades electas',
//     'declarations': 'Declaraciones juradas',
//     'a_quien_elegimos': 'A quien elegimos',
//     'ande_exonerados': 'Exonerados ANDE',
//     'mh': 'Ministerio de Hacienda',
//     'sfp': 'Secretaria de la función pública'
const confidenceByDS: { [k: string]: { name: number, photo?: number, net_worth?: number, active?: number, passive?: number } } = {
    'a_quien_elegimos': {
        name: 100,
        photo: 100
    },
    'tsje_elected': {
        name: 90,
    },
    'declarations': {
        name: 90,
        net_worth: 100,
        active: 100,
        passive: 100
    },
    'ande_exonerados': {
        name: 92
    },
    'mh': {
        name: 92
    },
    'sfp': {
        name: 93
    }
}

