import {AquienesElegimos} from '../../Model';
import {Card, Col, Typography} from 'antd';
import Icon from '@ant-design/icons';
import {ReactComponent as Aqe} from '../../assets/logos/a_quienes_elegimos.svg';
import {AQE_URL, ESTADOS_CIVILES, PAISES_NACIMIENTO} from '../../AQuienElegimosData';
import * as React from 'react';
import {ColProps} from 'antd/es/col';


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
                  <a href={`${AQE_URL}/detalle-persona/${person.id}`} target="_blank" rel="noopener noreferrer">Mas info</a>
              ]}
        >
            {person.date_of_death && person.date_of_death.length > 1 ?
                <Typography.Text>Fecha de muerte: {person.date_of_death}
                    <br/> </Typography.Text> : ''}
            {person.national_identity ? <Typography.Text>País de
                nacimiento: {PAISES_NACIMIENTO[person.national_identity]}
                <br/> </Typography.Text> : ''}
            {person.city_of_residence ? <Typography.Text>Ciudad de
                residencia: {person.city_of_residence} <br/>
            </Typography.Text> : ''}
            {person.estado_civil ? <Typography.Text>Estado
                civil: {ESTADOS_CIVILES[person.estado_civil]} <br/>
            </Typography.Text> : ''}
            {person.decendents ?
                <Typography.Text>Cantidad de hijos: {person.decendents}
                    <br/> </Typography.Text> : ''}
            {person.email_address ?
                <Typography.Text>Email: {person.email_address} <br/>
                </Typography.Text> : ''}
            {person.phone ? <Typography.Text>Teléfono de contacto: {person.phone} <br/> </Typography.Text> : ''}
            {person.contact_detail ?
                <Typography.Text>Teléfono celular: {person.contact_detail} <br/> </Typography.Text> : ''}
        </Card>
    </Col>
}
