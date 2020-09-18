import React from 'react';
import { Row, Col, Button } from 'antd';
import './static/footer.css';
import cds from '../assets/logos/cds.png';
import usaid from '../assets/logos/usaid.png';
import ocp from '../assets/logos/ocp.png';
import reaccion from '../assets/logos/reaccion.png';
import idea from '../assets/logos/logo_idea.png';

function Footer() {
  return (
    <footer id="footer">
      <Row>
        <Col xxl={4} xl={4} lg={4} md={4} sm={4} xs={4}>
          <div id="logo" to="/">
            <img src={usaid} alt="logo" />
          </div>
        </Col>
        <Col xxl={4} xl={4} lg={4} md={4} sm={4} xs={4}>
          <div id="logo" to="/">
            <img src={ocp} alt="logo" />
          </div>
        </Col>
        <Col xxl={4} xl={4} lg={4} md={4} sm={4} xs={4}>
          <div id="logo" to="/">
            <img src={idea} alt="logo" />
          </div>
        </Col>
        <Col xxl={4} xl={4} lg={4} md={4} sm={4} xs={4}>
          <div id="logo" to="/">
            <img src={reaccion} alt="logo" />
          </div>
        </Col>
        <Col xxl={4} xl={4} lg={4} md={4} sm={4} xs={4}>
          <div id="logo" to="/">
            <img src={cds} alt="logo" />
          </div>
        </Col>
      </Row>
    </footer>
  );
}


export default Footer;
