import React from 'react';
import './Disclaimer.css';
import {Col, Row} from 'antd';
import {InfoCircleTwoTone} from '@ant-design/icons';

export function DisclaimerComponent(props: {
    children: React.ReactNode,
    full?: boolean,
    card?: boolean

}) {
    let className = "disclaimer-component";
    if (props.full) className = className + " full";
    if (props.card) className = className + " as-card";

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
