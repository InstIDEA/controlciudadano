import React from 'react';
import { Row, Col, Typography } from 'antd';
import './Footer.css';
import cds from '../../assets/logos/cds.png';
import cdsBlanco from '../../assets/logos/cds_blanco.png';
import usaid from '../../assets/logos/usaid.png';
import ocp from '../../assets/logos/ocp.png';
import reaccion from '../../assets/logos/reaccion_fondo.png';
import idea from '../../assets/logos/logo_idea.png';
import cc from '../../assets/logos/cc.png';
import github from '../../assets/logos/github.svg';


function Footer(props: {
  tableMode?: boolean
  aboutFooter?: boolean
}) {
  return (
    <footer id="footer">
      <Row className={props.tableMode ? "footer-background-secondary" : ""}>
        <Col offset={props.aboutFooter ? 6 : 0} 
        xxl={props.aboutFooter ? 12 : 8} xl={props.aboutFooter ? 12 : 8}
        lg={props.aboutFooter ? 12 : 8} md={props.aboutFooter ? 12 : 8} sm={12} xs={12}>
          <span className="footer-label">Es una iniciativa de:</span>
          <div id="logo">
            <img src={idea} alt="logo" />
            <img src={usaid} alt="logo" />
          </div>
        </Col>
        <Col offset={props.aboutFooter ? 6 : 0} 
        xxl={props.aboutFooter ? 12 : 8} xl={props.aboutFooter ? 12 : 8}
        lg={props.aboutFooter ? 12 : 8} md={props.aboutFooter ? 12 : 8} sm={12} xs={12}>
          <span className="footer-label">Impulsores del proyecto:</span>
          <div id="logo">
            <img src={idea} alt="logo" />
            <img src={reaccion} alt="logo" />
            <img src={cds} alt="logo" />
          </div>
        </Col>
        <Col offset={props.aboutFooter ? 6 : 0} 
        xxl={props.aboutFooter ? 12 : 8} xl={props.aboutFooter ? 12 : 8}
        lg={props.aboutFooter ? 12 : 8} md={props.aboutFooter ? 12 : 8} sm={12} xs={12}>
          <span className="footer-label">Herramientas de IA con apoyo de:</span>
          <div id="logo">
            <img src={ocp} alt="logo" />
          </div>
        </Col>
      </Row>
      <Row className="footer-background">
        <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
          <Typography.Paragraph className="footer-paragraph">
            Este sitio web fue posible gracias al generoso apoyo del pueblo de los Estados Unidos de América a través
            de la Agencia de los Estados Unidos para el Desarrollo Internacional (USAID). El contenido de este sitio
            web es responsabilidad de sus autores y no refleja necesariamente las opiniones o posiciones de la Agencia de los Estados Unidos para el Desarrollo Internacional o del Gobierno de los Estados Unidos.

        </Typography.Paragraph>

        </Col>
      </Row>
      <Row className="footer-background">
        <Col xxl={4} xl={4} lg={4} md={4} sm={2} xs={2}>
          <div className="footer-logo-wrapper">
            <img src={cc} alt="logo" />
          </div>
        </Col>
        <Col xxl={6} xl={6} lg={6} md={6} sm={6} xs={6}>
        </Col>
        <Col xxl={14} xl={14} lg={14} md={14} sm={16} xs={16} style={{ textAlign: "right" }}>
          <div className="footer-logo-wrapper">
            <img className="logo-small" src={github} alt="logo" />
          </div>
          <Typography.Text className="footer-paragraph">Código fuente abierto desarrollado por</Typography.Text>
          <div className="footer-logo-wrapper">
            <img className="logo-small" src={cdsBlanco} alt="logo" />
          </div>
        </Col>
      </Row>
    </footer>
  );
}


export default Footer;
