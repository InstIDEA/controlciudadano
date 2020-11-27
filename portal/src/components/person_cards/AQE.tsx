import {AquienesElegimos} from '../../Model';
import {Card, Col, Space, Typography} from 'antd';
import Icon from '@ant-design/icons';
import {ReactComponent as Aqe} from '../../assets/logos/a_quienes_elegimos.svg';
import {AQE_URL, ESTADOS_CIVILES, PAISES_NACIMIENTO} from '../../AQuienElegimosData';
import * as React from 'react';
import {ColProps} from 'antd/es/col';
import {LVRow} from "../../pages/PersonDetailPage";

export function AQECard(props: {
    colProps: ColProps,
    person: AquienesElegimos
}) {

    const person = props.person;

    return <Col {...props.colProps}>
        <Card className="data-box" title={<a href={AQE_URL}>aquieneselegimos.org.py</a>}
              extra={<Icon component={Aqe} className="icon-card"/>}
              actions={[
                  person.tw ? <Typography.Text><a href={person.tw}>Twitter</a> </Typography.Text> : null,
                  person.fb ? <Typography.Text><a href={person.fb}>Facebook</a> </Typography.Text> : null,
                  person.insta ? <Typography.Text><a href={person.insta}>Instagram</a> </Typography.Text> : null,
                  <a href={`${AQE_URL}/detalle-persona/${person.id}`} target="_blank" rel="noopener noreferrer">Más info</a>
              ]}
        ><Space direction="vertical">
            {person.date_of_death && person.date_of_death.length > 1 ? <LVRow label={"Fecha de muerte"} value={person.date_of_death} /> : ''}
            {person.national_identity ? <LVRow label={"País de nacimiento"} value={PAISES_NACIMIENTO[person.national_identity]} /> : ''}
            {person.city_of_residence ? <LVRow label={"Ciudad de residencia"} value={person.city_of_residence} /> : ''}
            {person.estado_civil ? <LVRow label={"Estado civil"} value={ESTADOS_CIVILES[person.estado_civil]} /> : ''}
            {person.decendents ? <LVRow label={"Cantidad de hijos"} value={person.decendents} /> : ''}
            {person.email_address ? <LVRow label={"Email"} value={person.email_address} /> : '' }
            {person.phone ? <LVRow label={"Teléfono de contacto"} value={person.phone} /> : ''}
            {person.contact_detail ? <LVRow label={"Teléfono celular"} value={person.contact_detail} /> : ''}
        </Space>
        </Card>
    </Col>
}


