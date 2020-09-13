import {SFPRow} from '../SFPHelper';
import {Table} from 'antd';
import {formatMoney} from '../formatters';
import * as React from 'react';


export function SFPTable(props: {
    data: SFPRow[];
    showPersonalDetails: boolean;
    working: boolean;
}) {

    const {data, working} = props;
    return <Table<SFPRow> dataSource={data}
                          loading={working}
                          rowKey={r => `${r.anho} ${r.mes}`}
                          size="small"
                          pagination={{
                              defaultCurrent: 1,
                              defaultPageSize: 10
                          }}
                          columns={[{
                              dataIndex: 'anho',
                              title: 'Año',
                              defaultSortOrder: 'descend',
                              sorter: (a, b) => (a.anho || 0) - (b.anho || 0)
                          }, {
                              dataIndex: 'mes',
                              title: 'Mes',
                              sorter: (a, b) => (a.mes || 0) - (b.mes || 0)
                          }, {
                              dataIndex: 'anhoIngreso',
                              title: 'Año ingreso',
                              align: 'right',
                              render: (nw) => nw === undefined || nw === null
                                  ? <span>Ayudanos a completar!</span>
                                  : formatMoney(nw),
                              sorter: (a, b) => (a.anhoIngreso || 0) - (b.anhoIngreso || 0)
                          }, {
                              dataIndex: 'funcion',
                              title: 'Cargo',
                              align: 'right'
                          }, {
                              dataIndex: 'presupuestado',
                              title: 'Presupuestado',
                              align: 'right',
                              render: (p) => formatMoney(p),
                              sorter: (a, b) => (a.presupuestado || 0) - (b.presupuestado || 0)
                          },{
                              dataIndex: 'devengado',
                              title: 'Devengado',
                              align: 'right',
                              render: (p) => formatMoney(p),
                              sorter: (a, b) => (a.devengado || 0) - (b.devengado || 0)
                          }, {
                              dataIndex: 'descripcionOee',
                              title: 'Trabaja para'
                          }]}/>
}
