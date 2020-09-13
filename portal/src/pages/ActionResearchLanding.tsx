import React from 'react';
import {Card, Col, Divider, Row, Space} from 'antd';
import './ActionResearchLanding.css';
import dataReports from '../assets/imgs/undraw_data_reports_706v.svg'
import buyers from '../assets/imgs/undraw_Online_page_re_lhgx.svg'
import suppliers from '../assets/imgs/undraw_Mind_map_re_nlb6.svg'
import onlineReports from '../assets/imgs/undraw_medical_care_movn.svg'
import contracts from '../assets/imgs/undraw_contract_uy56.svg'
import relation from '../assets/imgs/undraw_conceptual_idea_xw7k.svg'
import {Link} from 'react-router-dom';
import cds from '../assets/logos/cds.svg'
import idea from '../assets/logos/idea.svg'
import ocp from '../assets/logos/ocp.png';

export function ActionResearchLanding() {

    const spans = {xl: 8, lg: 8, md: 12, xs: 24};

    return <div className="action-landing">

        <Row className="title">
            <div>
                Can urgency be exploited by corruption?
            </div>
        </Row>

        <Row className="description">
            <div>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ipsum saepe temporibus veniam. Dolorum earum
                magnam quia quibusdam similique. Consequuntur facilis itaque minima nisi quae sequi unde. Consectetur
                fuga
                officia voluptatum.
            </div>
            <div>Eveniet, odit, pariatur. Aspernatur ipsum modi non, placeat sunt voluptate. Ab accusamus aliquid amet
                beatae consequatur distinctio ducimus est fuga id illum molestias natus numquam optio, pariatur
                praesentium,
                reprehenderit sequi.
            </div>
        </Row>

        <Row className="cards" gutter={[8, 24]}>
            <Col {...spans}>
                <Link to="/ocds/items" target="_blank">
                    <Card hoverable
                          style={{width: 320}}
                          cover={<img alt="Items adquiridos" src={onlineReports}/>}>
                        <Card.Meta title="Items adquiridos"
                                   description="Todos los items que han sido adquiridos para la lucha contra el Covid-19"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/ocds/covid/itemsRanking" target="_blank">
                    <Card hoverable
                          style={{width: 350}}
                          cover={<img alt="Ranking de items adquiridos" src={dataReports}/>}>
                        <Card.Meta title="Ranking de items adquiridos"
                                   description="Ranking de ítems que fueron adjudicados en procesos de licitación marcados con COVID-19, agrupados por moneda, presentación y unidad de medida."/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/ocds/sanctioned_suppliers" target="_blank">
                    <Card hoverable
                          style={{width: 340}}
                          cover={<img alt="Proveedores" src={suppliers}/>}>
                        <Card.Meta title="Proveedores"
                                   description="Todos aquellos que han proveído al estado en una licitación pública."/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/ocds/buyers" target="_blank">
                    <Card hoverable
                          style={{width: 340}}
                          cover={<img alt="Compradoras" src={buyers}/>}>
                        <Card.Meta title="Entidades compradoras"
                                   description="Todas las entidades públicas que han adquirido bienes durante la pandemia"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/ocds/tenders" target="_blank">
                    <Card hoverable
                          style={{width: 280}}
                          cover={<img alt="Licitaciones" src={contracts} style={{
                              height: '200px',
                              width: 'auto',
                              margin: 'auto'
                          }}/>}>
                        <Card.Meta title="Licitaciones"
                                   description="Las licitaciones realizadas en la pandemia"/>
                    </Card>
                </Link>
            </Col>

            <Col {...spans}>
                <Link to="/ocds/relations" target="_blank">
                    <Card hoverable
                          style={{width: 340}}
                          cover={<img alt="Relations" src={relation}/>}>
                        <Card.Meta title="Relaciones entre proveedores"
                                   description="Relación entre los distintos proveedores del estado"/>
                    </Card>
                </Link>
            </Col>
        </Row>

        <Divider orientation="center" plain className="footer">
            <Space>
                <img src={idea} alt="IDEA" style={{height: 20, width: 'auto'}}/>
                <img src={cds} alt="Centro de Desarrollo Sostenible" style={{height: 20, width: 'auto'}}/>
                <img src={ocp} alt="Open Contracting partnership" style={{height: 20, width: 'auto'}}/>
            </Space>
            <br/>
            <small>{new Date().getFullYear()} - Todos los derechos reservados</small>
        </Divider>


    </div>

}
