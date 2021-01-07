import * as React from 'react';
import {useState} from 'react';
import {Button, Modal, Typography} from 'antd';
import {ResponsiveWrapper} from '@nivo/core';
import './CardPopup.css';
import {ExpandAltOutlined} from '@ant-design/icons';

/**
 * A component that display a card with actions.
 *
 * This component will always use the 100% of the width.
 */
export function CardPopup(props: {
    title: string;
    cardHeight: number;

    component: (props: {
        inPopup: boolean;
        width: number;
        height: number;
        requestModal?: () => void;
    }) => React.ReactElement
}) {

    const [modal, setModal] = useState(false);
    const finalHeight = props.cardHeight || 200;
    const graphHeight = props.title ? finalHeight - 50 : finalHeight;
    const Comp = props.component;

    return <div style={{height: finalHeight}} className="cp-card card-popup">
        <div className="cp-title-bar">
            <span/>
            <Typography.Title level={5} className="cp-title">{props.title || ""}</Typography.Title>
            <ExpandAltOutlined onClick={() => setModal(true)}/>
        </div>

        <div style={{height: graphHeight, width: '100%'}}>
            <ResponsiveWrapper>
                {({width, height}) => <Comp inPopup={false} width={width} height={height}
                                            requestModal={() => setModal(true)}/>}
            </ResponsiveWrapper>
        </div>

        <Modal title={props.title}
               visible={modal}
               onCancel={() => setModal(false)}
               footer={[
                   <Button key="back" onClick={() => setModal(false)}>
                       Volver
                   </Button>,
               ]}
        >
            <div style={{
                width: '100%',
                height: 500
            }}>
                <ResponsiveWrapper>
                    {(props) => <Comp inPopup={true} {...props}/>}
                </ResponsiveWrapper>
            </div>

        </Modal>
    </div>

}
