import * as React from 'react';
import {useMemo} from 'react';
import {Avatar, Card, Col, Collapse, Comment, Divider, Layout, Row, Tag, Typography, Tooltip} from 'antd';
import {Header} from '../components/layout/Header';
import './AuthoritiesWithDdjj.css'
import Footer from '../components/layout/Footer';
import {MultiList, ReactiveBase, ReactiveList, SelectedFilters} from '@appbaseio/reactivesearch';
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
                        <Card className="card-style info-ddjj" style={{width: '100%'}}>
                            <Typography.Text style={{color: "white", fontSize: '18px'}}>
                                Podrían existir Declaraciones Juradas presentadas pero no así publicadas por la
                                Contraloría General de la República
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
                           and: ['departament', 'year_elected'],
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
                           and: ['departament', 'year_elected'],
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
                           and: ['list', 'year_elected'],
                       }}
            />
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
                    <Row gutter={[8, 16]}>
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
        <Col span={7} style={{textAlign: 'right', fontSize: '1em'}}>
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
                                <Tooltip title={data.start_declaration ? 'Presentó' : 'No presentó'} style={{marginLeft: 20}}>
                                    <Typography.Text style={{fontSize: 20, color: data.end_declaration ? 'green' : 'red', textAlign: 'right'}}>
                                        {data.year_elected}
                                    </Typography.Text>
                                </Tooltip>
                                <Tooltip title={data.end_declaration ? 'Presentó' : 'No presentó'}  style={{marginLeft: 20}}>
                                    <Typography.Text style={{marginLeft: 20, fontSize: 20, color: data.end_declaration ? 'green' : 'red', textAlign: 'right'}}>
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
                <Typography.Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', color: data.end_declaration ? 'green' : 'red'}}>
                    {data.year_elected}
                </Typography.Text>
            </Tooltip>
            <Tooltip title={data.end_declaration ? 'Presentó' : 'No presentó'}  style={{marginLeft: 20}}>
                <Typography.Text style={{marginLeft: 20, fontSize: 20, fontWeight: 'bold', color: data.end_declaration ? 'green' : 'red'}}>
                    {data.year_elected + 5}
                </Typography.Text>
            </Tooltip>
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
