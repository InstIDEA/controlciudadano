import React from 'react';
import QueueAnim from 'rc-queue-anim';
import {Col, Input, Row, Tooltip} from 'antd';
import './Landing.css';
import explorarDatos from '../assets/imgs/explorar_datos.svg';
import comprasCovid from '../assets/imgs/compras_covid.svg';
import verificacionDDJJ from '../assets/imgs/verificacion_DDJJ.svg';
import {Header} from '../components/layout/Header'
import Footer from '../components/layout/Footer';
import {Async, AsyncHelper} from '../Model';
import {formatIsoDate, formatMoney, formatToMonth, formatWF} from '../formatters';
import {Link, useHistory} from 'react-router-dom';
import {FilterOutlined} from '@ant-design/icons'
import {useMediaQuery} from '@react-hook/media-query';
import landingAnalysis from '../assets/imgs/landing_analysis.svg'
import {useGlobalStats} from "../hooks/useStats";

const CARDS = [
    {
        img: landingAnalysis,
        title: 'Análisis de crecimiento patrimonial',
        href: '/analysis/'
    },
    {
        img: comprasCovid,
        title: 'Compras COVID',
        href: `/action`,
    },
    {
        img: verificacionDDJJ,
        title: 'Declaraciones Juradas de Autoridades electas',
        href: `/djbr/portal`,
    },
    {
        img: explorarDatos,
        href: `/explore`,
        title: 'Explorar Datos',
    }
];

export function LandingPage() {

    const history = useHistory();
    const data = useGlobalStats();

    const isSmall = useMediaQuery('only screen and (max-width: 900px)');


    const children = CARDS.map(card => (
        <Col className="card-wrapper" key={card.title} xl={9} md={12} xs={24}>
            <Link className="card" to={card.href}>
                <img src={card.img} alt="" className="card-img-top"/>
                <div className="card-body">
                    <span className="title">{card.title}</span>
                    <div className="button-wrapper"/>
                    <button className="ver-mas-button">Ver más</button>
                </div>
            </Link>
        </Col>
    ));

    return (<>
            <Header tableMode={false}/>
            <Row className="banner-wrapper" gutter={isSmall ? 8 : [8, 24]}>
                <Col md={{offset: 0, span: 7}}
                     sm={{offset: 1, span: 1}}
                     xs={{offset: 1, span: 1}}
                     style={{textAlign: 'right'}}>
                    <FilterOutlined style={{
                        fontSize: '24px',
                        color: 'rgba(0, 52, 91, 1)',
                        border: '2px solid',
                        borderRadius: '5px',
                        padding: '3px'
                    }}/>
                </Col>
                <Col lg={{offset: 0, span: 10}}
                     md={{offset: 0, span: 12}}
                     sm={{offset: 2, span: 19}}
                     xs={{offset: 1, span: 20}}
                     style={{textAlign: 'left'}}>
                    <Input.Search
                        placeholder="Buscar persona"
                        key="search_input"
                        onSearch={v =>
                            history.push(`/explore/person/search?query="${v.replace(/\s+/, "+")}"`)
                        }
                        style={{
                            color: 'rgba(0, 52, 91, 1)',
                            border: '2px solid',
                            borderRadius: '5px',
                            textAlign: 'left'
                        }}
                        formMethod="submit"/>
                </Col>
                <Col xs={24} className="banner-title-col-wrapper">
                    <QueueAnim className="banner-title-wrapper">
                        <p className="banner-text" key="content">
                            Este es un portal en el que vas a poder explorar <strong>Datos Abiertos</strong>,
                            realizar un <strong>control de los gastos del COVID-19</strong> y
                            analizar el <strong> crecimiento patrimonial de funcionarios públicos</strong> en base a sus
                            Declaraciones Juradas de Bienes y Renta
                        </p>
                    </QueueAnim>
                </Col>
                <section className="page-wrapper info-banner">
                    <QueueAnim type="bottom"
                               className="page row text-center"
                               delay={500}>
                        <Col className="card-wrapper" key="info" xl={20} md={24} xs={24}>
                            <div className="info-card">
                                <Statistic name={AsyncHelper.loaded("Salarios Pagados")}
                                           obs={AsyncHelper.map(data, d => `Cantidad de funcionarios que recibieron salarios a ${formatToMonth(d.payed_salaries_month)} según la SFP`)}
                                           data={AsyncHelper.map(data, d => d.payed_salaries)}/>
                                <Statistic
                                    name={AsyncHelper.map(data, d => `Contratos del ${formatWF(d.calc_date, 'yyyy')}`)}
                                    obs={AsyncHelper.map(data, d => `Contratos firmados al ${formatIsoDate(d.calc_date)} reportados por la DNCP`)}
                                    data={AsyncHelper.map(data, d => d.ocds_current_year_contracts)}/>
                                <Statistic name={AsyncHelper.loaded("Contratos COVID-19")}
                                           obs={AsyncHelper.map(data, d => `Contratos realizados contra la pandemia al ${formatIsoDate(d.calc_date)} según la DNCP`)}
                                           data={AsyncHelper.map(data, d => d.ocds_covid_contracts)}/>
                            </div>
                        </Col>
                    </QueueAnim>
                </section>
                <section className="page-wrapper page1">
                    <QueueAnim type="bottom"
                               className="page row text-center"
                               delay={500}>
                        <Row gutter={[8, 32]} align="middle" justify="center">
                            {children}
                        </Row>
                    </QueueAnim>
                </section>
            </Row>
            <Footer tableMode={false}/>
        </>
    );
}

function Statistic(props: {
    data: Async<number>,
    name: Async<string>,
    obs: Async<string>
}) {
    const number = AsyncHelper.or(props.data, 0)
    const name = AsyncHelper.or(props.name, '')
    const isLoaded = props.data.state === 'LOADED';
    const observation = AsyncHelper.or(props.obs, "Cargando...")
    const numberClasses = isLoaded
        ? "description"
        : "description loading"
    return <Tooltip placement="top" title={observation}>
        <Col className="info-box">
            <span className={numberClasses}>{formatMoney(number)}</span>
            <span className="title">{name}</span>
        </Col>
    </Tooltip>
}
