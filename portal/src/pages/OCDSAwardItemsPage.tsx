import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Input, PageHeader, Table, Tag, Typography } from 'antd';
import { OCDSItemsAwardedCOVID19 } from '../Model';
import { formatMoney } from '../formatters';
import { Link, useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { BaseDatosPage } from '../components/BaseDatosPage';

export function OCDSAwardItemsPage() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<OCDSItemsAwardedCOVID19[]>();
    const history = useHistory();

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getItems()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false))
            ;
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'item_classification_nivel_5_id',
        'item_adjudicado',
        'supplier_name',
        'llamado_numero',
        'supplier_ruc'
    ]), [data, query]);

    return <BaseDatosPage
        menuIndex="items">
        <PageHeader ghost={false}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            onBack={() => history.push('/')}
            backIcon={null}
            title="Lista de Items COVID-19"
            extra={[
                <Input.Search placeholder="Buscar"
                    key="search_input"
                    defaultValue={query}
                    onSearch={setQuery}
                    formMethod="submit" />
            ]}>

            <Typography.Paragraph>
                Listado de ítems que fueron adjudicados en procesos de licitación marcados con COVID-19.
        </Typography.Paragraph>

            <Table<OCDSItemsAwardedCOVID19>
                dataSource={filtered}
                loading={working}
                rowKey="id"
                size="small"
                pagination={{
                    defaultPageSize: 10,
                    defaultCurrent: 1
                }}
                columns={[{
                    key: 'llamado_nombre',
                    title: 'Llamado',
                    render: (_, r) => {
                        const url = getTenderLink(r.llamado_slug, r.procurement_method);
                        return <a href={url} rel="noopener noreferrer" target="_blank">
                            {r.llamado_nombre} <br />
                            <small>{r.llamado_numero}</small> <br />
                            {(r.covered_by || []).sort().map(f => <Tag key={f}>{f}</Tag>)}
                        </a>
                    }
                }, {
                    key: 'supplier_name',
                    dataIndex: 'supplier_name',
                    title: 'Proveedor',
                    render: (_, r) => {
                        return <Link to={`/ocds/suppliers/${r.supplier_ruc}`} target="_blank">
                            {r.supplier_name}
                            <br />
                            <small>{r.supplier_ruc}</small>
                        </Link>
                    },
                    sorter: (a, b) => (a.supplier_name || '')
                        .localeCompare(b.supplier_name),
                }, {
                    key: 'buyer_name',
                    dataIndex: 'buyer_name',
                    title: 'Comprador',
                    render: (_, r) => {
                        return <Link to={`/ocds/buyer/${r.buyer_id}`} target="_blank">
                            {r.buyer_name}
                            <br />
                            <small>{r.buyer_id}</small>
                        </Link>
                    },
                    sorter: (a, b) => (a.buyer_name || '').localeCompare(b.buyer_name),
                }, {
                    key: 'item_adjudicado',
                    title: 'Item',
                    dataIndex: 'item_adjudicado',
                    render: (_, r) => {
                        return <Link to={`/ocds/items/${r.item_classification_nivel_5_id}`} target="_blank">
                            {r.item_adjudicado}
                            <br />
                            <small>{r.item_classification_nivel_5_nombre}</small>
                            <br />
                            <small>{(r.item_classification_nivel_5_id || "").replace("catalogoNivel5DNCP-", "")}</small>
                        </Link>
                    },
                    sorter: (a, b) => (a.item_classification_nivel_5_nombre || '')
                        .localeCompare(b.item_classification_nivel_5_nombre),
                }, {
                    key: 'precio_unitario',
                    dataIndex: 'precio_unitario',
                    align: 'right',
                    title: 'Precio',
                    render: (_, r) => {
                        return <>
                            {formatMoney(r.precio_unitario)}
                            <br />
                            <small>{r.unidad_medida}</small>
                        </>
                    },
                    sorter: (a, b) => a.precio_unitario - b.precio_unitario,
                }, {
                    key: 'porcentaje_mayor_precio_antes_pandemia',
                    dataIndex: 'porcentaje_mayor_precio_antes_pandemia',
                    align: 'right',
                    title: 'Incremento de precio durante pandemia',
                    defaultSortOrder: 'descend',
                    render: (_, r) => {
                        return <>
                            {formatMoney(r.porcentaje_mayor_precio_antes_pandemia)}%
                    </>
                    },
                    sorter: (a, b) => (a || 0).porcentaje_mayor_precio_antes_pandemia - (b || 0).porcentaje_mayor_precio_antes_pandemia,
                }, {
                    key: 'cantidad',
                    dataIndex: 'cantidad',
                    align: 'right',
                    title: 'Cantidad',
                    render: (i) => formatMoney(i)
                }]} />
        </PageHeader>
    </BaseDatosPage>
}

export function getTenderLink(slug: string, method: string): string {
    return method === 'direct'
        ? 'https://contrataciones.gov.py/sin-difusion-convocatoria/' + slug + '.html'
        : 'https://contrataciones.gov.py/licitaciones/convocatoria/' + slug + '.html'
}
