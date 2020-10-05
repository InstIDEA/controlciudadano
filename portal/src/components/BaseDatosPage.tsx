import { ReactNode } from "react";
import React from "react";
import { Header } from "./layout/Header";
import { Row, Col } from "antd";
import { Sidebar } from "./Sidebar";
import Footer from "./layout/Footer";
import './layout/Layout.css'

export function BaseDatosPage(props: {
  headerExtra?: ReactNode;
  title?: string;
  sidebar?: boolean,
  subtitle?: string;
  menuIndex: string;
  children: ReactNode;
}) {
  return <>
        <Header tableMode={true} searchBar={props.headerExtra}/>
        <Sidebar menuIndex={props.menuIndex} sidebar={props.sidebar}>
           <Row style={{minHeight:"90vh"}}>
              <Col span={24}>
                {props.children}
            </Col>
        </Row>
        </Sidebar>
      <Footer tableMode={true}/>
  </>
}