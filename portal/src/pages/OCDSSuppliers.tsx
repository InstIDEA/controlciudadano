import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Table, Typography, List, Card } from 'antd';
import { Supplier } from '../Model';
import { Link, useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchBar } from '../components/SearchBar';
export function OCDSSuppliers() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<Supplier[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');

    useEffect(() => {
        setWorking(true);
        new RedashAPI('ZqCJWLGSUe8PP5WCTFagX28DBOjSLalZ28c2Qe47')
            .getSuppliers()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false))
            ;
    }, []);


    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'ruc',
        'name',
        'contact_point'
    ]), [data, query]);

    return <>
        <BaseDatosPage menuIndex="suppliers" headerExtra={
           <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
        }>
            <PageHeader ghost={false}
                style={{ border: '1px solid rgb(235, 237, 240)' }}
                onBack={() => history.push('/')}
                backIcon={null}
                title="Proveedores"
                subTitle="">


                <Typography.Paragraph>
                    Listado de todas aquellas personas físicas o jurídicas que han participado en una licitación pública.
        </Typography.Paragraph>

                <Table<Supplier> dataSource={filtered}
                    loading={working}
                    rowKey="ruc"
                    size="small"
                    className="hide-responsive"
                    pagination={{
                        defaultCurrent: 1,
                        defaultPageSize: 10
                    }}
                    columns={[{
                        dataIndex: 'ruc',
                        title: 'RUC',
                        align: 'right',
                        render: ruc => <Link to={`/ocds/suppliers/${ruc}`}>{ruc}</Link>,
                        sorter: (a, b) => (a.ruc || '').localeCompare(b.ruc)
                    }, {
                        dataIndex: 'name',
                        title: 'Nombre',
                        sorter: (a, b) => (a.name || '').localeCompare(b.name),
                    }, {
                        dataIndex: 'contact_point',
                        title: 'Contacto',
                        sorter: (a, b) => (a.contact_point || '').localeCompare(b.contact_point)
                    }, {
                        key: 'address',
                        title: 'Dirección',
                        render: (_, row) => <>
                            {
                                [row.address, row.city, row.department, row.country]
                                    .filter(i => i && i !== '-')
                                    .join(', ')
                            }
                        </>
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
                        pageSizeOptions: ["10", "50"],
                        position: "bottom"
                    }}
                    loading={working}
                    dataSource={filtered}
                    renderItem={(row: Supplier) =>
                        <List.Item className="list-item">
                            <Card bordered={false}>
                                R.U.C: <Link to={`/ocds/suppliers/${row.ruc}`}>{row.ruc}</Link>
                                <br />
                                Nombre: {row.name}
                                <br />
                                Contacto: {row.contact_point}
                                <br />
                                Dirección: {
                                    [row.address, row.city, row.department, row.country]
                                        .filter(i => i && i !== '-')
                                        .join(', ')
                                }
                            </Card>
                        </List.Item>
                    }
                >
                </List>
            </PageHeader>
        </BaseDatosPage>
    </>
}
