import React from 'react';
import { Card, Col, Row } from 'antd';
import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './Welcome.css';
import buscadorPersonas from '../assets/imgs/buscador_personas.svg'
import declaraciones from '../assets/imgs/declaraciones.svg'
import autoridades from '../assets/imgs/autoridades_electas.svg'
import items from '../assets/imgs/items_adquiridos.svg'
import rankingItems from '../assets/imgs/ranking_items.svg'
import proveedores from '../assets/imgs/proveedores.svg'
import proveedoresRelacionados from '../assets/imgs/relaciones_proveedores.svg'
import exoneradasAnde from '../assets/imgs/exoneradas_ande.svg'
import exoneradasEssap from '../assets/imgs/exoneradas_essap.svg'

const data = [{
    link: "/people",
    title: "Buscador de personas",
    description: "Buscar personas que reciben ingresos del gobierno.",
    icon: buscadorPersonas
}, {
    link: '/contralory/affidavit',
    title: 'Declaraciones juradas',
    description: 'Todas las declaraciones juradas que se subieron hasta la fecha en el portal de la contraloria',
    icon: declaraciones
}, {
    link: '/authorities/elected',
    title: 'Autoridades electas',
    description: 'Todas las autoridades que han sido electas en elecciones generales.',
    icon: autoridades
}, {
    link: '/ocds/items',
    title: 'Items adquiridos',
    description: 'Todos los items que han sido comprados con recursos de emergencia nacional COVID-19',
    icon: items
}, {
    link: '/ocds/covid/itemsRanking',
    title: 'Ranking de items adquiridos',
    description: 'Ranking de ítems que fueron adjudicados en procesos de licitación marcados con COVID-19, agrupados por moneda, presentación y unidad de medida.',
    icon: rankingItems
}, {
    link: '/ocds/suppliers',
    title: 'Proveedores',
    description: 'Listado de todas aquellas personas físicas o jurídicas que han participado en una licitación pública.',
    icon: proveedores
}, {
    link: '/ocds/relations',
    title: 'Proveedores relacionados',
    description: 'Gráfico de relaciones entre proveedores',
    icon: proveedoresRelacionados
}, {
    link: '/covid/ande',
    title: 'ANDE exoneradas por COVID-19',
    description: 'Listado de facturas exoneradas por la ANDE por baja consumición',
    icon: exoneradasAnde
}, {
    link: '/covid/essap',
    title: 'ESSAP exoneradas por COVID-19',
    description: 'Listado de exonerados por la ESSAP',
    icon: exoneradasEssap
}, {
    link: '/sources',
    title: 'Fuentes',
    description: 'Todas las fuentes utilizadas para armar este portal, incluido el link de origen y opciones para su descarga',
    icon: exoneradasEssap
}];

export function Welcome() {
    return <>
        <Header tableMode={false} />
        <div className="welcome-page">
            <Row className="cards" gutter={[8, 24]}>
                {data.map(d =>
                    <Col xl={8} lg={8} md={12} sm={12} xs={24} key={d.title}>
                        <Link to={d.link}>
                            <Card hoverable
                                style={{ width: 320 }}
                                cover={<img height="80px" src={d.icon} alt="Items adquiridos" />}>
                                <Card.Meta title={d.title}
                                    description={d.description} />
                                <div className="row-button">
                                    <button className="ver-mas-button">Fuente</button>
                                    <button className="ver-mas-button">Explorar</button>
                                </div>
                            </Card>
                        </Link>
                    </Col>
                )}
            </Row>
        </div>
        <Footer tableMode={false} />
    </>
}

