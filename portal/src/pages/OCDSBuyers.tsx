import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader, Table, Typography, List, Card } from 'antd';
import { OCDSBuyerWithAmount } from '../Model';
import { Link, useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { formatMoney } from '../formatters';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchBar } from '../components/SearchBar';

export function OCDSBuyersPage() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<OCDSBuyerWithAmount[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');
    const isExploreMenu = history.location.pathname.includes('explore');

    useEffect(() => {
        setWorking(true);
        new RedashAPI()
            .getBuyers()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false))
            ;
    }, []);


    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'buyer',
    ]), [data, query]);

    return <BaseDatosPage
        menuIndex="buyers" sidebar={isExploreMenu} headerExtra={
            <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
        }>
        <PageHeader ghost={false}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            onBack={() => history.push('/')}
            backIcon={null}
            title="Entidades gubernamentales"
            subTitle="CDS - IDEA">


            <Typography.Paragraph>
                Listado de las entidades que han realizado licitaciones durante la pandemia
        </Typography.Paragraph>

            <Table<OCDSBuyerWithAmount> dataSource={filtered}
                className="hide-responsive"
                loading={working}
                rowKey="ocid"
                size="small"
                pagination={{
                    defaultCurrent: 1,
                    defaultPageSize: 10
                }}
                columns={[{
                    dataIndex: 'name',
                    title: 'Nombre',
                    sorter: (a, b) => (a.buyer || '').localeCompare(b.buyer),
                    render: (_, r) => <Link to={`/ocds/buyer/${r.buyer_id}?onlyCovid=1`}>{r.buyer}</Link>,
                }, {
                    title: 'Total adjudicado',
                    dataIndex: 'awarded_amount',
                    defaultSortOrder: 'descend',
                    align: 'right',
                    render: (_, r) => formatMoney(r.awarded_amount, 'PYG'),
                    sorter: (a, b) => a.awarded_amount - b.awarded_amount,
                }, {
                    title: 'Cantidad de adjudicaciones',
                    align: 'right',
                    render: (_, r) => formatMoney(r.total_awards),
                    sorter: (a, b) => a.total_awards - b.total_awards,
                }, {
                    title: 'Cantidad de proveedores diferentes',
                    align: 'right',
                    render: (_, r) => formatMoney(r.different_suppliers),
                    sorter: (a, b) => a.different_suppliers - b.different_suppliers,
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
                    renderItem={(r: OCDSBuyerWithAmount) =>
                        <List.Item className="list-item">
                            <Card bordered={false}>
                                Nombre: <Link to={`/ocds/buyer/${r.buyer_id}?onlyCovid=1`}>{r.buyer}</Link>
                                <br />
                                Total adjudicado: {formatMoney(r.awarded_amount, 'PYG')}
                                <br />
                                Cantidad de adjudicaciones: { formatMoney(r.total_awards)}
                                <br />
                                Cantidad de proveedores diferentes: { formatMoney(r.different_suppliers)}
                                <br />
                            </Card>
                        </List.Item>
                    }
                >
                </List>
        </PageHeader>
    </BaseDatosPage>
}
