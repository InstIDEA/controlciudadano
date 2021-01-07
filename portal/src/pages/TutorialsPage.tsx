import * as React from 'react';
import {useEffect, useState} from 'react';
import {Card, Col, Radio, Result, Row, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import {VideoTutorialesSemillas} from '../Model';
import {RedashAPI} from '../RedashAPI';
import {useMediaQuery} from '@react-hook/media-query';
import Footer from '../components/layout/Footer';
import './TutorialsPage.css';

const LABELS: Record<string, string> = {
    'semillas': 'Portal de declaraciones juradas',
    'ocds': 'Licitaciones públicas',
    'public_employees': 'Empleados públicos'
}

export function TutorialsPage() {

    const [data, setData] = useState<VideoTutorialesSemillas[]>([]);
    const [filter, setFilter] = useState<string>();

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');

    useEffect(() => {
        new RedashAPI()
            .getVideoTutorialesSemillas()
            .then(d => setData(d?.query_result?.data?.rows || []))
        ;
    }, []);

    const finalData = data.filter(d => {
        if (!filter) return true;
        return d.type === filter;
    })

    return <>
        <Header tableMode={false}/>

        <div className="VideoTutoriales-page">
            <Typography.Paragraph className="title-paragraph">
                Videos Tutoriales
            </Typography.Paragraph>

            <div className="title-paragraph">
                <Radio.Group onChange={e => setFilter(e.target.value)} defaultValue="a">
                    {Object.keys(LABELS).map(type => {
                        return <Radio.Button value={type}>{LABELS[type]}</Radio.Button>
                    })}
                </Radio.Group>
            </div>
            <Row className="cards" gutter={[9, 24]} style={{padding: isSmall ? '0px' : '24px'}}>
                {finalData.map(d =>
                    <Col xl={9} lg={8} md={12} sm={12} xs={24} key={d.titulo}>
                        <a href={d.link} rel="noopener noreferrer" target="_blank">
                            <Card hoverable style={{
                                width: isSmall ? 296 : 540,
                                height: 'auto',
                                fontSize: isSmall ? '10px' : '14px'
                            }}>
                                <Card.Meta title={d.titulo} description={d.description}/>
                                <div className="iframe-container">
                                    <iframe title="Video iframe" src={d.link} width="560" height="315"/>
                                </div>
                            </Card>
                        </a>
                    </Col>
                )}
                {!finalData.length && <div className="title-paragraph">
                  <Result
                    status="404"
                    title="En progreso"
                    subTitle="Estamos preparando mas videos, vuelve mas tarde!"
                  />
                </div>}
            </Row>
        </div>
        <Footer tableMode={false}/>
    </>
}
