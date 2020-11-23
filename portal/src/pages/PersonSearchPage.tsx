import * as React from 'react';
import {useMemo} from 'react';
import {Avatar, Button, Card, Checkbox, Col, Collapse, Layout, Row, Tooltip, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './PersonSearchPage.css'
import Footer from '../components/layout/Footer';
import {DataSearch, MultiList, ReactiveBase, ReactiveList, SelectedFilters} from '@appbaseio/reactivesearch';
import {useMediaQuery} from '@react-hook/media-query'
import {formatMoney} from '../formatters';
import {getAQEImage} from '../AQuienElegimosData';
import Icon from '@ant-design/icons';
import {ReactComponent as Sfp} from '../assets/logos/sfp.svg';
import {ReactComponent as Ddjj} from '../assets/logos/ddjj.svg';
import {ReactComponent as Ande} from '../assets/logos/ande.svg';
import {ReactComponent as Aqe} from '../assets/logos/a_quienes_elegimos.svg';
import {Link} from 'react-router-dom';

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
            {!isSmall && <Layout.Sider width="20vw">
              <Typography.Title level={5} style={{textAlign: 'center', paddingTop: 20}}>
                Filtros
              </Typography.Title>
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
                                        enableQuerySuggestions={false}
                                        enablePopularSuggestions={false}
                                        debounce={300}
                                        placeholder="Búsqueda por nombre o cédula"
                                        dataField={['name', 'document']}/>
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
        <Card title="Fuente de datos" className="card-style">
            <MultiList componentId="Fuente"
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
                                   <Col xs={{span: 18}}>
                                       <Checkbox checked={value[item.key]}
                                                 onChange={() => handleChange(item.key)}>
                                           {sourceNameMap[item.key] || item.key}
                                       </Checkbox>
                                   </Col>
                                   <Col xs={{span: 6}} style={{textAlign: 'right'}}>
                                       {formatMoney(item.doc_count)}
                                   </Col>
                               </React.Fragment>)}
                           </Row>);
                       }}
            />
        </Card>
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
                <ResultHeader />
                <ReactiveList
                    dataField="document.keyword"
                    componentId="SearchResult"
                    react={{
                        and: ['query', 'Fuente']
                    }}
                    infiniteScroll={false}
                    size={10}
                    pagination
                    paginationAt="bottom"
                    renderResultStats={() => <></>}
                    renderItem={(item: ElasticFtsPeopleResult) => <SingleResultCard
                        data={[item]}
                        id={item._id}
                        key={item._id}
                    />}
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
    return <SingleResultCard data={rows} id={id}/>

}

function ResultHeader() {

    return <Row gutter={[8, 8]} justify="start" align="middle">
        <Col span={1}>
        </Col>
        <Col span={11}>
            <b>Nombre</b>
        </Col>

        <Col span={4} style={{textAlign: 'right'}} offset={1}>
            <b>Patrimonio neto</b>
        </Col>
        <Col span={2} offset={1}>
            <b>Fuente</b>
        </Col>
        <Col span={2} offset={1}>
        </Col>
    </Row>
}

function SingleResultCard(props: {
    data: ElasticFtsPeopleResult[],
    id: string
}) {

    const data = getData(props.data);

    return <Row gutter={[8, 8]} justify="start" align="middle">
        <Col span={1}>
            <Avatar
                style={{backgroundColor: getColorByIdx(props.id), verticalAlign: 'middle'}}
                src={data.photo}
                alt={data.name}>{getInitials(data.name)}</Avatar>
        </Col>
        <Col span={11}>
            {data.name}
            <br/>
            <small>{data.document}</small>
        </Col>

        <Col span={4} style={{textAlign: 'right'}} offset={1}>
            {formatMoney(data.net_worth, 'Gs')}
        </Col>
        <Col span={2} offset={1}>
            <SourcesIconListComponent sources={data.sources}/>
        </Col>
        <Col span={2} offset={1}>
            <Link to={`/person/${data.document}`}>
                <Button className="mas-button">Ver más</Button>
            </Link>
        </Col>
    </Row>
}

interface ElasticFtsPeopleResult {
    _id: string;
    source: string;
    name: string;
    document: string | null;
    age?: number;
    photo?: string;
    active?: string;
    passive?: string;
    net_worth?: string;
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
    let net_worth: { val: string, confidence: number } = {val: "", confidence: 0};
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

        if (dsInfo.net_worth !== undefined && row.net_worth !== undefined && net_worth.confidence < dsInfo.net_worth) {
            net_worth.val = row.net_worth;
            net_worth.confidence = dsInfo.net_worth;
        }

    }

    return {
        name: name.val,
        photo: photo.confidence === 0 ? undefined : photo.val,
        sources: Object.keys(sources),
        document: data.map(d => d.document).filter(d => !!d)[0],
        net_worth: net_worth.val
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

const sourceNameIcon: { [k: string]: React.FunctionComponent } = {
    'declarations': Ddjj,
    'a_quien_elegimos': Aqe,
    'ande_exonerados': Ande,
    'sfp': Sfp
}

function SourcesIconListComponent(props: {
    sources: string[]
}) {
    return <>
        {props.sources.map(s =>
            <Tooltip title={sourceNameMap[s] || s} key={s}>
                <Icon component={sourceNameIcon[s] || s} className="source-icon"/>
            </Tooltip>
        )}
    </>
}
