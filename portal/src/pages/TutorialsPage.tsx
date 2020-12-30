import * as React from 'react';
import {useEffect, useState} from 'react';
import {Card, Col, Row, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import {VideoTutorialesSemillas} from '../Model';
import {RedashAPI} from '../RedashAPI';
import {useMediaQuery} from '@react-hook/media-query';
import Footer from '../components/layout/Footer';
import './VideoTutoriales.css';


export function TutorialsPage() {

    const [data, setData] = useState<VideoTutorialesSemillas[]>();

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');

    useEffect(() => {
        new RedashAPI()
            .getVideoTutorialesSemillas()
            .then(d => setData(d.query_result.data.rows))
        ;
    }, []);

    return <>
        <Header tableMode={false}/>
        <div className="VideoTutoriales-page">
            <Typography.Paragraph className="title-paragraph" style={{textAlign: 'center'}}>
                Videos Tutoriales
            </Typography.Paragraph>
            <Row className="cards" gutter={[9, 24]} style={{padding: isSmall ? '0px' : '24px'}}>
                {data?.map(d =>
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
            </Row>
        </div>
        <Footer tableMode={false}/>
    </>
}
