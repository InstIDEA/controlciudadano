import { ReactNode, useState } from "react";
import React from "react";
import { Header } from "../Home/Header";
import { Row, Col } from "antd";
import { Sidebar } from "./sidebar";
import Footer from "../Home/Footer";

export function BaseDatosPage(props: {
  headerExtra?: ReactNode;
  title?: string;
  sidebar?: boolean,
  subtitle?: string;
  menuIndex: string;
  children: ReactNode;
}) {
  const [count, setCount] = useState();
  return <>
        <Header tableMode={true} searchBar={props.headerExtra}/>
<<<<<<< Updated upstream
        <Row>
            <Col xxl={4} xl={5} lg={6} md={6} sm={20} xs={20} span={4}><Sidebar menuIndex={props.menuIndex} /></Col>
            <Col span={20}>
               {props.children}
          </Col>
       </Row>
=======
        <div className="content">

          <Row style={{minHeight:"90vh"}}>
              <Col xxl={4} xl={5} lg={6} md={6} sm={20} xs={20} span={4}><Sidebar menuIndex={props.menuIndex} sidebar={props.sidebar}/></Col>
              <Col span={20}>
                {props.children}
            </Col>
        </Row>
        </div>
>>>>>>> Stashed changes
       <Footer tableMode={true}/>
  </>
}