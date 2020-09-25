import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Input, PageHeader, Table, Typography} from 'antd';
import {Supplier} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchOutlined } from '@ant-design/icons'
export function OCDSSuppliers() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<Supplier[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');
    const isExploreMenu = history.location.pathname.includes('explore');

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
        <BaseDatosPage menuIndex="suppliers" sidebar={isExploreMenu} headerExtra={
        <div className="header-search-wrapper">
            <Input.Search
            prefix={<SearchOutlined />}
            suffix={null}
            placeholder="Buscar"
            key="search_input"
            defaultValue={query}
            style={{ width: 200 }}
            onSearch={setQuery}
            formMethod="submit"/>
        </div>
        }>
        <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="Proveedores"
                       subTitle="CDS - IDEA">


        <Typography.Paragraph>
            Listado de todas aquellas personas físicas o jurídicas que han participado en una licitación pública.
        </Typography.Paragraph>

        <Table<Supplier> dataSource={filtered}
                         loading={working}
                         rowKey="ruc"
                         size="small"
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
                         }]}/>
    </PageHeader>
    </BaseDatosPage>
    </>
}
