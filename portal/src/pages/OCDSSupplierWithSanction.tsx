import React, { useEffect, useMemo, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { OCDSSupplierSanctions, OCDSSupplierWithSanction } from '../Model';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { message, PageHeader, Space, Table, Tooltip, Typography, List, Card } from 'antd';
import { formatIsoDate, formatMoney } from '../formatters';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchBar } from '../components/SearchBar';

export function OCDSSupplierWithSanctionPage() {

    const history = useHistory();
    const [data, setData] = useState<OCDSSupplierWithSanction[]>();
    const [working, setWorking] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        setWorking(false)
        new RedashAPI().getSupplierCOVIDWithSanctions()
            .then(d => setData(d.query_result.data.rows))
            .catch(e => {
                console.warn(e);
                message.warn("Can't fetch suppliers");
            })
            .finally(() => setWorking(false))
            ;
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'supplier_id',
        'supplier_name',
    ]), [data, query]);

    return <BaseDatosPage
        menuIndex="sanctionedSuppliers" headerExtra={
            <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
        }>
        <PageHeader ghost={false}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            onBack={() => history.push('/')}
            backIcon={null}
            title="¿A quiénes se compró?"
            subTitle="">


            <Typography.Paragraph>
                Ránking de proveedores por monto total adjudicado durante la pandemia
            </Typography.Paragraph>

            <Table<OCDSSupplierWithSanction>
                className="hide-responsive"
                dataSource={filtered}
                loading={working}
                rowKey="supplier_id"
                size="small"
                pagination={{
                    defaultCurrent: 1,
                    defaultPageSize: 10
                }}
                columns={[{
                    dataIndex: 'supplier_name',
                    title: 'Proveedor',
                    align: 'left',
                    render: (_, r) => <Link to={`/ocds/suppliers/${r.supplier_id}?onlyCovid=1`}>{r.supplier_name}</Link>,
                    sorter: (a, b) => (a.supplier_name || '').localeCompare(b.supplier_name)
                }, {
                    dataIndex: 'sanctions',
                    align: 'right',
                    title: 'Sanciones',
                    render: (_, r) => <SanctionComponent data={r.sanctions} />
                }, {
                    dataIndex: 'awarded_amount',
                    align: 'right',
                    title: 'Monto total adjudicado',
                    defaultSortOrder: 'descend',
                    render: (_, r) => formatMoney(r.awarded_amount, 'PYG'),
                    sorter: (a, b) => a.awarded_amount - b.awarded_amount,
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
                    renderItem={(r: OCDSSupplierWithSanction) =>
                        <List.Item className="list-item">
                            <Card bordered={false}>
                                Proveedor: <Link to={`/ocds/suppliers/${r.supplier_id}?onlyCovid=1`}>{r.supplier_name}</Link>
                                <br />
                                Sanciones: <SanctionComponent data={r.sanctions} />
                                <br />
                                Monto total adjudicado: { formatMoney(r.awarded_amount, 'PYG')}
                                <br />
                            </Card>
                        </List.Item>
                    }
                >
                </List>
        </PageHeader>
    </BaseDatosPage>
}

export function SanctionComponent({ data }: {
    data: OCDSSupplierSanctions[]
}) {
    if (!data
        || !data.length
        || data[0].type === null) {
        return <span />
    }

    const keys: string[] = [];

    const finalData = data.filter(k => {
        const key = k.details.sanctions.filter(s => s.id).join(",")
        if (keys.includes(key)) {
            return false;
        }
        keys.push(key);
        return true;
    })

    return <Space direction="vertical">
        {finalData.map(sanction => {

            const body = <Space direction="vertical">
                {sanction.details.sanctions
                    .filter(s => s.status === 'Activo')
                    .map(s => s.period.endDate
                        ? `${s.description} desde el ${formatIsoDate(s.period.startDate)} al ${formatIsoDate(s.period.endDate)}`
                        : `${s.description} desde el ${formatIsoDate(s.period.startDate)}`
                    )
                    .map(d => <span key={d}>{d}</span>)}
            </Space>;

            const title = <div>
                {sanction.type} en {sanction.details.activityTypes.split(";").join(", ")}
                {sanction.details.products && <React.Fragment>
                    <br /><b>Productos:</b>
                    <ul>{sanction.details.products.map(p => <li key={p.id}>{p.name}</li>)}</ul>
                </React.Fragment>}
            </div>;

            return <Tooltip placement="top" title={title} key={sanction.type!}>{body}</Tooltip>
        })}
    </Space>
}
