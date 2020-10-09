import React, {useEffect, useState} from 'react';
import QueueAnim from 'rc-queue-anim';
import {Col, Row, Tooltip} from 'antd';
import './Landing.css';
import explorarDatos from '../assets/imgs/explorar_datos.svg';
import comprasCovid from '../assets/imgs/compras_covid.svg';
import {Header} from '../components/layout/Header'
import Footer from '../components/layout/Footer';
import {Async, AsyncHelper, GlobalStatistics} from '../Model';
import {RedashAPI} from '../RedashAPI';
import {formatIsoDate, formatMoney, formatToMonth} from '../formatters';
import {Link} from 'react-router-dom';

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

export function LandingPage() {

    const [data, setData] = useState<Async<GlobalStatistics>>({
        state: 'NO_REQUESTED'
    })

    useEffect(() => {
        setData({state: 'FETCHING'})
        new RedashAPI().getMainStatistics()
            .then(d => setData({
                state: 'LOADED',
                data: d.query_result.data.rows[0]
            }))
            .catch(e => setData({
                state: 'ERROR',
                error: e
            }))
    }, [])

    const children = page1.map(card => (
        <Col className="card-wrapper" key={card.title} md={12} xs={24}>
            <Link className="card" to={card.href}>
                <img src={card.img} alt="" className="card-img-top"/>
                <div className="card-body">
                    <span className="description">{card.description}</span>
                    <span className="title">{card.title}</span>
                    <div className="button-wrapper"/>
                    <button className="ver-mas-button">Ver más</button>
                </div>
            </Link>
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
                                <Statistic name="Salarios Pagados"
                                           obs={AsyncHelper.map(data, d => `Salarios pagados a ${formatToMonth(d.payed_salaries_month)}`)}
                                           data={AsyncHelper.map(data, d => d.payed_salaries)}/>
                                <Statistic name="Contratos del 2020"
                                           obs={AsyncHelper.map(data, d => `Contratos firmados al ${formatIsoDate(d.calc_date)}`)}
                                           data={AsyncHelper.map(data, d => d.ocds_current_year_contracts)}/>
                                <Statistic name="Contratos COVID-19"
                                           obs={AsyncHelper.map(data, d => `Contratos realizados contra la pandemia al ${formatIsoDate(d.calc_date)}`)}
                                           data={AsyncHelper.map(data, d => d.ocds_covid_contracts)}/>
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

function Statistic(props: {
    data: Async<number>,
    name: string,
    obs: Async<string>
}) {
    const number = AsyncHelper.or(props.data, 0)
    const isLoaded = props.data.state === 'LOADED';
    const observation = AsyncHelper.or(props.obs, "Cargando...")
    const numberClasses = isLoaded
        ? "description"
        : "description loading"
    return <Tooltip placement="top" title={observation}>
        <Col className="info-box">
            <span className={numberClasses}>{formatMoney(number)}</span>
            <span className="title">{props.name}</span>
        </Col>
    </Tooltip>
}
