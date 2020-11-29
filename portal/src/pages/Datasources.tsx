import React, {useEffect, useMemo, useState} from 'react';
import {Button, Col, PageHeader, Row, Space, Table} from 'antd';
import {DownloadOutlined, InfoCircleTwoTone, LinkOutlined, SearchOutlined} from '@ant-design/icons';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {StringParam, useQueryParam} from 'use-query-params';
import {Header} from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './Datasources.css';
import {DataSet} from '../Model';
import {SearchBar} from '../components/SearchBar';

export function DS() {

    const [working, setWorking] = useState(false);
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [data, setData] = useState<DataSet[]>();
    const history = useHistory();

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getDataSets()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false));
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query || '', [
        'description',
        'institution'
    ]), [data, query]);

    return <>
        <Header tableMode={true}
                showSeparator={false}
                searchBar={
                    <SearchBar defaultValue={query || ''} onSearch={v => setQuery(v)}/>
                }/>
        <PageHeader title="Listado de fuentes de datos que son utilizados dentro del Portal."
                    onBack={() => history.push('/')}
                    backIcon={null}
                    subTitle="">
            <Row className="disclaimer-sources"
                 align="middle"
                 justify="space-around"
            >
                <Col xs={24} md={2} xl={1} style={{textAlign: 'center'}}>
                    <InfoCircleTwoTone style={{fontSize: 28}}/>
                </Col>
                <Col xs={24} md={22}>
                    Esta lista no abarca todas las fuentes de datos que son de datos abiertos, para una lista mas
                    exhaustiva puedes visitar <a href="https://datos.org.py">datos.org.py</a> para ver datos
                    recolectados por la Sociedad Civil, Academia y Sector Privado, y puedes visitar <a
                    href="https://www.datos.gov.py">datos.gov.py</a> para ver datos abiertos gubernamentales
                    publicados por el Gobierno.

                </Col>
            </Row>

            <div style={{padding: 12}}>
                <Table<DataSet>
                    loading={working}
                    rowKey="id"
                    dataSource={filtered}
                    columns={[{
                        title: 'Institución',
                        dataIndex: 'institution',
                        sorter: (a, b) => (a.institution || '').localeCompare(b.institution)
                    }, {
                        title: 'Descripción',
                        dataIndex: 'description',
                        sorter: (a, b) => (a.name || '').localeCompare(b.name)
                    }, {
                        title: "Acciones",
                        dataIndex: "name",
                        render: (_, row) => <Space className="action-column">
                            <Space>
                                {row.base_url && <a href={row.base_url} target="_blank" rel="noopener noreferrer">
                                  <Button className="btn-wrapper btn-secondary" icon={<LinkOutlined/>}>
                                    Ir a fuente
                                  </Button>
                                </a>}
                                <LinkToDS data={row}/>
                            </Space>
                        </Space>
                    },]}
                />
            </div>
        </PageHeader>
        <Footer tableMode={true}/>
    </>
}

function LinkToDS(props: { data: DataSet }) {
    if (props.data.files) return <Link to={`/sources/${props.data.id}`}>
        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined/>}>
            Ver más
        </Button>
    </Link>
    if (props.data.id === 9) return <Link to="/action">
        <Button type="primary" className="btn-wrapper" icon={<SearchOutlined/>}>
            Explorar datos
        </Button>
    </Link>
    if (props.data.id === 10) return <Link to="/explore/contralory/affidavit">
        <Button type="primary" className="btn-wrapper" icon={<SearchOutlined/>}>
            Explorar datos
        </Button></Link>
    return <></>
}
