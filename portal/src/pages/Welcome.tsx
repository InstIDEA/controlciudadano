import React from 'react';
import {Card, Col, Row} from 'antd';
import {Link} from 'react-router-dom';
import {Header} from '../components/layout/Header';
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
    link: "/explore/person/",
    title: "Buscador de personas",
    description: "Buscar personas que reciben ingresos del gobierno",
    icon: buscadorPersonas
}, {
    link: '/explore/contralory/affidavit',
    title: 'Declaraciones juradas',
    description: 'Declaraciones juradas que se subieron hasta la fecha en el portal de la contraloría',
    icon: declaraciones
}, {
    link: '/explore/authorities/elected',
    title: 'Autoridades electas',
    description: 'Autoridades electas en elecciones generales',
    icon: autoridades
}, {
    link: '/explore/ocds/items',
    title: '¿Se compró más caro?',
    description: 'Ránking de items con posibles sobrecostos, comparados con sus precios antes de la pandemia',
    icon: items
}, {
    link: '/explore/ocds/itemsRanking',
    title: '¿Qué se compró?',
    description: 'Ránking de items adquiridos durante la pandemia por monto total, agrupados por unidad de medida y presentación',
    icon: rankingItems
}, {
    link: '/explore/ocds/suppliers',
    title: 'Proveedores',
    description: 'Listado de todas aquellas personas físicas o jurídicas que han participado en una licitación pública',
    icon: proveedores
}, {
    link: '/explore/ocds/relations',
    title: 'Relación entre proveedores',
    description: 'Nodos de relación entre proveedores con igual dirección o número de contacto',
    icon: proveedoresRelacionados
}, {
    link: '/explore/covid/ande',
    title: 'ANDE: exoneraciones',
    description: 'Listado de facturas exoneradas por la ANDE por baja consumición',
    icon: exoneradasAnde
}, {
    link: '/explore/covid/essap',
    title: 'ESSAP: exoneraciones',
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
        <Header tableMode={false}/>
        <div className="welcome-page">
            <Row className="cards" gutter={[8, 24]}>
                {data.map(d =>
                    <Col xl={8} lg={8} md={12} sm={12} xs={24} key={d.title}>
                        <Link to={d.link}>
                            <Card hoverable
                                  style={{width: 320, height: 300}}
                                  cover={<img height="80px" src={d.icon} alt="Items adquiridos"/>}>
                                <Card.Meta title={d.title}
                                           description={d.description}/>
                                <div className="row-button">
                                    <Link to="/sources">
                                        <button className="ver-mas-button">Fuente</button>
                                    </Link>
                                    <button className="ver-mas-button">Explorar</button>
                                </div>
                            </Card>
                        </Link>
                    </Col>
                )}
            </Row>
        </div>
        <Footer tableMode={false}/>
    </>
}

