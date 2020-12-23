import * as React from 'react';
import {Spin} from 'antd';
import {LoadingOutlined} from '@ant-design/icons';

export function LoadingGraphComponent() {
    return <>
        <Spin indicator={<LoadingOutlined style={{fontSize: 30, color: 'rgb(212,98,82)'}} spin/>}
              style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '60%'
              }}
        />
    </>
}
