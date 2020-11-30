import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { Authorities } from '../Model';
import { Link, useHistory } from 'react-router-dom';
import { PageHeader, Table, Typography, List, Card } from 'antd';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchBar } from '../components/SearchBar';
import {formatMoney} from "../formatters";


export function ElectedAuthoritiesPage() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<Authorities[]>();
    const history = useHistory();
    const isExploreMenu = history.location.pathname.includes('explore');

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getAuthorities()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false));
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'nombre',
        'apellido',
        'ano',
        'cand_desc',
        'cedula',
        'desc_tit_sup',
        'nombre_lista',
        'siglas_lista',
    ]), [data, query]);

    return <>
        <BaseDatosPage menuIndex="authorities" sidebar={isExploreMenu} headerExtra={
            <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
        }>
            <PageHeader ghost={false}
                style={{ border: '1px solid rgb(235, 237, 240)' }}
                onBack={() => history.push('/')}
                backIcon={null}
                title="Autoridades electas"
                extra={[
                    <Link to="/sources?query=tsje_elected" key="link">
                        Fuente
                           </Link>
                ]}>

                <Typography.Paragraph>
                    Todas las autoridades que han sido electas en elecciones generales.
        </Typography.Paragraph>

                <Table<Authorities>
                    className="hide-responsive"
                    dataSource={filtered}
                    loading={working}
                    rowKey="id"
                    size="small"
                    pagination={{
                        defaultPageSize: 10,
                        defaultCurrent: 1
                    }}
                    columns={[{
                        dataIndex: 'cedula',
                        title: 'Nombre',
                        render: (_, r) => {
                            if (!r.cedula) return <>
                                {r.nombre} {r.apellido} <br />
                                Ayudanos a completar!
                    </>
                            return <>
                                <Link to={`/person/${r.cedula}`}>
                                    {r.nombre} {r.apellido} <br />
                                    {formatMoney(r.cedula)}
                                </Link>
                            </>
                        },
                        sorter: (a, b) => (a.cedula || '').localeCompare(b.cedula || ''),
                    }, {
                        dataIndex: 'ano',
                        title: 'Año',
                        sorter: (a, b) => parseInt(a.ano) - parseInt(b.ano),
                    }, {
                        title: 'Lista',
                        dataIndex: 'lista',

                        render: (_, r) => <>
                            {r.siglas_lista} <br />
                            <small>{r.nombre_lista} - {r.lista}</small>
                        </>,
                        sorter: (a, b) => parseInt(a.lista) - parseInt(b.lista),
                    }, {
                        title: 'Candidatura',
                        dataIndex: 'dep_desc',
                        align: 'right',
                        render: (_, r) => <>
                            {r.cand_desc} <br />
                            <small>{r.dep_desc} - {r.desc_tit_sup}</small>
                        </>,
                    }]} />
                <List
                    className="show-responsive"
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 1,
                        lg: 4,
                        xl: 5,
                        xxl: 6
                    }}
                    pagination={{
                        showSizeChanger: true,
                        position: "bottom"
                    }}
                    dataSource={filtered}
                    loading={working}
                    renderItem={(r: Authorities) =>
                        <List.Item className="list-item">
                            <Card bordered={false}>
                                Nombre: {!r.cedula ? <> {r.nombre} {r.apellido} <br />
                                    Ayudanos a completar! </> :
                                    <>  <Link to={`/person/${r.cedula}`}>
                                        {r.nombre} {r.apellido} <br />
                                        {formatMoney(r.cedula)}
                                    </Link> </>
                                }

                                <br />
                                Año: {r.ano}
                                <br />
                                Lista: {r.siglas_lista} <br />
                                <small>{r.nombre_lista} - {r.lista}</small>
                                <br />
                                Candidatura:  {r.cand_desc} <br />
                                <small>{r.dep_desc} - {r.desc_tit_sup}</small>
                                <br />
                            </Card>
                        </List.Item>
                    }
                >
                </List>
            </PageHeader>
        </BaseDatosPage>
    </>
}
