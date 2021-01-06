import React from 'react';
import './Disclaimer.css';
import {Col, Row} from 'antd';
import {InfoCircleTwoTone} from '@ant-design/icons';

export function DisclaimerComponent(props: {
    children: React.ReactNode,
    full?: boolean
}) {
    const className = props.full ? "disclaimer-component full" : "disclaimer-component "
    return <Row className={className}
                align="middle"
                justify="space-around">
        <Col xs={24} md={2} xl={1} style={{textAlign: 'center'}}>
            <InfoCircleTwoTone style={{fontSize: 28}}/>
        </Col>
        <Col xs={24} md={22}>
            {props.children}
        </Col>
    </Row>
}
