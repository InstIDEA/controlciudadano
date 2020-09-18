import React from 'react';
import QueueAnim from 'rc-queue-anim';
import { Row, Col } from 'antd';
import './static/home.css';
import explorarDatos from '../assets/imgs/explorar_datos.svg';
import comprasCovid from '../assets/imgs/compras_covid.svg';
import { Link } from 'react-router-dom';
import { Header } from './Header'

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
    <div className="banner-wrapper">
      <QueueAnim className="banner-title-wrapper">
        <p className="banner-text" key="content">
          Este es un portal en el que vas a poder explorar <strong>Datos Abiertos</strong>,
para realizar un <strong>control de los gastos del COVID-19</strong>
        </p>
      </QueueAnim>
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
                <span className="description">1200</span>
                <span className="title">Salarios Pagados</span>
              </Col>
              <Col className="info-box">
                <span className="description">1200</span>
                <span className="title">Contratos del 2020</span>
              </Col>
              <Col className="info-box">
                <span className="description">1200</span>
                <span className="title">Contratos COVID-19</span>
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
    </div>
    </>
  );
}


export default Banner;
