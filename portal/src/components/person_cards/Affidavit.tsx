import {Card, Col, Typography} from 'antd';
import Icon from '@ant-design/icons';
import {ReactComponent as Ddjj} from '../../assets/logos/ddjj.svg';
import {formatMoney} from '../../formatters';
import * as React from 'react';
import {ColProps} from 'antd/es/col';
import {Affidavit} from '../../Model';

export function AffidavitCard(props: {
    colProps: ColProps,
    affidavit: Affidavit,
    height: number
}) {

    const declaration = props.affidavit;

    return <Col {...props.colProps} >
        <Card className="data-box" title="Declaración Jurada"
              extra={<Icon component={Ddjj} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}
              actions={[
                  <a href={`${declaration.link}`} target="_blank" rel="noopener noreferrer">Ver Archivo</a>
              ]}
        >
            <Typography.Text>Año
                (Revisión): {declaration.year} ({declaration.revision}) </Typography.Text>
            <br/>
            <Typography.Text>Activos: {formatMoney(declaration.actives)} </Typography.Text>
            <br/>
            <Typography.Text>Pasivos: {formatMoney(declaration.passive)} </Typography.Text>
            <br/>
            <Typography.Text>Patrimonio
                Neto: {formatMoney(declaration.networth)} </Typography.Text>
            <br/>
        </Card>
    </Col>
}
