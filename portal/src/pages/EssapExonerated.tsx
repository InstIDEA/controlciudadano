import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { filterRedashList, RedashAPI } from '../RedashAPI';
import { EssapExonerated } from '../Model';
import { Link, useHistory } from 'react-router-dom';
import { PageHeader, Table, Typography, List, Card } from 'antd';
import { BaseDatosPage } from '../components/BaseDatosPage';
import { SearchBar } from '../components/SearchBar'

export function EssapExoneratedList() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<EssapExonerated[]>();
    const history = useHistory();
    const isExploreMenu = history.location.pathname.includes('explore');

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getEssapExonerated()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false));
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'ciudad',
        'zona',
        'catastro',
    ]), [data, query]);

    return <>
        <BaseDatosPage menuIndex="essap" sidebar={isExploreMenu} headerExtra={
            <div className="header-search-wrapper">
                <SearchBar defaultValue={query} onSearch={setQuery}/>
            </div>
        }>
            <PageHeader ghost={false}
                style={{ border: '1px solid rgb(235, 237, 240)' }}
                onBack={() => history.push('/')}
                backIcon={null}
                title="COVID - Facturas exoneradas de la Essap"
                extra={[
                    <Link to="/sources?query=essap_exonerados">
                        Fuente
                           </Link>
                ]}>

                <Typography.Paragraph>
                    Todas las facturas que fueron exoneradas por la Essap en el marco de ayuda por el COVID.
                </Typography.Paragraph>

                <Table<EssapExonerated>
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
                        dataIndex: 'ciudad',
                        title: 'Ciudad',
                        sorter: (a, b) => (a.ciudad || '').localeCompare(b.ciudad || ''),
                    }, {
                        dataIndex: 'zona',
                        title: 'Zona',
                    }, {
                        title: 'Catastro',
                        dataIndex: 'catastro',
                        sorter: (a, b) => (a.catastro || '').localeCompare(b.catastro || ''),
                    }, {
                        title: 'Promedio',
                        dataIndex: 'promedio',
                        align: 'right',
                        sorter: (a, b) => a.promedio - b.promedio,
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
                    renderItem={(r: EssapExonerated) =>
                        <List.Item className="list-item">
                            <Card bordered={false}>
                                Beneficiario: {r.ciudad}
                                <br />
                                Zona: {r.zona}
                                <br />
                                Catastro: {r.catastro}
                                <br />
                                Promedio: {r.promedio}
                                <br />
                            </Card>
                        </List.Item>
                    }
                >
                </List>
            </PageHeader>
        </BaseDatosPage>
    </>
}
