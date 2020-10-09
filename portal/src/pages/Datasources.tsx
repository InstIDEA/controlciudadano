import React, { useEffect, useMemo, useState } from 'react';
import { Button, Input, PageHeader, Space, Table } from 'antd';
import { DownloadOutlined, LinkOutlined } from '@ant-design/icons';
import { useHistory, Link } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { StringParam, useQueryParam } from 'use-query-params';
import { Header } from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './Datasources.css';
import { SearchOutlined } from '@ant-design/icons'
import { DataSet } from '../Model';

export function DS() {

    const [working, setWorking] = useState(false);
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [data, setData] = useState<DataSet[]>();
    const history = useHistory();

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getDataSets()
            .then(d => {
                setData(prev => [
                    ...d.query_result.data.rows.map(row => ({
                        id: row.id,
                        files: row.files,
                        institution: row.institution,
                        name: row.name,
                        description: row.description,
                        kind: row.kind,
                        base_url: row.base_url,
                        last_update: row.last_update

                    })),
                ])
            })
            .finally(() => setWorking(false));
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query || '', [
        'name',
        'institution'
    ]), [data, query]);

    return <>
        <Header tableMode={true} searchBar={
            <div className="header-search-wrapper">
                <Input.Search
                    prefix={<SearchOutlined />}
                    suffix={null}
                    placeholder="Buscar"
                    key="search_input"
                    defaultValue={query || ''}
                    onSearch={v => setQuery(v)}
                    style={{ width: 200 }}
                    formMethod="submit" />
            </div>
        } />
        <PageHeader title="Fuente"
            onBack={() => history.push('/')}
            backIcon={null}
            subTitle="">

            <div style={{ padding: 12 }}>
                <Table<DataSet>
                    loading={working}
                    rowKey="url"
                    dataSource={filtered}
                    columns={[{
                        title: 'Fuente',
                        dataIndex: 'institution',
                        sorter: (a, b) => (a.institution || '').localeCompare(b.institution)
                    }, {
                        title: "Acciones",
                        dataIndex: "name",
                        render: (_, row) => <Space className="action-column">
                            <Space>
                                {LinkToDS({ data: row })}
                                {row.base_url && <a href={row.base_url} target="_blank" rel="noopener noreferrer">
                                    <Button className="btn-wrapper btn-secondary" icon={<LinkOutlined />}>
                                        Ir a fuente
                            </Button>
                                </a>}
                            </Space>
                        </Space>
                    }, {
                        title: 'Descripción',
                        dataIndex: 'description',
                        sorter: (a, b) => (a.name || '').localeCompare(b.name)
                    }]}
                />
            </div>
        </PageHeader>
        <Footer tableMode={true} />
    </>
}

function LinkToDS(props: { data: DataSet }) {
    if (props.data.files) return <Link to={`/sources/${props.data.id}`} >
        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
            Ver más
        </Button>
    </Link>
    if (props.data.id === 9) return <Link to="/action">
        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
            Ver más
        </Button>
    </Link>
    if (props.data.id === 10) return <Link to="/explore/contralory/affidavit"><Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
        Ver más
    </Button></Link>
    return <></>
}