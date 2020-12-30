import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {Authorities} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {Card, List, PageHeader, Table, Typography} from 'antd';
import {BaseDatosPage} from '../components/BaseDatosPage';
import {SearchBar} from '../components/SearchBar';
import {formatMoney} from '../formatters';

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
        'full_name',
        'year_elected',
        'charge',
        'document',
        'title',
        'list'
    ]), [data, query]);

    return <>
        <BaseDatosPage menuIndex="authorities" sidebar={isExploreMenu} headerExtra={
            <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
        }>
            <PageHeader ghost={false}
                        style={{border: '1px solid rgb(235, 237, 240)'}}
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
                        dataIndex: 'document',
                        title: 'Nombre',
                        render: (_, r) => {
                            if (!r.document) return <>
                                {r.full_name} <br/>
                                Ayudanos a completar!
                            </>
                            return <>
                                <Link to={`/person/${r.document}`}>
                                    {r.full_name} <br/>
                                    {formatMoney(r.document)}
                                </Link>
                            </>
                        },
                        sorter: (a, b) => (a.document || '').localeCompare(b.document || ''),
                    }, {
                        dataIndex: 'year_elected',
                        title: 'Año',
                        sorter: (a, b) => parseInt(a.year_elected) - parseInt(b.year_elected),
                    }, {
                        title: 'Lista',
                        dataIndex: 'list',

                        render: (_, r) => <>
                            {r.list} <br/>
                            <small>{r.list}</small>
                        </>,
                        sorter: (a, b) => parseInt(a.list) - parseInt(b.list),
                    }, {
                        title: 'Candidatura',
                        dataIndex: 'charge',
                        align: 'right',
                        render: (_, r) => <>
                            {r.charge} <br/>
                            <small>{r.charge}</small>
                        </>,
                    }]}/>
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
                                Nombre: {!r.document ? <> {r.full_name} <br/>
                                    Ayudanos a completar! </> :
                                <>  <Link to={`/person/${r.document}`}>
                                    {r.full_name} <br/>
                                    {r.document}
                                </Link> </>
                            }

                                <br/>
                                Año: {r.year_elected}
                                <br/>
                                Lista: {r.list} <br/>
                                <br/>
                                Candidatura: {r.charge} <br/>
                                <small>{r.title}</small>
                                <br/>
                            </Card>
                        </List.Item>
                    }
                >
                </List>
            </PageHeader>
        </BaseDatosPage>
    </>
}
