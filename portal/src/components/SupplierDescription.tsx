import {Descriptions} from 'antd';
import * as React from 'react';
import {Supplier} from '../Model';

export function SupplierDescription(props: { data: Supplier, columns: number }) {

    const {data, columns} = props;

    return <Descriptions column={columns} size="small">
        <Descriptions.Item label="Nombre">{data.name}</Descriptions.Item>
        <Descriptions.Item label="RUC">{data.ruc}</Descriptions.Item>
        <Descriptions.Item label="Dirección">{data.address}</Descriptions.Item>
        <Descriptions.Item label="Ciudad">{data.city}</Descriptions.Item>
        <Descriptions.Item label="Departamento">{data.department}</Descriptions.Item>
        <Descriptions.Item label="País">{data.country}</Descriptions.Item>
        <Descriptions.Item label="Contacto">{data.contact_point}</Descriptions.Item>
        <Descriptions.Item label="Teléfono">{data.telephone}</Descriptions.Item>
    </Descriptions>
}
