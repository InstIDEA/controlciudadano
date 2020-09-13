import {Table} from "antd";
import * as React from "react";
import {ColumnProps} from 'antd/es/table/Column';

export function GenericTable({data, title, columns}: {
    data: unknown[],
    title?: string,
    columns?: {
        [k: string]: ColumnProps<any>
    }
}) {

    if (!Array.isArray(data)) {
        return <div>Los datos no son una lista</div>
    }

    const hasData = data.length > 0;

    const finalColumns: ColumnProps<any>[] = hasData
        ? Object.keys(data[0])
            .map(key => {
                if (columns && columns[key]) return columns[key];
                return {
                    title: key,
                    dataIndex: key
                }
            })
        : [];

    return <>
        <Table dataSource={data}
               rowKey={hasData && finalColumns[0].dataIndex ? `${finalColumns[0].dataIndex}` : 'id'}
               title={() => title}
               showHeader={hasData}
               size="small"
               pagination={{
                   pageSize: 5
               }}
               footer={undefined}
               locale={{
                   // emptyText: "Sin resultados"
               }}
               scroll={hasData ? {x: '80vw'} : undefined}
               columns={finalColumns}/>
    </>
}
