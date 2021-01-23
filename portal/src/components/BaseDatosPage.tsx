import React, {ReactNode} from "react";
import {Header} from "./layout/Header";
import {Col, Row} from "antd";
import {Sidebar} from "./Sidebar";
import Footer from "./layout/Footer";
import './layout/Layout.css'

export function BaseDatosPage(props: {
    headerExtra?: ReactNode;
    title?: string;
    subtitle?: string;
    menuIndex: string;
    children: ReactNode;
    className?: string
}) {
    return <div className={props.className}>
        <Header tableMode={true} searchBar={props.headerExtra}/>
        <Sidebar menuIndex={props.menuIndex}>
            <Row style={{minHeight: "90vh"}}>
                <Col span={24}>
                    {props.children}
                </Col>
            </Row>
        </Sidebar>
        <Footer tableMode={true}/>
    </div>
}
