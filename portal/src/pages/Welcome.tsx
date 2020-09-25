import React from 'react';
import { Card, Col, Divider, PageHeader, Row, Tag } from 'antd';
import { Link } from 'react-router-dom';
<<<<<<< Updated upstream
import {
    ReconciliationOutlined,
    DashboardOutlined,
    IdcardOutlined,
    InfoOutlined,
    RiseOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Header } from '../Home/Header';
import Footer from '../Home/Footer';

=======
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
>>>>>>> Stashed changes
const data = [{
    link: "/explore/people",
    title: "Buscador de personas",
    description: "Buscar personas que reciben ingresos del gobierno.",
    tags: ['people', 'government']
}, {
    link: '/explore/contralory/affidavit',
    title: 'Declaraciones juradas',
    description: 'Todas las declaraciones juradas que se subieron hasta la fecha en el portal de la contraloria',
    tags: ['affidavit', 'government', 'authorities']
}, {
    link: '/explore/authorities/elected',
    title: 'Autoridades electas',
    description: 'Todas las autoridades que han sido electas en elecciones generales.',
    tags: ['authorities', 'government']
}, {
    link: '/explore/ocds/items',
    title: 'Items adquiridos',
    description: 'Todos los items que han sido comprados con recursos de emergencia nacional COVID-19',
    tags: ['ocds', 'items', 'covid']
}, {
    link: '/explore/ocds/covid/itemsRanking',
    title: 'Ranking de items adquiridos',
    description: 'Ranking de ítems que fueron adjudicados en procesos de licitación marcados con COVID-19, agrupados por moneda, presentación y unidad de medida.',
    tags: ['ocds', 'items', 'covid', 'ranking']
}, {
    link: '/explore/ocds/suppliers',
    title: 'Proveedores',
    description: 'Listado de todas aquellas personas físicas o jurídicas que han participado en una licitación pública.',
    tags: ['ocds', 'supplier', 'ranking']
}, {
    link: '/explore/ocds/relations',
    title: 'Proveedores relacionados',
    description: 'Gráfico de relaciones entre proveedores',
    tags: ['ocds', 'supplier', 'graph']
}, {
    link: '/explore/covid/ande',
    title: 'ANDE exoneradas por COVID-19',
    description: 'Listado de facturas exoneradas por la ANDE por baja consumición',
    tags: ['covid', 'ande', 'exonerated', 'people']
}, {
    link: '/explore/covid/essap',
    title: 'ESSAP exoneradas por COVID-19',
    description: 'Listado de exonerados por la ESSAP',
    tags: ['covid', 'essap', 'exonerated']
}, {
    link: '/sources',
    title: 'Fuentes',
    description: 'Todas las fuentes utilizadas para armar este portal, incluido el link de origen y opciones para su descarga',
    tags: ['meta']
}];

const tags: { [k: string]: { label: string, color: string, icon?: React.ReactNode } } = {
    meta: {
        label: 'Acerca de',
        color: '#ff5500',
        icon: <InfoOutlined />
    },
    ocds: {
        label: 'OCDS',
        color: '#4b61cf'
    },
    covid: {
        label: 'COVID-19',
        color: '#498344'
    },
    people: {
        label: 'Personas',
        color: '#116d5f',
        icon: <UserOutlined />
    },
    government: {
        label: 'Datos gubernamentales',
        color: '#ac4444',
        icon: <ReconciliationOutlined />
    },
    items: {
        label: 'Items',
        color: '#108ee9'
    },
    ranking: {
        label: 'Ranking',
        color: '#2db7f5',
        icon: <RiseOutlined />
    },
    supplier: {
        label: 'Proveedor',
        color: '#8435cd',
        icon: <IdcardOutlined />
    },
    authorities: {
        label: 'Autoridades',
        color: '#b59a39'
    },
    exonerated: {
        label: 'Exoneraciones',
        color: '#8c5c5c'
    },
    graph: {
        label: "Gráfico",
        color: '#87d068',
        icon: <DashboardOutlined />
    },
    affidavit: {
        label: 'Declaraciones juradas',
        color: '#87d068'
    }
}

export function Welcome() {
    return <>
        <Header tableMode={false} />
        <PageHeader ghost={false}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            title="IDEA / CDS"
            subTitle="Portal para explorar datos abiertos"
            extra={[]}>
            <Divider orientation="left">Conjuntos de datos</Divider>
            <Row justify="space-around" align="middle" gutter={[16, 32]}>
                {data.map(d => <Col xl={6} lg={8} md={12} xs={24} key={d.title}>
                    <Link to={d.link}>
                        <Card hoverable style={{ width: '100%' }}>
                            <Card.Meta title={d.title}
                                description={<>
                                    {d.description}
                                    <br />
                                    <br />
                                    {d.tags.map(t => <CustomTag t={t} key={t} />)}
                                </>} />

                        </Card></Link>
                </Col>)}
            </Row>


        </PageHeader>
        <Footer tableMode={false}/>
    </>
}


function CustomTag({ t }: { t: string }) {
    if (tags[t]) {
        return <Tag color={tags[t].color} icon={tags[t].icon}>
            <b>{tags[t].label}</b>
        </Tag>
    }
    return <Tag>{t}</Tag>
}

