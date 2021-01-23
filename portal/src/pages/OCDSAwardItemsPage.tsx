import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Card, List, PageHeader, Table, Tag, Typography} from 'antd';
import {OCDSItemsAwardedCOVID19} from '../Model';
import {formatMoney} from '../formatters';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {BaseDatosPage} from '../components/BaseDatosPage';
import '../components/layout/Layout.css'
import {SearchBar} from '../components/SearchBar';
import {DisclaimerComponent} from '../components/Disclaimer';
import './OCDSAwardItemsPage.css';

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
        'supplier_ruc',
        'buyer_name'
    ]), [data, query]);

    return <BaseDatosPage menuIndex="items"
                          className="oaip"
                          headerExtra={
                              <SearchBar defaultValue={query}
                                         placeholder="Buscar ítems, proveedores, compradores"
                                         onSearch={setQuery}/>
                          }>
        <PageHeader ghost={false}
                    style={{border: '1 px solid rgb(235, 237, 240)'}}
                    onBack={() => history.push('/')}
                    backIcon={null}
                    title="¿Se compró más caro?">

            <Typography.Paragraph>
                Ránking de items con posibles sobrecostos, comparados con sus precios antes de la pandemia.
            </Typography.Paragraph>
            <DisclaimerComponent>
                Las unidades de medida no especificadas en el portal de la <a href="https://contrataciones.gov.py/">Dirección
                Nacional de Contrataciones Públicas (DNCP)</a> pueden arrojar datos no específicos respecto al
                porcentaje de sobrecostos.
            </DisclaimerComponent>
            <Table<OCDSItemsAwardedCOVID19>
                dataSource={filtered}
                loading={working}
                rowKey={r => `${r.llamado_nombre}${r.precio_unitario}${r.cantidad}`}
                size="small"
                className="hide-responsive"
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
                            {r.llamado_nombre} <br/>
                            <small>{r.llamado_numero}</small> <br/>
                            {(r.covered_by || []).sort().map(f => <Tag key={f}>{f}</Tag>)}
                        </a>
                    },
                }, {
                    key: 'supplier_name',
                    dataIndex: 'supplier_name',
                    title: 'Proveedor',
                    responsive: ['lg'],
                    render: (_, r) => {
                        return <Link to={`/ocds/suppliers/${r.supplier_ruc}`}>
                            {r.supplier_name}
                            <br/>
                            <small>{r.supplier_ruc}</small>
                        </Link>
                    },
                    sorter: (a, b) => (a.supplier_name || '')
                        .localeCompare(b.supplier_name),
                }, {
                    key: 'buyer_name',
                    dataIndex: 'buyer_name',
                    title: 'Comprador',
                    responsive: ['lg'],
                    render: (_, r) => {
                        return <Link to={`/ocds/buyer/${r.buyer_id}`}>
                            {r.buyer_name}
                            <br/>
                            <small>{r.buyer_id}</small>
                        </Link>
                    },
                    sorter: (a, b) => (a.buyer_name || '').localeCompare(b.buyer_name),
                }, {
                    key: 'item_adjudicado',
                    title: 'Item',
                    dataIndex: 'item_adjudicado',
                    responsive: ['lg'],
                    render: (_, r) => {
                        return <Link to={`/ocds/items/${r.item_classification_nivel_5_id}`} target="_blank">
                            {r.item_adjudicado}
                            <br/>
                            <small>{r.item_classification_nivel_5_nombre}</small>
                            <br/>
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
                    responsive: ['lg'],
                    render: (_, r) => {
                        return <>
                            {formatMoney(r.precio_unitario)}
                            <br/>
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
                    sortOrder: 'descend',
                    responsive: ['lg'],
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
                    responsive: ['lg'],
                    render: (i) => formatMoney(i)
                }]}/>
            <List
                className="show-responsive"
                grid={{
                    gutter: 8,
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
                renderItem={(r: OCDSItemsAwardedCOVID19) =>
                    <List.Item className="list-item">
                        <Card bordered={false} style={{padding: 2}}>
                            <Link to={`/ocds/items/${r.item_classification_nivel_5_id}`}>
                                {r.item_adjudicado}
                                <br/>
                                <small>{r.item_classification_nivel_5_nombre}</small>
                                <br/>
                                <small>{(r.item_classification_nivel_5_id || "").replace("catalogoNivel5DNCP-", "")}</small>
                            </Link>
                            <br/>
                            Precio Unitario: {formatMoney(r.precio_unitario)}
                            <small> ({r.unidad_medida})</small>
                            <br/>
                            Incremento de precio durante
                            pandemia: {formatMoney(r.porcentaje_mayor_precio_antes_pandemia)}%
                            <br/>
                            Cantidad: {formatMoney(r.cantidad)}
                        </Card>
                    </List.Item>
                }
            >
            </List>
        </PageHeader>
    </BaseDatosPage>
}

export function getTenderLink(slug: string, method: string): string {
    return method === 'direct'
        ? 'https://contrataciones.gov.py/sin-difusion-convocatoria/' + slug + '.html'
        : 'https://contrataciones.gov.py/licitaciones/convocatoria/' + slug + '.html'
}
