import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Input, PageHeader, Table, Typography } from 'antd';
import { OCDSBuyerWithAmount } from '../Model';
import { Link, useHistory } from 'react-router-dom';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { formatMoney } from '../formatters';
import { BaseDatosPage } from '../components/BaseDatosPage';

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
        menuIndex="buyers" sidebar={isExploreMenu}>
        <PageHeader ghost={false}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            onBack={() => history.push('/')}
            backIcon={null}
            title="Entidades gubernamentales"
            subTitle="CDS - IDEA"
            extra={[
                <Input.Search placeholder="Buscar"
                    key="search_input"
                    defaultValue={query}
                    onSearch={setQuery}
                    formMethod="submit" />
            ]}>


            <Typography.Paragraph>
                Listado de las entidades que han realizado licitaciones durante la pandemia
        </Typography.Paragraph>

            <Table<OCDSBuyerWithAmount> dataSource={filtered}
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
        </PageHeader>
    </BaseDatosPage>
}
