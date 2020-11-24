import * as React from 'react';
import {useMemo} from 'react';
import {
    Avatar,
    Button,
    Card,
    Checkbox,
    Col,
    Collapse,
    Comment,
    Descriptions,
    Layout,
    Row,
    Tooltip,
    Typography
} from 'antd';
import {Header} from '../components/layout/Header';
import './PersonSearchPage.css'
import Footer from '../components/layout/Footer';
import {
    DataSearch,
    MultiList,
    ReactiveBase,
    ReactiveList,
    SelectedFilters,
    SingleRange
} from '@appbaseio/reactivesearch';
import {useMediaQuery} from '@react-hook/media-query'
import {formatMoney} from '../formatters';
import {getAQEImage} from '../AQuienElegimosData';
import Icon from '@ant-design/icons';
import {ReactComponent as Sfp} from '../assets/logos/sfp.svg';
import {ReactComponent as Ddjj} from '../assets/logos/ddjj.svg';
import {ReactComponent as Ande} from '../assets/logos/ande.svg';
import {ReactComponent as Aqe} from '../assets/logos/a_quienes_elegimos.svg';
import {ReactComponent as Pytyvo} from '../assets/logos/pytyvo.svg';
import {ReactComponent as Nangareko} from '../assets/logos/nangareko.svg';
import {ReactComponent as PoliciaNacional} from '../assets/logos/policia_nacional.svg';
import {Link} from 'react-router-dom';

const sourceNameMap: { [k: string]: string } = {
    'tsje_elected': 'Autoridades electas',
    'declarations': 'Declaraciones juradas',
    'a_quien_elegimos': 'A quien elegimos',
    'ande_exonerados': 'Exonerados ANDE',
    'mh': 'Ministerio de Hacienda',
    'sfp': 'Secretaria de la función pública',
    'pytyvo': 'Subsidio Pytyvo',
    'nangareko': 'Subsidio Nangareko',
    'policia': 'Policia Nacional'
}


export function PersonSearchPage() {

    const isSmall = useMediaQuery('only screen and (max-width: 600px)');

    const filter = useMemo(() => <Filter/>, []);

    return <ReactiveBase url="https://data.controlciudadanopy.org/" app="fts_full_data">
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
                        <Collapse defaultActiveKey={['2']} bordered={false}>
                          <Collapse.Panel header="Mas filtros" key="1">
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
                                        dataField={['name', 'document.keyword']}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col xs={{span: 24}}>
                            <SelectedFilters showClearAll={true}
                                             clearAllLabel="Limpiar"/>
                        </Col>
                    </Row>
                    <ResultComponent isSmall={isSmall}/>
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
                       dataField="sources.keyword"
                       showCheckbox
                       URLParams
                       showSearch={false}
                       react={{
                           and: ['query', 'Patrimonio', 'Salario'],
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

        <Card title="Salario" className="card-style">
            <SingleRange componentId="Salario"
                         dataField="salary"
                         showRadio
                         URLParams
                         includeNullValues={true}
                         data={[
                             {start: 0, end: 2500000, label: 'Hasta sueldo mínimo'},
                             {start: 2500001, end: 5000000, label: 'De sueldo mínimo a 5 millones'},
                             {start: 5000001, end: 10000000, label: 'De 5 a 10 millones'},
                             {start: 10000001, label: 'Mas de 10 millones'},
                         ]}
                         style={{}}/>
        </Card>

        <Card title="Patrimonio neto" className="card-style">
            <SingleRange componentId="Patrimonio"
                         dataField="net_worth"
                         showRadio
                         URLParams
                         includeNullValues={false}
                         data={[
                             {end: 100000000, label: 'Hasta 100M'},
                             {start: 100000001, end: 500000000, label: 'De 100M a 500M'},
                             {start: 500000001, end: 1000000000, label: 'De 500M a 1.000M'},
                             {start: 1000000001, label: 'Mas de 1.000M'},
                         ]}
                         style={{}}/>
        </Card>
    </Col>
}


function ResultComponent(props: {
    isSmall: boolean
}) {

    return <Col xs={{span: 24}}>
        <Row>
            <Typography.Title level={3} className="title-layout-content result-title">
                Resultados
            </Typography.Title>
        </Row>
        <Row>
            <Col xs={{span: 24}}>
                {!props.isSmall && <ResultHeader/>}
                <ReactiveList
                    dataField="document.keyword"
                    componentId="SearchResult"
                    react={{
                        and: ['query', 'Fuente', 'Salario', 'Patrimonio']
                    }}
                    infiniteScroll={false}
                    size={10}
                    pagination
                    paginationAt="bottom"
                    renderResultStats={() => <></>}
                    renderItem={(item: ElasticFullDataResult) => <SingleResultCard
                        data={mapFullDataToFTS(item)}
                        isSmall={props.isSmall}
                        id={item._id}
                        key={item._id}
                    />}
                />
            </Col>
        </Row>
    </Col>
}

function ResultHeader() {

    return <Row gutter={[8, 8]} justify="start" align="middle">
        <Col span={1}>
        </Col>
        <Col span={8}>
            <b>Nombre</b>
        </Col>
        <Col span={4} style={{textAlign: 'right', fontSize: '0.8em', paddingRight: 10}}>
            <b>Salario</b>
        </Col>
        <Col span={4} style={{textAlign: 'right', fontSize: '0.8em', paddingRight: 10}}>
            <b>Patrimonio</b>
        </Col>
        <Col span={3} offset={1} style={{textAlign: 'right'}}>
            <b>Fuente</b>
        </Col>
        <Col span={2} offset={1}>
        </Col>
    </Row>
}

function SingleResultCard(props: {
    data: ElasticFtsPeopleResult[],
    id: string,
    isSmall: boolean
}) {

    const data = getData(props.data);

    if (props.isSmall) {
        return <Card className="card-style">
            <Comment author={data.document}
                     className="small-card"
                     avatar={
                         <Avatar
                             style={{backgroundColor: getColorByIdx(props.id), verticalAlign: 'middle'}}
                             src={data.photo}
                             alt={data.name}>{getInitials(data.name)}</Avatar>
                     }
                     content={<><Descriptions title={data.name}>
                         {data.salary &&
                         <Descriptions.Item label="Salario">{formatMoney(data.salary)}</Descriptions.Item>}
                         {data.net_worth &&
                         <Descriptions.Item label="Patrimonio">{formatMoney(data.net_worth)}</Descriptions.Item>}
                     </Descriptions>
                         <Row justify="space-between" align="middle">
                             <Col>
                                 <SourcesIconListComponent sources={data.sources}/>
                             </Col>
                             <Col>
                                 <Link to={`/person/${data.document}`}>
                                     <Button className="mas-button">Ver más</Button>
                                 </Link>
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
                src={data.photo}
                alt={data.name}>{getInitials(data.name)}</Avatar>
        </Col>
        <Col span={8}>
            {data.name}
            <br/>
            <small>Cédula: <b>{data.document}</b></small>
        </Col>
        <Col span={4} style={{textAlign: 'right', fontSize: '0.8em', paddingRight: 10}}>
            {formatMoney(data.salary, 'Gs')}
        </Col>
        <Col span={4} style={{textAlign: 'right', fontSize: '0.8em', paddingRight: 10}}>
            {formatMoney(data.net_worth, 'Gs')}
        </Col>
        <Col span={3} offset={1} style={{textAlign: 'right'}}>
            <SourcesIconListComponent sources={data.sources}/>
        </Col>
        <Col span={2} offset={1}>
            <Link to={`/person/${data.document}`}>
                <Button className="mas-button">Ver más</Button>
            </Link>
        </Col>
    </Row>
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
    const name: { val: string, confidence: number } = {val: "", confidence: 0};
    const photo: { val: string, confidence: number } = {val: "", confidence: 0};
    const net_worth: { val?: number, confidence: number } = {val: undefined, confidence: 0};
    const salary: { val?: number, confidence: number } = {val: undefined, confidence: 0};
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

        if (dsInfo.salary !== undefined
            && row.salary !== undefined
            && salary.confidence < dsInfo.salary
            && (!salary.val || salary.val < row.salary)
        ) {
            salary.val = row.salary;
            salary.confidence = dsInfo.salary;
        }

    }

    return {
        name: name.val,
        photo: photo.confidence === 0 ? undefined : photo.val,
        sources: Object.keys(sources),
        document: data.map(d => d.document).filter(d => !!d)[0],
        net_worth: net_worth.val,
        salary: salary.val
    }
}

// 'tsje_elected': 'Autoridades electas',
//     'declarations': 'Declaraciones juradas',
//     'a_quien_elegimos': 'A quien elegimos',
//     'ande_exonerados': 'Exonerados ANDE',
//     'mh': 'Ministerio de Hacienda',
//     'sfp': 'Secretaria de la función pública'
const confidenceByDS: { [k: string]: { name: number, photo?: number, net_worth?: number, salary?: number } } = {
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
    },
    'ande_exonerados': {
        name: 92
    },
    'mh': {
        name: 92
    },
    'sfp': {
        name: 93,
        salary: 100
    },
    'pytyvo': {
        name: 85
    },
    'nangareko': {
        name: 85
    },
    'policia': {
        name: 90,
        salary: 95
    }
}

interface ElasticFtsPeopleResult {
    _id: string;
    source: string;
    name: string;
    document: string | null;
    salary?: number;
    age?: number;
    photo?: string;
    net_worth?: number;
}

interface ElasticFullDataResult {
    _id: string;
    sources: string[];
    name: Array<string | null>;
    document: number;
    age?: Array<number | null>;
    photo?: Array<string | null>;
    net_worth?: Array<number | null>;
    salary?: Array<number | null>
}

const sourceNameIcon: { [k: string]: React.FunctionComponent } = {
    'declarations': Ddjj,
    'a_quien_elegimos': Aqe,
    'ande_exonerados': Ande,
    'sfp': Sfp,
    'mh': Sfp,
    'pytyvo': Pytyvo,
    'nangareko': Nangareko,
    'policia': PoliciaNacional,
    'tsje_elected': Ddjj
}

function SourcesIconListComponent(props: {
    sources: string[]
}) {
    return <>
        {props.sources.map(s =>
            <Tooltip title={sourceNameMap[s] || s} key={s}>
                {sourceNameIcon[s]
                    ? <Icon component={sourceNameIcon[s]} className="source-icon"/>
                    : <small>{s}</small>
                }
            </Tooltip>
        )}
    </>
}

function mapFullDataToFTS(item: ElasticFullDataResult): ElasticFtsPeopleResult[] {
    const toRet: Array<ElasticFtsPeopleResult> = [];

    item.sources.forEach((s, idx) => {
        toRet.push({
            source: s,
            net_worth: item.net_worth?.[idx] || undefined,
            document: item.document + "",
            _id: item._id,
            photo: item.photo?.[idx] || "",
            salary: item.salary?.[idx] || undefined,
            name: item.name && item.name[idx] + "",
            age: item.age?.[idx] || undefined
        })
    })

    return toRet;
}
