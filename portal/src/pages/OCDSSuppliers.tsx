import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Input, PageHeader, Table, Typography} from 'antd';
import {Supplier} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';

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

    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="Proveedores"
                       subTitle="CDS - IDEA"
                       extra={[
                           <Input.Search placeholder="Buscar"
                                         key="search_input"
                                         defaultValue={query}
                                         onSearch={setQuery}
                                         formMethod="submit"/>
                       ]}>


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

}
