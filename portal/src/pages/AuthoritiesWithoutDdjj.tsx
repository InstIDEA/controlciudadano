import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Table, Typography, List, Card } from 'antd';
import { AuthoritiesWithoutDocument } from '../Model';
import { useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import {Header} from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { SearchBar } from '../components/SearchBar';

export function AuthoritiesWithoutDdjj() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<AuthoritiesWithoutDocument[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');
    const isExploreMenu = history.location.pathname.includes('ddjj/list');

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
            title="¿Quienes presentaron DDJJ?"
            subTitle="">


            <Typography.Paragraph>
                Control de todas las autoridades electas (por periodo), que presentaron o no declaraciones juradas.
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
                    title: 'Nombre',
                    dataIndex: 'first_name',
                    defaultSortOrder: 'ascend',
                    align: 'right',
                    render: (_, r) => (r.first_name),
                    sorter: (a, b) => (a.first_name || '').localeCompare(b.first_name),
                }, {
                    title: 'Apellido',
                    dataIndex: 'last_name',
                    defaultSortOrder: 'ascend',
                    align: 'right',
                    render: (_, r) => (r.last_name),
                    sorter: (a, b) => (a.last_name || '').localeCompare(b.last_name),
                }, {
                    title: 'Cedula',
                    align: 'right',
                    dataIndex: 'document',
                    render: (_, r) => (r.document),
                    sorter: (a, b) => (a.document || '').localeCompare(b.document),
                }, {
                    title: 'Año electo',
                    align: 'right',
                    dataIndex: 'year_elected',
                    render: (_, r) => (r.year_elected), 
                }, {
                    title: 'Departamento',
                    align: 'right',
                    dataIndex: 'departament',
                    render: (_, r) => (r.departament),
                    sorter: (a, b) => (a.departament || '').localeCompare(b.departament),
                }, {
                    title: 'Cargo',
                    align: 'right',
                    dataIndex: 'charge',
                    render: (_, r) => (r.charge),
                }, {
                    title: 'Partido',
                    align: 'right',
                    dataIndex: 'list',
                    render: (_, r) => (r.list),
                    sorter: (a, b) => (a.list || '').localeCompare(b.list),
                }, {
                    title: 'Titulo',
                    align: 'right',
                    dataIndex: 'list',
                    render: (_, r) => (r.title),
                }, {
                    title: 'Presento DDJJ?',
                    align: 'right',
                    dataIndex: 'presented',
                    render: (_, r) => (r.presented ? 'Si' : 'No'),
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
                    renderItem={(r: AuthoritiesWithoutDocument) =>
                        <List.Item className="list-item">
                            <Card bordered={false}>
                                Nombre: { r.first_name }
                                <br />
                                Apellido: { r.last_name }
                                <br />
                                Documento: { r.document }
                                <br />
                                Departamento: { r.departament }
                                <br />
                                Año electo: { r.year_elected }
                                <br />
                                Cargo: { r.charge }
                                <br />
                                Departamento: { r.departament }
                                <br />
                                Partido: { r.list }
                                <br />
                                Presento DDJJ?: { r.presented ? 'Si' : 'No' }
                                <br />
                            </Card>
                        </List.Item>
                    }
                >
                </List>
        </PageHeader>
        <Footer tableMode={true}/>
    </>
}
