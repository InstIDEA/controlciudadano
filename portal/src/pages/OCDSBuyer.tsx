import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {OCDSBuyer, OCDSBuyerWithSuppliers} from '../Model';
import {Checkbox, Descriptions, message, PageHeader, Table, Tabs} from 'antd';
import {Link, useHistory, useParams} from 'react-router-dom';
import {SimpleApi} from '../SimpleApi';
import {getTenderLink} from './OCDSAwardItemsPage';
import {formatIsoDate, formatMoney} from '../formatters';
import {groupBy} from './OCDSItem';
import {NivoBuyerSuppliersPie} from '../components/graphs/NivoBuyerSuppliersPie';
import {BooleanParam, useQueryParam} from 'use-query-params';
import {Header} from "../components/layout/Header";

export function OCDSBuyerPage() {

    const {id} = useParams<{ id: string }>();
    const history = useHistory();
    const [items, setItems] = useState<OCDSBuyerWithSuppliers[]>();
    const [data, setData] = useState<OCDSBuyer>();
    const [onlyCovid, setOnlyCovid] = useQueryParam('onlyCovid', BooleanParam);

    useEffect(() => {
        new SimpleApi()
            .getBuyerInfo(id)
            .then(d => {
                if (d.data.name) setData(d.data);
                else message.warn('Adquiriente no encontrado');
            })
            .catch(e => {
                console.warn(e);
                message.warn('Error cargando buyer');
            });
    }, [id]);

    useEffect(() => {
        new SimpleApi()
            .getSuppliersByBuyer(id)
            .then(d => setItems(d.data.map(d => ({
                ...d,
                awarded: parseFloat(d.awarded as any),
                percentage: parseFloat(d.percentage as any),
                referential: parseFloat(d.referential as any)
            }))))
            .catch(e => {
                console.warn(e);
                message.warn('Error cargando licitaciones');
            });
    }, [id]);

    const finalItems = items
        ? items.filter(c => c.is_covid === !!onlyCovid)
        : undefined;
    console.log(items, finalItems);

    return <>
        <Header tableMode={true}/>
        <PageHeader ghost={false}
                    onBack={() => history.goBack()}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    title={data ? `${data.name}` : 'Cargando...'}
                    subTitle="CDS - IDEA"
                    extra={[
                        <Checkbox checked={!!onlyCovid} key="covid" onChange={_ => setOnlyCovid(a => !a)}>
                            Solo fondos de emergencia
                        </Checkbox>
                    ]}
                    footer={<Tabs defaultActiveKey="SUPPLIER">
                        <Tabs.TabPane tab="Contratos" key="CONTRACTS">
                            <ContractsTable data={finalItems}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Proveedores" key="SUPPLIER">
                            {finalItems ? <SuppliersTable data={finalItems}/>
                                : <div>Cargando ... </div>}
                        </Tabs.TabPane>
                    </Tabs>}>

            <div className="content">
                <div className="main">
                    {data && <Descriptions column={2} size="small">
                        <Descriptions.Item label="Nombre">{data.name}</Descriptions.Item>
                        <Descriptions.Item label="Identificador">{data.id}</Descriptions.Item>
                    </Descriptions>}
                </div>
            </div>


        </PageHeader>
    </>

}

function ContractsTable(props: { data?: OCDSBuyerWithSuppliers[] }) {
    return <Table<OCDSBuyerWithSuppliers>
        dataSource={props.data}
        loading={!props.data}
        rowKey={r => `${r.ocid}${r.awarded}${r.supplier_id}`}
        size="small"
        columns={[{
            key: 'tender_slug',
            title: 'Llamado',
            render: (_, r) => {
                const url = getTenderLink(r.tender_slug, r.procurement_method)
                return <a href={url}>
                    {r.tender_title}
                </a>
            },
            sorter: (a, b) => (a.tender_title || '')
                .localeCompare(b.tender_title),
        }, {
            key: 'supplier_id',
            title: 'Proveedor',
            render: (_, r) => {
                return <Link to={`/ocds/suppliers/${r.supplier_id}`}>
                    {r.supplier}
                </Link>
            },
            sorter: (a, b) => (a.tender_title || '')
                .localeCompare(b.tender_title),
        }, {
            dataIndex: 'referential',
            title: 'Monto referencial',
            align: 'right',
            render: (amount, row) => formatMoney(row.referential),
            sorter: (a, b) => a.referential - b.referential
        }, {
            dataIndex: 'awarded',
            title: 'Monto adjudicado',
            align: 'right',
            render: (amount, row) => formatMoney(row.awarded),
            sorter: (a, b) => a.awarded - b.awarded
        }, {
            dataIndex: 'percentage',
            title: '% incremento',
            align: 'right',
            defaultSortOrder: 'descend',
            render: (amount, row) => formatMoney(row.percentage) + '%',
            sorter: (a, b) => a.percentage - b.percentage
        }, {
            dataIndex: 'date',
            title: 'Fecha de firma',
            render: sign => formatIsoDate(sign),
            sorter: (a, b) => (a.date || '').localeCompare(b.date),
        }]}
    />
}

// function AdjustedAmountComponent(props: { amount?: AdjustedAmount }) {
//     if (!props.amount) return <></>
//     const a = props.amount;
//
//     return <Tooltip placement="top" title={`Monto original ${formatMoney(a.original_amount, a.original_currency)}`}>
//         <span>{formatMoney(a.inflated, 'PYG')}</span>
//     </Tooltip>
// }


function SuppliersTable({data}: { data: OCDSBuyerWithSuppliers[] }) {

    const grouped = useMemo(() => groupBy(data, t => t.supplier_id), [data]);

    const arrayGrouped = useMemo(() => {

        const toRet = Object.keys(grouped)
            .map(key => ({
                id: key,
                name: grouped[key].supplier,
                amount: grouped[key].rows.map(r => r.awarded).reduce((p, c) => p + c, 0)
            }))

        toRet.sort((a1, a2) => a2.amount - a1.amount)
        return toRet;

    }, [grouped])


    const pieData = useMemo(() => {

        return arrayGrouped
            .slice(0, 9)
            .map(item => ({
                "id": item.name,
                "label": item.name,
                "value": item.amount,
                // "color": "hsl(280, 70%, 50%)"
            }))


    }, [arrayGrouped])

    return <Tabs defaultActiveKey="PIE">
        <Tabs.TabPane tab="Tabla" key="TABLE">
            <Table dataSource={arrayGrouped}
                   rowKey="id"
                   columns={[{
                       title: 'Proveedor',
                       dataIndex: 'name',
                       render: (_, r) => <Link to={`/ocds/suppliers/${r.id}`}>
                           {r.name} <br/>
                           <small>{r.id}</small>
                       </Link>,
                       sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
                   }, {
                       title: 'Monto',
                       dataIndex: 'amount',
                       align: 'right',
                       render: (_, r) => formatMoney(_, 'PYG'),
                       sorter: (a, b) => a.amount - b.amount,
                   }]}
            />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Top 10" key="PIE">
            <div style={{
                width: '100%',
                height: '80vh'
            }}>
                <NivoBuyerSuppliersPie data={pieData}/>
            </div>
        </Tabs.TabPane>
    </Tabs>

}
