import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {Authorities} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {Input, PageHeader, Table, Typography} from 'antd';

export function ElectedAuthoritiesPage() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<Authorities[]>();
    const history = useHistory();

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

    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="Autoridades electas"
                       extra={[
                           <Link to="/sources?query=tsje_elected" key="link">
                               Fuente
                           </Link>,
                           <Input.Search placeholder="Buscar"
                                         style={{width: '80%'}}
                                         key="search_input"
                                         defaultValue={query}
                                         onSearch={setQuery}
                                         formMethod="submit"/>
                       ]}>

        <Typography.Paragraph>
            Todas las autoridades que han sido electas en elecciones generales.
        </Typography.Paragraph>

        <Table<Authorities>
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
                        {r.nombre} {r.apellido} <br/>
                        Ayudanos a completar!
                    </>
                    return <>
                        <Link to={`/people/${r.cedula}`}>
                            {r.nombre} {r.apellido} <br/>
                            {r.cedula}
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
                    {r.siglas_lista} <br/>
                    <small>{r.nombre_lista} - {r.lista}</small>
                </>,
                sorter: (a, b) => parseInt(a.lista) - parseInt(b.lista),
            }, {
                title: 'Candidatura',
                dataIndex: 'dep_desc',
                align: 'right',
                render: (_, r) => <>
                    {r.cand_desc} <br/>
                    <small>{r.dep_desc} - {r.desc_tit_sup}</small>
                </>,
            }]}/>
    </PageHeader>

}
