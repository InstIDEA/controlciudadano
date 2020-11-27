import React from 'react';
import {Col, Row, Typography} from 'antd';
import './Footer.css';
import cds from '../../assets/logos/cds.png';
import cdsBlanco from '../../assets/logos/cds_blanco.png';
import ocp from '../../assets/logos/ocp.png';
import reaccion from '../../assets/logos/reaccion_fondo.png';
import idea from '../../assets/logos/logo_idea.png';
import cc from '../../assets/logos/cc.png';
import github from '../../assets/logos/github.svg';

const GITHUB_REPO = 'https://github.com/InstIDEA/controlciudadano';

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
                        <img src={idea} alt="logo"/>
                    </div>
                </Col>
                <Col offset={props.aboutFooter ? 6 : 0}
                     xxl={props.aboutFooter ? 12 : 8} xl={props.aboutFooter ? 12 : 8}
                     lg={props.aboutFooter ? 12 : 8} md={props.aboutFooter ? 12 : 8} sm={12} xs={12}>
                    <span className="footer-label">Impulsores del proyecto:</span>
                    <div id="logo">
                        <img src={idea} alt="logo"/>
                        <img src={reaccion} alt="logo"/>
                        <img src={cds} alt="logo"/>
                    </div>
                </Col>
                <Col offset={props.aboutFooter ? 6 : 0}
                     xxl={props.aboutFooter ? 12 : 8} xl={props.aboutFooter ? 12 : 8}
                     lg={props.aboutFooter ? 12 : 8} md={props.aboutFooter ? 12 : 8} sm={12} xs={12}>
                    <span className="footer-label">Herramientas de IA con apoyo de:</span>
                    <div id="logo">
                        <img src={ocp} alt="logo"/>
                    </div>
                </Col>
            </Row>
            <Row className="footer-background">
                <Col xs={24} sm={24} md={6} lg={8} xl={10} xxl={10} className="copyright">
                    <div className="footer-logo-wrapper">
                        <img src={cc} alt="logo"/>
                    </div>
                </Col>
                <Col xs={24} sm={24} md={12} lg={8} xl={4} xxl={4} style={{textAlign: "center"}}>
                    <a href={`/disclaimer`} className="footer-paragraph">Descargo de responsabilidad</a>
                </Col>
                <Col xs={24} sm={24} md={6} lg={8} xl={10} xxl={10} className="repo">
                    <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer">
                        <div className="footer-logo-wrapper">
                            <img className="logo-small" src={github} alt="logo"/>
                        </div>
                        <Typography.Text className="footer-paragraph">Código fuente abierto desarrollado
                            por</Typography.Text>
                        <div className="footer-logo-wrapper">
                            <img className="logo-small" src={cdsBlanco} alt="logo"/>
                        </div>
                    </a>
                </Col>
            </Row>
        </footer>
    );
}


export default Footer;
