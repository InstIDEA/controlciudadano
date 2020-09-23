import { ReactNode } from "react";
import React from "react";
import { Header } from "../Home/Header";
import { Row, Col } from "antd";
import { Sidebar } from "./sidebar";
import Footer from "../Home/Footer";

export function BaseDatosPage(props: {
  headerExtra?: boolean;
  title?: string;
  subtitle?: string;
  menuIndex: string;
  children: ReactNode;
}) {

  return <>
        <Header tableMode={true} searchBar={props.headerExtra}/>
        <Row>
            <Col xxl={4} xl={5} lg={6} md={6} sm={20} xs={20} span={4}><Sidebar menuIndex={props.menuIndex} /></Col>
            <Col span={20}>
               {props.children}
          </Col>
       </Row>
       <Footer tableMode={true}/>
  </>
}