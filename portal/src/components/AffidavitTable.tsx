import {Table} from 'antd';
import {Affidavit} from '../Model';
import {formatMoney} from '../formatters';
import * as React from 'react';
import {FilePdfOutlined, ShareAltOutlined} from '@ant-design/icons';

export function AffidavitTable(props: {
    data: Affidavit[],
    working: boolean
}) {
    const {data, working} = props;
    return <Table<Affidavit> dataSource={data}
                             loading={working}
                             rowKey="link"
                             size="small"
                             pagination={{
                                 defaultCurrent: 1,
                                 defaultPageSize: 10
                             }}
                             columns={[{
                                 dataIndex: 'year',
                                 title: 'Año (revision)',
                                 render: (_, row) => `${row.year} (${row.revision})`,
                                 sorter: (a, b) => `${a.year}${a.revision}`.localeCompare(`${b.year}${b.revision}`)
                             }, {
                                 dataIndex: 'actives',
                                 title: 'Activos',
                                 align: 'right',
                                 render: (nw) => nw === undefined || nw === null
                                     ? <span>Ayudanos a completar!</span>
                                     : formatMoney(nw),
                                 sorter: (a, b) => (a.actives || 0) - (b.actives || 0)
                             }, {
                                 dataIndex: 'passive',
                                 title: 'Pasivos',
                                 align: 'right',
                                 render: (nw) => nw === undefined || nw === null
                                     ? <span>Ayudanos a completar!</span>
                                     : formatMoney(nw),
                                 sorter: (a, b) => (a.passive || 0) - (b.passive || 0)
                             }, {
                                 dataIndex: 'networth',
                                 title: 'Patrimonio neto',
                                 align: 'right',
                                 render: (nw) => nw === undefined || nw === null
                                     ? <span>Ayudanos a completar!</span>
                                     : formatMoney(nw),
                                 sorter: (a, b) => (a.networth || 0) - (b.networth || 0)
                             }, {
                                 dataIndex: '',
                                 title: 'Links',
                                 render: (_, row) => <div style={{fontSize: '1.5em'}}>
                                     <a href={row.linksandwich || row.link} target="_blank" rel="noopener noreferrer"
                                        title="Ver">
                                         <FilePdfOutlined/>
                                     </a>
                                     <a href={row.source} target="_blank" rel="noopener noreferrer" title="Fuente">
                                         <ShareAltOutlined/>
                                     </a>
                                 </div>
                             }]}/>
}
