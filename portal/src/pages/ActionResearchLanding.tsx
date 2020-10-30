import React from 'react';
import {Card, Col, Row, Typography} from 'antd';
import './ActionResearchLanding.css';
import dataReports from '../assets/imgs/ranking_items.svg'
import buyers from '../assets/imgs/entidades_compradoras.svg'
import suppliers from '../assets/imgs/proveedores.svg'
import onlineReports from '../assets/imgs/items_adquiridos.svg'
import contracts from '../assets/imgs/licitaciones.svg'
import relation from '../assets/imgs/relaciones_proveedores.svg'
import {Link} from 'react-router-dom';
import { Header } from '../components/layout/Header';
import Footer from '../components/layout/Footer';
export function ActionResearchLanding() {

    const spans = {xl: 8, lg: 8, md: 12, xs: 24};

    return <>
        <Header tableMode={false}/>
        <div className="action-landing">
        <Row className="title">
            <div>
                Can urgency be exploited by corruption?
            </div>
        </Row>

        <Row className="description">
            <Typography.Paragraph>
            Análisis de datos aplicado a compras en Paraguay con uso de fondos públicos y procedimientos abreviados atendiendo la pandemia de Covid-19
            </Typography.Paragraph>
        </Row>

        <Row className="cards" gutter={[8, 24]}>
            <Col {...spans}>
                <Link to="/action/ocds/items" target="_blank">
                    <Card hoverable
                          style={{width: 320, height: 300}}
                          cover={<img height="80px" alt="Items adquiridos" src={onlineReports}/>}>
                        <Card.Meta title="¿Se compró más caro?"
                                   description="Ránking de items con mayores sobrecostos, comparados con sus precios antes de la pandemia"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/action/ocds/covid/itemsRanking">
                    <Card hoverable
                          style={{width: 350, height: 300}}
                          cover={<img height="80px" alt="Ranking de items adquiridos" src={dataReports}/>}>
                        <Card.Meta title="¿Qué se compró?"
                                   description="Ránking de items adquiridos durante la pandemia por monto total, agrupados por unidad de medida y presentación."/>
                    </Card>
                </Link>
            </Col>
            <Col {...spans}>
                <Link to="/action/ocds/sanctioned_suppliers" target="_blank">
                    <Card hoverable
                          style={{width: 340, height: 300}}
                          cover={<img height="80px" alt="Proveedores" src={suppliers}/>}>
                        <Card.Meta title="¿A quiénes se compró?"
                                   description="Ránking de proveedores por monto total adjudicado durante la pandemia"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/action/ocds/buyers" target="_blank">
                    <Card hoverable
                          style={{width: 340, height: 300}}
                          cover={<img height="80px" alt="Compradoras" src={buyers}/>}>
                        <Card.Meta title="¿Quienes compraron?"
                                   description="Ránking de entidades públicas por monto total adjudicado durante la pandemia"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/action/ocds/tenders" target="_blank">
                    <Card hoverable
                          style={{width: 340, height: 300}}
                          cover={<img height="80px" alt="Licitaciones" src={contracts} style={{
                          }}/>}>
                        <Card.Meta title="¿Conocés las licitaciones más grandes?"
                                   description="Ránking de licitaciones por monto total adjudicado durante la pandemia"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/action/ocds/relations" target="_blank">
                    <Card hoverable
                          style={{width: 340, height: 300}}
                          cover={<img height="80px" alt="Relations" src={relation}/>}>
                        <Card.Meta title="¿Tienen vínculos a quienes se compró?"
                                   description="Grafo de relación entre proveedores con igual dirección o número de contacto"/>
                    </Card>
                </Link>
            </Col>
        </Row>

    </div>
    <Footer tableMode={false}/>
    </>

}
