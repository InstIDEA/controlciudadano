import * as React from 'react';
import {Card, Col, Row} from 'antd';
import {Header} from '../components/layout/Header';
import { VideoTutorialesSemillas } from '../Model';
import { RedashAPI } from '../RedashAPI';
import {useEffect, useState} from 'react';
import Footer from '../components/layout/Footer';
import './VideoTutoriales.css';


export function VideoTutoriales() {

    const [data, setData] = useState<VideoTutorialesSemillas[]>();

    useEffect(() => {
        new RedashAPI()
            .getVideoTutorialesSemillas()
            .then(d => setData(d.query_result.data.rows))
            ;
    }, []);

    return <>
        <Header tableMode={false}/>
        <div className="welcome-page">
            <Row className="cards" gutter={[8, 24]}>
                {data?.map(d =>
                    <Col xl={8} lg={8} md={12} sm={12} xs={24} key={d.titulo}>
                        <a href={d.link} rel="noopener noreferrer" target="_blank">
                            <Card hoverable
                                  style={{width: 340, height: 540}}>
                                <Card.Meta title={d.titulo}
                                           description={d.description}/>
                                <div className="iframe-container">
                                    <iframe src="https://www.youtube.com/embed/C_LruTtdrgo" width="560" height="315"></iframe>
                                </div>
                                <div className="row-button">
                                    <a href={d.link} rel="noopener noreferrer" target="_blank">
                                        <button className="ver-link-button">Ver video</button>
                                    </a>
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