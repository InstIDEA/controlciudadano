import { ReactNode } from "react";
import React from "react";
import { Header } from "./layout/Header";
import { Row, Col } from "antd";
import { Sidebar } from "./Sidebar";
import Footer from "./layout/Footer";
import './layout/Layout.css'

export function BaseDatosPage(props: {
  headerExtra?: boolean;
  title?: string;
  subtitle?: string;
  menuIndex: string;
  children: ReactNode;
}) {

  return <>
        <Header tableMode={true} searchBar={props.headerExtra}/>
        <div className="content">

          <Row style={{minHeight:"90vh"}}>
              <Col xxl={4} xl={5} lg={6} md={6} sm={20} xs={20} span={4}><Sidebar menuIndex={props.menuIndex} /></Col>
              <Col span={20}>
                {props.children}
            </Col>
        </Row>
        </div>
       <Footer tableMode={true}/>
  </>
}