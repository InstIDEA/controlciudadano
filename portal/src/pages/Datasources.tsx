import React, {useEffect, useMemo, useState} from 'react';
import {Button, PageHeader, Space, Table} from 'antd';
import {DownloadOutlined, LinkOutlined, SearchOutlined} from '@ant-design/icons';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {StringParam, useQueryParam} from 'use-query-params';
import {Header} from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './Datasources.css';
import {DataSet} from '../Model';
import {SearchBar} from '../components/SearchBar';
import {DisclaimerComponent} from '../components/Disclaimer';

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

            <DisclaimerComponent>
                Esta lista no abarca todas las fuentes de datos que son de datos abiertos, para una lista mas
                exhaustiva puedes visitar <a href="https://datos.org.py">datos.org.py</a> para ver datos
                recolectados por la Sociedad Civil, Academia y Sector Privado, y puedes visitar <a
                href="https://www.datos.gov.py">datos.gov.py</a> para ver datos abiertos gubernamentales
                publicados por el Gobierno.
            </DisclaimerComponent>

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
                            <LinkToDS data={row}/>
                        </Space>
                    },]}
                />
            </div>
        </PageHeader>
        <Footer tableMode={true}/>
    </>
}

function LinkToDS(props: { data: DataSet }) {

    const withCustomPages: Record<number, string> = {9: "/action", 10: "/explore/comptroller/affidavit"}

    return <Space>
        {props.data.base_url && <a href={props.data.base_url} target="_blank" rel="noopener noreferrer">
          <Button className="btn-wrapper btn-secondary" icon={<LinkOutlined/>}>
            Ir a fuente
          </Button>
        </a>}
        {props.data.files && <Link to={`/sources/${props.data.id}`}>
          <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined/>}>
            Ver más
          </Button>
        </Link>}
        {withCustomPages[props.data.id] && <Link to={withCustomPages[props.data.id]}>
          <Button type="primary" className="btn-wrapper" icon={<SearchOutlined/>}>
            Explorar datos
          </Button>
        </Link>}
    </Space>
}
