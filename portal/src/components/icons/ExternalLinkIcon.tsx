import React from 'react';
import {ReactComponent as Icon} from '../../assets/icons/external-link.svg';

const defaultProps = {
    color: '#1890ff' as ('white' | 'color'),
    alt: 'Recurso externo',
    width: 15
};

type ExternalLinkIconProps = typeof defaultProps;

export function ExternalLinkIcon(props: ExternalLinkIconProps) {

    return <Icon fill={props.color} style={{
        width: props.width
    }}/>
}

ExternalLinkIcon.defaultProps = defaultProps;
