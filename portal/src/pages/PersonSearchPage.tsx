import * as React from 'react';
import { Layout, Row, Col, Card, Input, Space, Typography, Button, Badge, Select } from 'antd';
import { Header } from '../components/layout/Header';
import { BankOutlined, DollarOutlined, UserOutlined, AlertOutlined, AndroidOutlined, BugOutlined, SearchOutlined } from '@ant-design/icons'
import './PersonSearchPage.css'
import Footer from '../components/layout/Footer';
import { useQueryParam, StringParam } from 'use-query-params';
import { Link } from 'react-router-dom';
export function PersonSearchPage() {

    const [document, setDocument] = useQueryParam('document', StringParam);

    const filterOptions = ['Salario', 'Patrimonio Neto'];
    return <>
        <Header tableMode={true} />
        <Layout>
            <Layout.Sider width={400}>
                <Row className="cards" gutter={[16, 24]}>
                    <Col xxl={{ offset: 1, span: 20 }} xl={{ offset: 1, span: 20 }} lg={{ offset: 1, span: 20 }} md={{ offset: 1, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }}>
                        <Typography.Text className="sidebar-title">Ordenar Por</Typography.Text>
                        <Card size="small"
                            style={{ width: 300 }}
                            className="card-style">
                            <Row gutter={[8, 16]}>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> Salario </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>

                                    <Typography.Text> Patrimonio Neto </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />
                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>

                                    <Typography.Text> Conexiones  </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />
                                </Col>
                            </Row>
                        </Card>
                    </Col>

                    <Col xxl={{ offset: 1, span: 20 }} xl={{ offset: 1, span: 20 }} lg={{ offset: 1, span: 20 }} md={{ offset: 1, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }}>
                        <Typography.Text className="sidebar-title">Filtros</Typography.Text>
                        <Card size="small"
                            style={{ width: 300 }}
                            className="card-style" title="Rango monetario">
                            <Input.Group>
                                <Row gutter={[8, 16]}>
                                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                        <Select style={{ width: '100%' }}>
                                            {filterOptions.map(k => <Select.Option value={k} key={k}>{k} </Select.Option>)}
                                        </Select>
                                    </Col>
                                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                        <Input type="number" placeholder="Desde" />
                                    </Col>
                                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                        <Input type="number" placeholder="Hasta" />
                                    </Col>
                                </Row>

                            </Input.Group>
                        </Card>
                    </Col>
                    <Col xxl={{ offset: 1, span: 20 }} xl={{ offset: 1, span: 20 }} lg={{ offset: 1, span: 20 }} md={{ offset: 1, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }}>
                        <Card size="small"
                            style={{ width: 300 }}
                            className="card-style" title="Datos">
                            <Row gutter={[8, 16]}>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Input.Search
                                        suffix={<SearchOutlined style={{ fontSize: 20, color: 'rgba(0, 52, 91, 1)', marginRight: '5px' }} />}
                                        placeholder="Buscar"
                                        key="search_input"
                                        style={{ color: 'rgba(0, 52, 91, 1)', border: '1px solid', borderRadius: '5px', textAlign: 'left' }}
                                        formMethod="submit" />
                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> Pytyvo </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> Ñangareko </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>

                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> Funcionario de Hacienda  </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> SFP </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> Personal Policía Nacional </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>
                                <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                    <Typography.Text> Exonerado Ande  </Typography.Text>
                                    <Badge className="float-right" count={10} style={{ backgroundColor: '#b2c1cc' }} />

                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </Layout.Sider>
            <Layout>
                <Layout.Content>
                    <Row gutter={[8, 16]}>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }} style={{ textAlign: 'left' }}>
                            <Input.Search
                                placeholder="Buscar"
                                suffix={<SearchOutlined style={{ fontSize: 24, color: 'rgba(0, 52, 91, 1)', marginRight: '5px' }} />}
                                key="search_input"
                                style={{ color: 'rgba(0, 52, 91, 1)', border: '2px solid', borderRadius: '5px', textAlign: 'left' }}
                                defaultValue={document || ''}
                                onSearch={v => setDocument(v)}
                                formMethod="submit" />
                        </Col>
                        <Space direction="vertical" />
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }} style={{ textAlign: 'left' }}>
                            <Card className="card-layout-content">
                                <Typography.Text strong className="text-layout-content">
                                    Filtros Aplicados:
                                </Typography.Text>
                                <Typography.Text className="text-layout-content">
                                    Ninguno
                                </Typography.Text>

                            </Card>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }} style={{ textAlign: 'left' }}>
                            <Card className="card-layout-content"
                            >
                                <Card.Grid style={{ width: '50%', border: 'none', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content" strong> Cantidad Funcionarios MH:</Typography.Text>
                                    <Typography.Text className="text-layout-content"> 1.230</Typography.Text>
                                </Card.Grid>
                                <Card.Grid style={{ width: '50%', border: 'none', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content" strong> Cantidad Funcionarios SFP:
                                    </Typography.Text>
                                    <Typography.Text className="text-layout-content">  1.230</Typography.Text>
                                </Card.Grid>
                                <Card.Grid style={{ width: '50%', border: 'none', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content" strong> Cantidad de personas con </Typography.Text>
                                    <br />
                                    <Typography.Text className="text-layout-content"> Pytyvo: 1.230</Typography.Text>
                                    <br />
                                    <Typography.Text className="text-layout-content"> Ñangareko: 1.230</Typography.Text>
                                    <br />
                                    <Typography.Text className="text-layout-content"> ANDE: 1.230</Typography.Text>
                                </Card.Grid>

                                <Card.Grid style={{ width: '50%', border: 'none', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content" strong> Cantidad de personas con DDJJ: </Typography.Text>
                                    <Typography.Text className="text-layout-content"> 1.230 </Typography.Text>
                                </Card.Grid>
                            </Card>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }} style={{ textAlign: 'left' }}>
                            <Typography.Title level={3} className="title-layout-content"> Resultados </Typography.Title>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 16 }} xs={{ offset: 1, span: 16 }} style={{ textAlign: 'left' }}>
                            <Row>
                                <Col xxl={{ offset: 1, span: 5 }} xl={5} lg={5} md={5} sm={24} xs={24}>
                                    <Typography.Text>
                                        Nombre
                                    </Typography.Text>
                                </Col>
                                <Col xxl={{ offset: 0, span: 5 }} xl={5} lg={5} md={5} sm={24} xs={24}>
                                    <Typography.Text>
                                        Salario
                            </Typography.Text>
                                </Col>
                                <Col xxl={{ offset: 0, span: 5 }} xl={5} lg={5} md={5} sm={24} xs={24}>
                                    <Typography.Text>
                                        Patrimonio Neto
                            </Typography.Text>
                                </Col>
                                <Col xxl={{ offset: 0, span: 5 }} xl={5} lg={5} md={5} sm={24} xs={24}>
                                    <Typography.Text>
                                        Fuente de datos
                            </Typography.Text>
                                </Col>
                            </Row>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 0, span: 24 }} xs={{ offset: 0, span: 24 }} style={{ textAlign: 'left' }}>
                            <Card className="card-layout-content"
                            >
                                <Card.Grid style={{ width: '20%', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content"> Horacio Manuel Cartes</Typography.Text>
                                </Card.Grid>
                                <Card.Grid style={{ width: '20%', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content"> </Typography.Text>
                                </Card.Grid>
                                <Card.Grid style={{ width: '20%', boxShadow: 'none' }} hoverable={false}>
                                    <Typography.Text className="text-layout-content"> 1.629.851.962.811 </Typography.Text>
                                </Card.Grid>
                                <Card.Grid style={{ width: '20%', boxShadow: 'none' }} hoverable={false}>
                                    <BankOutlined style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />
                                    <DollarOutlined style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />
                                    <UserOutlined style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />
                                    <AlertOutlined style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />
                                    <AndroidOutlined style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />
                                    <BugOutlined style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />
                                    <Typography.Text className="text-layout-content">  </Typography.Text>
                                </Card.Grid>
                                <Card.Grid style={{ width: '20%', boxShadow: 'none' }} hoverable={false}>
                                    <Link to="/person/detail/">
                                        <Button className="mas-button">Ver más</Button>
                                    </Link>
                                </Card.Grid>
                            </Card>
                        </Col>
                    </Row>
                </Layout.Content>
            </Layout>
        </Layout>
        <Footer tableMode={true} />
    </>

}