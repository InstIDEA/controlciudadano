import React from 'react';
import { Row, Col, Typography } from 'antd';
import './AboutPage.css';
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer';
import '../components/layout/Layout.css'

function AboutPage() {
  return (<>
    <Header tableMode={false} />
    <Row>
      <Col offset={10} xxl={12} xl={12} lg={12} md={12} sm={0} xs={0}>
        <Typography.Title className="about-title">Acerca de</Typography.Title>
      </Col>
      <Col offset={2} xxl={0} xl={0} lg={0} md={0} sm={12} xs={12}>
        <Typography.Title className="about-title">Acerca de</Typography.Title>
      </Col>
    </Row>
    <Row gutter={[8, 24]} className="about-paragraph" style={{ minHeight: '50vh', fontSize: '20px' }}>
      <Col span={12} offset={6}>
        <Typography.Paragraph>
          Este sitio web fue posible gracias al generoso apoyo del pueblo de los Estados Unidos de América a través
            de la Agencia de los Estados Unidos para el Desarrollo Internacional (USAID). El contenido de este sitio
            web es responsabilidad de sus autores y no refleja necesariamente las opiniones o posiciones de la Agencia de los Estados Unidos para el Desarrollo Internacional o del Gobierno de los Estados Unidos.
          </Typography.Paragraph>
      </Col>
    </Row>
    <Footer tableMode={false} aboutFooter={true} />
  </>
  );
}


export default AboutPage;
