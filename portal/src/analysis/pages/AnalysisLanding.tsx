import React, {PropsWithChildren} from "react";
import {Header} from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import {Card, Col, Layout, Result, Row, Typography} from "antd";
import {Link, useHistory} from "react-router-dom";
import inProgressIcon from "../../assets/imgs/analysis_in_progress.svg";
import './AnalysisLanding.css';
import useMetaTags from "react-metatags-hook";
import Search from "antd/es/input/Search";

const DBJRText = [{
    title: 'Análisis de declaraciones juradas de bienes y rentas',
    description: 'La herramienta de análisis de declaraciones juradas, es una plataforma tecnológica que permite generar información preliminar sobre la razonabilidad del crecimiento patrimonial de los funcionarios públicos, comparando los datos de los activos, pasivos e ingresos declarados por los funcionarios públicos en sus declaraciones juradas de bienes y rentas presentadas que se publican en la página de la <a href="https://portaldjbr.contraloria.gov.py/portal-djbr/"> Contraloría General de la República </a>.'
}, {
    title: '¿Cómo se alimenta la plataforma?',
    description: 'La herramienta utiliza un proceso de extracción de datos de distintas fuentes, siendo la\n                            principal el portal de declaraciones juradas de la Contraloría General de la República, una\n                            vez obtenidos los documentos, se realiza una tarea de extracción de información, en la cual\n                            se extraen los datos más relevantes de una declaración y se guardan en un formato de datos\n                            abiertos'
}, {
    title: '¿Qué puedo hacer si detecto una inconsistencia alta?',
    description: 'Cada análisis generado es de exclusiva responsabilidad del usuario. El mismo,  puede enviar una nota formal dirigida a la CGR, mediante sus canales institucionales, a fin de que esta institución tome conocimiento y proceda a realizar el análisis formal de correspondencia sobre las declaraciones juradas analizadas.\n' +
        '<br /><br />Véase <a href="https://www.contraloria.gov.py/">https://www.contraloria.gov.py/</a>'
}];


const DBJRExamples = shuffle([
    '3335266',
    '4069817',
    '583872',
    '3851730',
    '3363139',
    '3435873',
    '3826933',
]).slice(0, 3);


export function AnalysisLanding() {

    const history = useHistory();
    useMetaTags({
        title: `Análisis de crecimiento patrimonial`,
        description: `Listado de análisis disponibles en el portal`,
        charset: 'utf8',
        lang: 'en',
        openGraph: {
            title: `Análisis de crecimiento patrimonial`,
            site_name: 'controlciudadanopy.org'
        },
        twitter: {
            card: 'summary',
            creator: '@InstIDEA',
            title: `Análisis de crecimiento patrimonial`,
        }
    }, [])

    return <>
        <Header/>

        <Layout>
            <Layout.Content style={{minHeight: '75vh', padding: '0 5%'}}>

                <Row gutter={[16, 16]} style={{flexDirection: 'column'}}>
                    <Col>
                        <Typography.Title style={{textAlign: 'center'}} className="title-color">
                            Análisis de crecimiento patrimonial
                        </Typography.Title>
                    </Col>
                    <Col>
                        <Analysis videoUrl="https://www.youtube.com/embed/a_IkwaUlsB0"
                                  name="Crecimiento patrimonial"
                                  parts={DBJRText}>
                            <Row gutter={[8, 8]} justify="center" className="align-left">
                                {DBJRExamples.map((ex, idx) => <Col key={ex}>
                                    <LinkButton linkTo={`/analysis/net_worth/${ex}`} text={`Ejemplo ${idx + 1}`}/>
                                </Col>)}
                                <Col style={{flexGrow: 1}} className="search-button">
                                    <Search placeholder="Ingresa una cédula"
                                            onSearch={t => t && history.push(`/analysis/net_worth/${t}`)}
                                            enterButton
                                            style={{width: '100%', borderRadius: 5}}/>
                                </Col>
                            </Row>
                        </Analysis>
                    </Col>
                    <Col xs={24}>
                        <Card className="custom-card" style={{width: '100%'}}>
                            <Result
                                status="info"
                                icon={<img src={inProgressIcon} alt="En progreso" style={{
                                    minWidth: 300
                                }}/>}

                                title={<Typography.Paragraph style={{color: "#CD5534"}}>
                                    Estamos trabajando en más análisis
                                </Typography.Paragraph>}
                                subTitle=""
                            />
                        </Card>
                    </Col>
                </Row>
            </Layout.Content>
        </Layout>

        <Footer/>
    </>
}


function Analysis(props: PropsWithChildren<{
    videoUrl: string;
    name: string;
    parts: { title: string, description: string }[];
}>) {

    return <Card className="custom-card">
        <Row style={{minHeight: 512}} gutter={[16, 16]}>


            <Col md={12} sm={24}>
                <iframe title={props.name} src={props.videoUrl} width="100%" height="100%"/>
            </Col>
            <Col md={12} sm={24}>
                <Row gutter={[8, 8]} justify="start" className="left-align">
                    {props.parts.map(part => <React.Fragment key={part.title}>
                            <Col>
                                <Typography.Title level={4} className="title-color">
                                    {part.title}
                                </Typography.Title>
                            </Col>
                            <Col>
                                <Typography.Paragraph>
                                    <div dangerouslySetInnerHTML={{__html: part.description}}/>
                                </Typography.Paragraph>
                            </Col>
                        </React.Fragment>
                    )}
                    <Col>
                        {props.children}
                    </Col>
                </Row>
            </Col>
        </Row>
    </Card>
}

function LinkButton(props: {
    linkTo: string,
    text: string
}) {
    return <Link to={props.linkTo}>
        <button className="round-button" style={{fontSize: 14}}>
            {props.text}
        </button>
    </Link>
}


function shuffle<T>(array: Array<T>): Array<T> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
