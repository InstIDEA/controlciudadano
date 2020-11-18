import * as React from 'react';
import {Card, Col, Layout, Row, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './PersonSearchPage.css'
import Footer from '../components/layout/Footer';
import {DataSearch, ReactiveBase, ReactiveList, SelectedFilters, SingleList} from '@appbaseio/reactivesearch';


export function PersonSearchPage() {

    return <ReactiveBase url="http://localhost:9201/" app="fts_people">
        <Header tableMode={true}/>

        <Layout>
            <Layout.Sider width={400}>
                <Filter />
            </Layout.Sider>
            <Layout>
                <Layout.Content className="content-padding">
                    <Row gutter={[8, 16]}>
                        <Col className="show-responsive"
                             xxl={{offset: 0, span: 20}} xl={{offset: 0, span: 20}}
                             lg={{offset: 0, span: 20}} md={{offset: 0, span: 20}}
                             sm={{offset: 1, span: 22}} xs={{offset: 1, span: 22}}
                             style={{textAlign: 'left'}}>
                            <Filter/>
                        </Col>
                        <Col xxl={{offset: 0, span: 20}} xl={{offset: 0, span: 20}} lg={{offset: 0, span: 20}}
                             md={{offset: 0, span: 20}} sm={{offset: 1, span: 22}} xs={{offset: 1, span: 22}}
                             style={{textAlign: 'left'}}>
                            <Row>
                                <Col>
                                    <DataSearch componentId="Nombre"
                                                dataField={['name', 'lastname', 'document']}/>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <Card className="card-layout-content">
                                        <Typography.Text className="text-layout-content">
                                            <SelectedFilters showClearAll={true} clearAllLabel="Clear filters"/>
                                        </Typography.Text>
                                    </Card>
                                </Col>
                            </Row>
                            <Row>
                                <Col>
                                    <StatsComponent/>
                                </Col>
                                <ResultComponent/>
                            </Row>
                        </Col>
                    </Row>
                </Layout.Content>
            </Layout>
        </Layout>
        <Footer tableMode={true}/>
    </ReactiveBase>

}

function Filter() {
    return <>
        ASSSSSS
        <SingleList componentId="SourceSensor" dataField="source.keyword"
                    react={{
                        and: ['Nombre'],
                    }}
                    title="Fuente"/>
        SSSSSA
    </>
}

function StatsComponent() {
    return <Card className="card-layout-content">
        <Row gutter={[8, 16]}>
            <Col xxl={{offset: 0, span: 12}}
                 xl={{offset: 0, span: 12}}
                 lg={{offset: 0, span: 12}}
                 md={{offset: 0, span: 24}} sm={{offset: 1, span: 24}}
                 xs={{offset: 1, span: 24}}>
                STATS MH
            </Col>
            <Col xxl={{offset: 0, span: 12}}
                 xl={{offset: 0, span: 12}}
                 lg={{offset: 0, span: 12}}
                 md={{offset: 0, span: 24}} sm={{offset: 1, span: 24}}
                 xs={{offset: 1, span: 24}}>
                STATS FTP
            </Col>
            <Col xxl={{offset: 0, span: 12}}
                 xl={{offset: 0, span: 12}}
                 lg={{offset: 0, span: 12}}
                 md={{offset: 0, span: 24}} sm={{offset: 1, span: 24}}
                 xs={{offset: 1, span: 24}}>
                <Typography.Text className="text-layout-content" strong> Cantidad de personas
                    con </Typography.Text>
                STATS PYTYVO
                STATS NANGAREKO
                STATS ANDE
            </Col>
            <Col xxl={{offset: 0, span: 12}}
                 xl={{offset: 0, span: 12}}
                 lg={{offset: 0, span: 12}}
                 md={{offset: 0, span: 24}} sm={{offset: 1, span: 24}}
                 xs={{offset: 1, span: 24}}>
                STATS DDJJ
            </Col>

        </Row>
    </Card>
}

function ResultComponent() {
    return <Col>
        <Row>
            <Typography.Title level={3} className="title-layout-content"> Resultados </Typography.Title>
        </Row>
        <Row>
            <ReactiveList
                dataField=""
                componentId="SearchResult"
                react={{
                    and: ['Nombre']
                }}
                size={10}
                pagination
                paginationAt="bottom"
                renderItem={res => JSON.stringify(res, null, 2)}
            />
        </Row>
    </Col>

}
