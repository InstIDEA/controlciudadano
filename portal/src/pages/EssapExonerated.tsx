import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {EssapExonerated} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {Input, PageHeader, Table, Typography} from 'antd';

export function EssapExoneratedList() {

    const [query, setQuery] = useState('');
    const [working, setWorking] = useState(false);
    const [data, setData] = useState<EssapExonerated[]>();
    const history = useHistory();

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

    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="COVID - Facturas exoneradas de la Essap"
                       extra={[
                           <Link to="/sources?query=essap_exonerados">
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
            Todas las facturas que fueron exoneradas por la Essap en el marco de ayuda por el COVID.
        </Typography.Paragraph>

        <Table<EssapExonerated>
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
            }]}/>
    </PageHeader>

}
