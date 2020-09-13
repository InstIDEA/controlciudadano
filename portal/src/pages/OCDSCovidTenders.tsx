import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Input, PageHeader, Space, Table, Typography} from 'antd';
import {OCDSCovidTender} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI, removeDuplicated} from '../RedashAPI';
import {getTenderLink} from './OCDSAwardItemsPage';
import {formatMoney} from '../formatters';

type OCDSCovidTenderWithQuery = OCDSCovidTender & {
    buyer_query: string;
    supplier_query: string;
}

const labels: Record<string, string> = {'complete': 'Completa', 'active': 'Activa', 'unsuccessful': 'Fallida'};

export function OCDSCovidTenders() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<OCDSCovidTenderWithQuery[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');

    useEffect(() => {
        setWorking(true);
        new RedashAPI()
            .getCovidTenders()
            .then(d => setData(d.query_result.data.rows.map(t => ({
                ...t,
                buyer_query: (t.buyer || []).map(t => t.name).join(','),
                supplier_query: (t.supplier || []).map(t => t.name).join(','),
            }))))
            .finally(() => setWorking(false))
        ;
    }, []);


    const filtered = useMemo(() => removeDuplicated(filterRedashList(data || [], query, [
        'tender_amount',
        'tender_title',
        'buyer_query',
        'supplier_query'
    ]), d => d.ocid), [data, query]);

    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="Licitaciones"
                       subTitle="CDS - IDEA"
                       extra={[<Input.Search placeholder="Buscar"
                                             key="search_input"
                                             defaultValue={query}
                                             onSearch={setQuery}
                                             formMethod="submit"/>]}>


        <Typography.Paragraph>
            Listado de todas aquellas licitaciones que se hicieron con fondos de emergencia
        </Typography.Paragraph>

        <Table<OCDSCovidTenderWithQuery>
            dataSource={filtered}
            loading={working}
            rowKey="ocid"
            size="small"
            pagination={{
                defaultCurrent: 1,
                defaultPageSize: 10
            }}
            columns={[{
                title: 'Llamado',
                dataIndex: 'title',
                render: (_, r) => <>
                    <a href={getTenderLink(r.tender_slug, r.procurement_method)}
                       target="__blank"
                       rel="noopener noreferrer">
                        {r.tender_title}
                    </a>
                </>
            }, {
                dataIndex: 'buyer',
                title: 'Comprador',
                align: 'right',
                render: (_, r) => <Space direction="vertical">
                    {(r.buyer || []).map(b => <Link to={`/ocds/buyer/${b.id}?onlyCovid=1`} key={b.id}>
                        {b.name}
                    </Link>)}
                </Space>
            }, {
                dataIndex: 'supplier',
                title: 'Proveedor',
                align: 'right',
                render: (_, r) => <Space direction="vertical">
                    {(r.supplier || []).map(s => <Link to={`/ocds/supplier/${s.id}?onlyCovid=1`} key={s.id}>
                        {s.name}
                    </Link>)}
                </Space>
            }, {
                title: 'Estado',
                dataIndex: 'status',
                render: s => labels[s] || s
            }, {
                title: 'Monto',
                dataIndex: 'tender_amount',
                defaultSortOrder: 'descend',
                align: 'right',
                render: (_, r) => formatMoney(r.tender_amount, 'PYG'),
                sorter: (a, b) => a.tender_amount - b.tender_amount,
            }]}/>
    </PageHeader>

}
