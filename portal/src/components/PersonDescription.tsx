import {Descriptions} from 'antd';
import * as React from 'react';

export function PersonDescription(props: {
    data: {
        name: string;
        document: string;
        found: boolean;
        birthDate: string;
    }, columns: number
}) {

    const {data, columns} = props;

    return <Descriptions column={columns} size="small">
        <Descriptions.Item label="Nombre">{data.name}</Descriptions.Item>
        <Descriptions.Item label="Documento">{data.document}</Descriptions.Item>
        <Descriptions.Item label="Fecha nacimiento">{data.birthDate}</Descriptions.Item>
    </Descriptions>
}
