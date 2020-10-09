import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Input, PageHeader, Table, Typography, List, Card } from 'antd';
import { OCDSItemRankingListRow } from '../Model';
import { formatMoney } from '../formatters';
import { Link, useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchOutlined } from '@ant-design/icons'

export function OCDSItemsRankingPage() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<OCDSItemRankingListRow[]>();
    const history = useHistory();
    const isExploreMenu = history.location.pathname.includes('explore');

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getItemRanking()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false))
            ;
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'item_classification_nivel_5_id',
        'item_classification_nivel_5_nombre',
        'moneda',
        'presentacion',
        'unidad_medida'
    ]), [data, query]);

    return <BaseDatosPage
        menuIndex="itemsRanking" sidebar={isExploreMenu} headerExtra={
            <div className="header-search-wrapper">
                <Input.Search
                    prefix={<SearchOutlined />}
                    suffix={null}
                    placeholder="Buscar"
                    key="search_input"
                    defaultValue={query}
                    onSearch={setQuery}
                    style={{ width: 200 }}
                    formMethod="submit" />
            </div>
        }>
        <PageHeader ghost={false}
            onBack={() => history.push('/')}
            backIcon={null}
            title="Contrataciones - COVID - Ranking de items adquiridos durante la pandemia"
            className="page-header"
        >

            <Typography.Paragraph>
                Ranking de ítems que fueron adjudicados en procesos de licitación marcados con COVID-19,
                agrupados por moneda, presentación y unidad de medida.
        </Typography.Paragraph>

            <Table<OCDSItemRankingListRow>
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
                    key: 'item_classification_nivel_5_id',
                    title: 'Item',
                    render: (_, r) => {
                        return <Link to={`/ocds/items/${r.item_classification_nivel_5_id}`}
                            rel="noopener noreferrer"
                            target="_blank">
                            {r.item_classification_nivel_5_nombre}
                            <br />
                            {r.item_classification_nivel_5_id}
                        </Link>
                    }
                }, {
                    dataIndex: 'moneda',
                    title: 'Moneda',
                    sorter: (a, b) => (a.moneda || '').localeCompare(b.moneda),
                }, {
                    title: 'Unidad de medida',
                    dataIndex: 'unidad_medida',
                    sorter: (a, b) => (a.unidad_medida || '').localeCompare(b.unidad_medida),
                }, {
                    title: 'Presentacion',
                    dataIndex: 'presentacion',
                    sorter: (a, b) => (a.presentacion || '').localeCompare(b.presentacion),
                }, {
                    dataIndex: 'cantidad_total',
                    align: 'right',
                    title: 'Cantidad',
                    render: (i) => formatMoney(i),
                    sorter: (a, b) => a.cantidad_total - b.cantidad_total,
                }, {
                    dataIndex: 'monto_promedio',
                    align: 'right',
                    title: 'Monto promedio',
                    render: (_, r) => formatMoney(r.monto_promedio, r.moneda),
                    sorter: (a, b) => a.monto_promedio - b.monto_promedio,
                }, {
                    dataIndex: 'monto_total',
                    align: 'right',
                    title: 'Monto total',
                    defaultSortOrder: 'descend',
                    render: (_, r) => formatMoney(r.monto_total, r.moneda),
                    sorter: (a, b) => a.monto_total - b.monto_total,
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
                renderItem={(r: OCDSItemRankingListRow) =>
                    <List.Item className="list-item">
                        <Card bordered={false}>
                            Item:  <Link to={`/ocds/items/${r.item_classification_nivel_5_id}`}
                                rel="noopener noreferrer"
                                target="_blank">
                                {r.item_classification_nivel_5_nombre}
                                <br />
                                {r.item_classification_nivel_5_id}
                            </Link>

                            <br />
                            Moneda: {r.moneda}
                            <br />
                            Unidad de medida: {r.unidad_medida}
                            <br />
                            Presentación:  {r.presentacion}
                            <br />
                            Cantidad total:  {formatMoney(r.cantidad_total)}
                            <br />
                            Monto promedio:  {formatMoney(r.monto_promedio)}
                            <br />
                            Monto total:  {formatMoney(r.monto_total)}
                            <br />
                        </Card>
                    </List.Item>
                }
            >
            </List>
        </PageHeader>
    </BaseDatosPage>

}

