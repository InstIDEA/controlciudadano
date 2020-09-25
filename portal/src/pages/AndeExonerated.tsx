import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {AndeExonerated} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {Input, PageHeader, Table, Typography} from 'antd';
import { BaseDatosPage } from '../components/BaseDatosPage';

export function AndeExoneratedList() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<AndeExonerated[]>();
    const history = useHistory();
    const isExploreMenu = history.location.pathname.includes('explore');

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getAndeExonerated()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false));
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'agencia',
        'nis',
        'cliente',
        'documento',
    ]), [data, query]);

    return <>
    <BaseDatosPage menuIndex="ande" sidebar={isExploreMenu}>
    <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="COVID - Facturas exoneradas de la ANDE"
                       extra={[
                           <Link to="/sources?query=ande_exonerados">
                               Fuente
                           </Link>,
                           <Input.Search placeholder="Buscar"
                                         style={{width: '80%'}}
                                         key="search_input"
                                         defaultValue={query}
                                         onSearch={setQuery}
                                         formMethod="submit"/>
                       ]}>

        <Typography.Paragraph>
            Todas las facturas que fueron exoneradas por la ANDE en el marco de ayuda por el COVID.
        </Typography.Paragraph>

        <Table<AndeExonerated>
            dataSource={filtered}
            loading={working}
            rowKey="id"
            size="small"
            pagination={{
                defaultPageSize: 10,
                defaultCurrent: 1
            }}
            columns={[{
                key: 'cliente',
                title: 'Beneficiario',
                render: (_, r) => {
                    return <Link to={`/people/${r.documento}`}
                                 rel="noopener noreferrer"
                                 target="_blank">
                        {r.cliente}
                        <br/>
                        {r.documento}
                    </Link>
                }
            }, {
                dataIndex: 'nis',
                title: 'NIS',
            }, {
                title: 'Tipo de tarifa',
                dataIndex: 'tarifa',
                sorter: (a, b) => a.tarifa - b.tarifa,
            }, {
                title: 'Fecha de exoneración',
                dataIndex: 'fecha_exoneracion',
                sorter: (a, b) => (a.fecha_exoneracion || '').localeCompare(b.fecha_exoneracion),
            }]}/>
    </PageHeader>
    </BaseDatosPage>
    </>
}
