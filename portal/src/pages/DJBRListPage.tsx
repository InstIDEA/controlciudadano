import * as React from 'react';
import {useMemo, useState} from 'react';
import {PageHeader, Table, Typography} from 'antd';
import {AsyncHelper, AuthoritiesWithoutDocument} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList} from '../RedashAPI';
import {SearchBar} from '../components/SearchBar';
import {useDJBRStats} from "../hooks/useStats";
import {useRedashApi} from "../hooks/useApi";
import {formatSortableDate} from "../formatters";
import {BaseDatosPage} from "../components/BaseDatosPage";

export function DJBRListPage() {

    const stats = useDJBRStats();
    const data = useRedashApi(45);
    const history = useHistory();
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => filterRedashList(AsyncHelper.or(data, []), query, [
        'first_name',
        'last_name',
        'document',
        'departament',
        'list',
    ]), [data, query]);

    return <BaseDatosPage menuIndex="auth_djbr" headerExtra={
        <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
    }>
        <PageHeader ghost={false}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => history.push('/')}
                    backIcon={null}
                    title="Listado de declaraciones juradas de bienes y rentas presentadas por autoridades electas"
                    subTitle=""
                    extra={[
                        <Link to="/sources/4" key="source">
                            Fuente
                        </Link>
                    ]}>

            <Typography.Paragraph>
                Podrían existir Declaraciones Juradas de bienes y rentas presentadas pero no así publicadas por la
                Contraloría General de la República, la información presentada fue actualizada
                al {formatSortableDate(stats.last_success_fetch)}.
            </Typography.Paragraph>

            <Table<AuthoritiesWithoutDocument> dataSource={filtered}
                                               className="hide-responsive"
                                               loading={data.state === 'FETCHING'}
                                               rowKey="id"
                                               size="small"
                                               pagination={{
                                                   defaultCurrent: 1,
                                                   defaultPageSize: 10
                                               }}
                                               columns={[{
                                                   title: 'Documento',
                                                   align: 'right',
                                                   dataIndex: 'document',
                                                   render: (_, r) => <Link
                                                       to={`/person/${r.document}`}>{r.document}</Link>,
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
                                                   render: (_, r) => (r.presented ?
                                                       <a href={r.start?.link} target="_blank" rel="noopener noreferrer"
                                                          title="Ver"> Si </a> : 'No'),
                                                   sorter: (a, _) => (a.presented ? 1 : -1),
                                               }]}/>
        </PageHeader>
    </BaseDatosPage>
}
