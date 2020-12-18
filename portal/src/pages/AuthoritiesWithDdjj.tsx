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
    Tag,
    Typography,
    Badge,
    Divider
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
import {Link} from 'react-router-dom';
import {fixName} from '../nameUtils';

export const SOURCE_NAME_MAP: { [k: string]: string } = {
    'tsje_elected': 'Autoridades electas',
    'declarations': 'Declaraciones Juradas de Bienes y Rentas',
    'a_quien_elegimos': 'A Quíenes Elegimos',
    'ande_exonerados': 'Exonerados ANDE',
    'mh': 'Ministerio de Hacienda',
    'sfp': 'Secretaria de la Función Pública',
    'pytyvo': 'Subsidio Pytyvo',
    'nangareko': 'Subsidio Ñangareko',
    'policia': 'Policía Nacional'
}


export function AuthoritiesWithDdjj() {

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');

    const filter = useMemo(() => <Filter/>, []);

    return <ReactiveBase url="https://data.controlciudadanopy.org/" app="fts_authorities_ddjj">
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
                            <Card className="card-style" title="Filtros" style={{width: '100%'}}>
                                <SelectedFilters showClearAll={true}
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
                                                                     {getFilterKeyName(key)}: {getFilterValueName(val)}
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
                                                                 {getFilterKeyName(key)}: {getFilterValueName(label)}
                                                             </Tag>
                                                         })}
                                                     </>;
                                                 }}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Card className="card-style info-ddjj" style={{width: '100%', height: '60px'}}>
                            <Typography.Text style={{color: "white", fontSize: '18px'}}>
                                Podrían existir Declaraciones Juradas presentadas pero no así publicadas por la Contraloría General de la República
                            </Typography.Text>        
                        </Card>
                    </Row>
                    <ChartsComponent isSmall={isSmall}/>
                    <ResultComponent isSmall={isSmall}/>
                </Layout.Content>
            </Layout>
        </Layout>
        <Footer tableMode={true}/>
    </ReactiveBase>

}


function Filter() {
    const anhos = [{key: '2020', doc_count: 15},
    {key: '2019', doc_count: 15}, 
    {key: '2018', doc_count: 15},
    {key: '2017', doc_count: 15},
    {key: '2016', doc_count: 15},]

    return <Col xs={{span: 24}} style={{padding: 5}}>
        <Card title="Fuente de datos" className="card-style">

            <MultiList componentId="Fuente"
                       dataField="department.keyword"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={false}
                       react={{
                           and: ['query', 'Patrimonio', 'Salario', 'Fuente'],
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
                                           {SOURCE_NAME_MAP[item.key] || item.key}
                                       </Checkbox>
                                   </Col>
                                   <Col xs={{span: 6}} style={{textAlign: 'right'}}>
                                       <Badge count={formatMoney(item.doc_count)} style={{backgroundColor: 'gray'}}/>
                                   </Col>
                               </React.Fragment>)}
                           </Row>);
                       }}
            />
            <Divider orientation="left" plain/>
            <Typography.Title className="ant-card-head" style={{paddingLeft: '0'}}>Año</Typography.Title>
            <MultiList componentId="Fuente"
                       dataField="sources.keyword"
                       queryFormat="and"
                       showCheckbox
                       URLParams
                       showSearch={false}
                       react={{
                           and: ['query', 'Patrimonio', 'Salario', 'Fuente'],
                       }}
                       render={({loading, error, data, handleChange, value}) => {
                           if (loading) {
                               return <div>Cargando ...</div>;
                           }
                           if (error) {
                               return <div>Error al cargar datos</div>;
                           }
                           return (<Row>
                               {anhos.map((item: { key: string, doc_count: number }) => <React.Fragment key={item.key}>
                                   <Col xs={{span: 18}}>
                                       <Checkbox checked={value[item.key]}
                                                 onChange={() => handleChange(item.key)}>
                                           {SOURCE_NAME_MAP[item.key] || item.key}
                                       </Checkbox>
                                   </Col>
                                   <Col xs={{span: 6}} style={{textAlign: 'right'}}>
                                        <Badge count={formatMoney(item.doc_count)} style={{backgroundColor: 'gray'}}/>
                                   </Col>
                               </React.Fragment>)}
                           </Row>);
                       }}
            />
        </Card>

        <Card title="Salario" className="card-style">
            <DataSearch componentId="query"
                URLParams
                enableQuerySuggestions={false}
                enablePopularSuggestions={false}
                debounce={300}
                autosuggest={false}
                innerClass={{
                    input: 'fts-search-input'
                }}
                placeholder="Búsqueda por departamentos"
                dataField={['name', 'document.raw']}/>
            <SingleRange componentId="Salario"
                         dataField="salary"
                         showRadio
                         URLParams
                         react={{
                             and: ['query', 'Patrimonio', 'Fuente'],
                         }}
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
                         react={{
                             and: ['query', 'Salario', 'Fuente'],
                         }}
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
        <Card title="Autoridades Electas" className="card-style">
            <Col xs={{span: 24}}>
                {!props.isSmall && <ResultHeader/>}
                <ReactiveList
                    dataField="document.keyword"
                    componentId="SearchResult"
                    react={{
                        and: ['query', 'Fuente', 'Salario', 'Patrimonio']
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
function ChartsComponent(props: {
    isSmall: boolean
}) {

    return <Card className="card-style">
        <Col xl={24}>
            <Row gutter={[8, 0]}>
                <Col xl={12} lg={12} sm={24} xs={24}>
                    <Row gutter={[8,16]}>
                        <Col xl={24} lg={24} sm={24} xs={24}>
                            <div style={{width: '100%', height: '200px', border: '1px solid black'}}></div>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <div style={{width: '100%', height: '200px', border: '1px solid black'}}></div>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <div style={{width: '100%', height: '200px', border: '1px solid black'}}></div>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <div style={{width: '100%', height: '200px', border: '1px solid black'}}></div>
                        </Col>
                        <Col xl={12} lg={12} sm={24} xs={24}>
                            <div style={{width: '100%', height: '200px', border: '1px solid black'}}></div>
                        </Col>
                    </Row>
                </Col>
                <Col xl={12} lg={12} sm={24} xs={24}>
                    <Col xl={24} lg={24}>
                        <div style={{width: '100%', height: '600px', border: '1px solid black'}}></div>
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
        <Col span={14}>
            <b>Nombre</b>
        </Col>
        <Col span={8} style={{textAlign: 'left', fontSize: '0.8em', paddingRight: 10}}>
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
            <Comment author={data.document}
                     className="small-card"
                     avatar={
                         <Avatar
                             style={{backgroundColor: getColorByIdx(props.id), verticalAlign: 'middle'}}
                             alt={data.name}>{getInitials(data.name)}</Avatar>
                     }
                     content={<><Descriptions title={data.name}>
                         {data.document &&
                         <Descriptions.Item label="Salario">{data.document}</Descriptions.Item>}
                     </Descriptions>
                         <Row justify="space-between" align="middle">
                             <Col>
                                {data.year_elected}
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
                alt={data.name}>{getInitials(data.name)}</Avatar>
        </Col>
        <Col span={10}>
            {data.name}
            <br/>
            <small>Cédula: <b>{formatMoney(data.document)}</b></small>
        </Col>
        <Col span={8} offset={1} style={{textAlign: 'right'}}>
            {data.year_elected}
        </Col>
        <Col span={2} offset={1}>
            <Link to={`/person/${data.document}`}>
                <Button className="mas-button">Ver más</Button>
            </Link>
        </Col>
    </Row>
}


const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae'];
const FilterColors: Record<string, string> = {
    'Fuente': 'rgb(205 83 52)',
    'Salario': '#f50',
    'query': '#108ee9',
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
    const year_elected: { val?: number, confidence: number } = {val: 0, confidence: 0};
    for (const row of data) {
        name.val = row.name;
        document.val = row.document;
        year_elected.val = row.year_elected;
    }

    return {
        name: fixName(name.val),
        document: document.val,
        year_elected: year_elected.val,
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
        _id : item._id,
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

function getFilterValueName(val: unknown): string {

    if (typeof val === 'string') {
        return SOURCE_NAME_MAP[val] || val;
    }

    return `${val}`;
}

function getFilterKeyName(val: string): string {

    if (val === 'query') {
        return 'Nombre o apellido';
    }

    return val;
}
