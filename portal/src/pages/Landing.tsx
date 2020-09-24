import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { Row, Col } from 'antd';
import './Landing.css';
import explorarDatos from '../assets/imgs/explorar_datos.svg';
import comprasCovid from '../assets/imgs/compras_covid.svg';
import { Header } from '../components/layout/Header'
import Footer from '../components/layout/Footer';
export const page1 = [
  {
    img: explorarDatos,
    href: `/explore`,
    title: 'Explorar Datos',
    description: '',
  },
  {
    img: comprasCovid,
    title: 'Compras COVID',
    href: `/action`,
    description: ''
  },
];

function Banner() {
  const children = page1.map((card, i) => (
    <Col className="card-wrapper" key={i.toString()} md={12} xs={24}>
      <a className="card" href={card.href}>
        <img src={card.img} alt="" className="card-img-top" />
        <div className="card-body">
          <span className="description">{card.description}</span>
          <span className="title">{card.title}</span>
          <div className="button-wrapper"></div>
            <button className="ver-mas-button">Ver más</button>
        </div>
      </a>
    </Col>
  ));
  return (<>
    <Header tableMode={false}/>
    <Row className="banner-wrapper">
      <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
        <QueueAnim className="banner-title-wrapper">
          <p className="banner-text" key="content">
            Este es un portal en el que vas a poder explorar <strong>Datos Abiertos</strong>,
  para realizar un <strong>control de los gastos del COVID-19</strong>
          </p>
        </QueueAnim>
      </Col>
      <section className="page-wrapper info-banner">
        <QueueAnim
          component={Row}
          type="bottom"
          className="page row text-center"
          delay={500}
        >
          <Col className="card-wrapper" key="info" md={20} xs={24}>
            <div className="info-card">
              <Col className="info-box">
                <span className="title">1200</span>
                <span className="description">Salarios Pagados</span>
              </Col>
              <Col className="info-box">
                <span className="title">1200</span>
                <span className="description">Contratos del 2020</span>
              </Col>
              <Col className="info-box">
                <span className="title">1200</span>
                <span className="description">Contratos COVID-19</span>
              </Col>
            </div>
          </Col>
        </QueueAnim>
      </section>
      <section className="page-wrapper page1">
        <QueueAnim
          component={Row}
          type="bottom"
          className="page row text-center"
          delay={500}
        >
          {children}
        </QueueAnim>
      </section>
    </Row>
    <Footer tableMode={false}/>
    </>
  );
}


export default Banner;
