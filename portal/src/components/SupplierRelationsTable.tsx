import {OCDSSupplierRelation} from '../Model';
import * as React from 'react';
import {Table} from 'antd';
import {ColumnProps} from 'antd/es/table';
import {RELATIONS_NAMES} from '../Constants';
import {Link} from 'react-router-dom';

export function SupplierRelationsTable(props: {
    data: OCDSSupplierRelation[];
    showOrigin?: boolean;
}) {

    const {data, showOrigin} = props;


    const columns = React.useMemo(() => getColumns(showOrigin), [showOrigin]);

    return <Table<OCDSSupplierRelation>
        columns={columns}
        dataSource={data}
        rowKey={r => `${r.p1ruc}${r.p2ruc}${r.relation}`}
    />


}

function getColumns(showOrigin: boolean = true): ColumnProps<OCDSSupplierRelation>[] {
    const columns: ColumnProps<OCDSSupplierRelation>[] = [{
        key: 'p1ruc',
        dataIndex: 'p1ruc',
        title: 'Proveedor 1',
        render: (_, r) => <Link to={`/ocds/suppliers/${r.p1ruc}`}
                                target="__blank">{r.p1name} ({r.p1ruc})</Link>
    }, {
        key: 'p2ruc',
        dataIndex: 'p2ruc',
        title: 'Proveedor 2',
        render: (_, r) => <Link to={`/ocds/suppliers/${r.p2ruc}`}
                                target="__blank">{r.p2name} ({r.p2ruc})</Link>
    }, {
        key: 'relation',
        dataIndex: 'relation',
        title: 'Tipo de relación',
        render: (k: string) => RELATIONS_NAMES[k]
    }, {
        key: 'data',
        dataIndex: 'data',
        title: 'Motivo de relación'
    }]

    if (showOrigin) return columns;
    else return columns.filter(c => c.key !== 'p1ruc');
}
