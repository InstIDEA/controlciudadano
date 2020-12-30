import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Table, Typography } from 'antd';
import { AuthoritiesWithoutDocument } from '../Model';
import { Link, useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { Header } from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { SearchBar } from '../components/SearchBar';

export function AuthoritiesWithoutDdjj() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<AuthoritiesWithoutDocument[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');

    useEffect(() => {
        setWorking(true);
        new RedashAPI()
            .getAuthoritiesWithoutDocument()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false))
            ;
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'first_name',
        'last_name',
        'document',
        'departament',
        'list',
    ]), [data, query]);

    return<>
        <Header tableMode={true}
            showSeparator={false}
            searchBar={
                <SearchBar defaultValue={query || ''} onSearch={v => setQuery(v)}/>
            }/>
        <PageHeader ghost={false}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            onBack={() => history.push('/')}
            backIcon={null}
            title="¿Quiénes presentaron Declaraciones Juradas?"
            subTitle="">

            <Typography.Paragraph>
                Podrían existir Declaraciones Juradas presentadas pero no así publicadas por la Contraloría General de la República
            </Typography.Paragraph>

            <Table<AuthoritiesWithoutDocument> dataSource={filtered}
                className="hide-responsive"
                loading={working}
                rowKey="ocid"
                size="small"
                pagination={{
                    defaultCurrent: 1,
                    defaultPageSize: 10
                }}
                columns={[{
                    title: 'Documento',
                    align: 'right',
                    dataIndex: 'document',
                    render: (_, r) => <Link to={`/person/${r.document}`}>{r.document}</Link>,
                    sorter: (a, b) => (a.document || '').localeCompare(b.document || ''),
                }, {
                    title: 'Nombre',
                    dataIndex: 'first_name',
                    defaultSortOrder: 'ascend',
                    align: 'right',
                    render: (_, r) => (r.first_name + ' ' + r.last_name),
                    sorter: (a, b) => (a.first_name || '').localeCompare(b.first_name || ''),
                }, {
                    title: 'Año electo',
                    align: 'right',
                    dataIndex: 'year_elected',
                    sorter: (a, b) => a.year_elected - b.year_elected,
                }, {
                    title: 'Departamento',
                    align: 'right',
                    dataIndex: 'departament',
                    sorter: (a, b) => (a.departament || '').localeCompare(b.departament || ''),
                }, {
                    title: 'Cargo',
                    align: 'right',
                    dataIndex: 'charge',
                    sorter: (a, b) => (a.charge || '').localeCompare(b.charge || ''),
                }, {
                    title: 'Partido',
                    align: 'right',
                    dataIndex: 'list',
                    sorter: (a, b) => (a.list || '').localeCompare(b.list || ''),
                }, {
                    title: 'Titulo',
                    align: 'right',
                    dataIndex: 'list',
                    sorter: (a, b) => (a.title || '').localeCompare(b.title || ''),
                }, {
                    title: '¿Presentó?',
                    align: 'right',
                    dataIndex: 'presented',
                    render: (_, r) => (r.presented ? <a href={r.start?.link} target="_blank" rel="noopener noreferrer" title="Ver"> Si </a> : 'No'),
                    sorter: (a, _) => (a.presented ? 1 : -1),
                }]} />
        </PageHeader>
        <Footer tableMode={true}/>
    </>
}
