import React, { useEffect, useState, useMemo } from 'react';
import { Button, Input, PageHeader, Space, Table, List, Card, Row, Col, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { RedashAPI } from '../RedashAPI';
import { StringParam, useQueryParam } from 'use-query-params';
import { Header } from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import './Datasources.css';
import { SearchOutlined } from '@ant-design/icons'
import { DataSet, DataSetFile } from '../Model';

interface Target {
    year: string,
    jan?: DataSetFile,
    feb?: DataSetFile,
    mar?: DataSetFile,
    apr?: DataSetFile,
    may?: DataSetFile,
    jun?: DataSetFile,
    jul?: DataSetFile,
    aug?: DataSetFile,
    sep?: DataSetFile,
    oct?: DataSetFile,
    nov?: DataSetFile,
    dec?: DataSetFile
}
export function DSDownload() {
    const { dataSetId } = useParams();
    const [working, setWorking] = useState(false);
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [data, setData] = useState<DataSet[]>();
    const history = useHistory();

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getDataSets()
            .then(d => {
                const finalData = d.query_result.data.rows.filter(e => e.id.toString() === dataSetId);
                setData(finalData);
            })
            .finally(() => setWorking(false));
    }, [dataSetId]);
    const d = data ? data[0] : null;
    const dataFiles: DataSetFile[] = d?.files || [];
    useEffect(() => {
        if (!d) return;
    }, [d])

    const first = d?.files;
    const final = useMemo(() => {
        if (!first) return [];
        return prepareData(first);
    }, [first])

    return <>
        <Header tableMode={true} searchBar={
            <div className="header-search-wrapper">
                <Input.Search
                    prefix={<SearchOutlined />}
                    suffix={null}
                    placeholder="Buscar"
                    key="search_input"
                    defaultValue={query || ''}
                    onSearch={v => setQuery(v)}
                    style={{ width: 200 }}
                    formMethod="submit" />
            </div>
        } />
        <PageHeader title="Descarga"
            onBack={() => history.push('/sources')}
            subTitle="" style={{ minHeight: '80vh' }}>
            {d?.kind === 'MONTHLY' &&
                <div className="hide-responsive" style={{ padding: 12 }}>
                    <Table<Target>
                        loading={working}
                        rowKey="url"
                        dataSource={final}
                        columns={[{
                            title: 'Año',
                            dataIndex: 'year',
                            sorter: (a, b) => (a.year || '').localeCompare(b.year)
                        },
                        {
                            title: "Enero",
                            dataIndex: "january",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                {row.jan &&
                                    <a href={row.jan?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }, {
                            title: "Febrero",
                            dataIndex: "february",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                {row.jan &&
                                    <a href={row.feb?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        },
                        {
                            title: "Marzo",
                            dataIndex: "march",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                {row.mar &&
                                    <a href={row.mar?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        },
                        {
                            title: "Abril",
                            dataIndex: "april",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.apr &&
                                    <a href={row.apr?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        },
                        {
                            title: "Mayo",
                            dataIndex: "may",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.may &&
                                    <a href={row.may?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        },
                        {
                            title: "Junio",
                            dataIndex: "june",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.jun &&
                                    <a href={row.jun?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        },
                        {
                            title: "Julio",
                            dataIndex: "july",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.jul &&
                                    <a href={row.jul?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }, {
                            title: "Agosto",
                            dataIndex: "august",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.aug &&
                                    <a href={row.aug?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }, {
                            title: "Septiembre",
                            dataIndex: "september",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.sep &&
                                    <a href={row.sep?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }, {
                            title: "Octubre",
                            dataIndex: "october",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.oct &&
                                    <a href={row.oct?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }, {
                            title: "Noviembre",
                            dataIndex: "november",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.nov &&
                                    <a href={row.nov?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }, {
                            title: "Diciembre",
                            dataIndex: "december",
                            render: (_, row) => <Space className="action-column">
                                <Space>
                                { row.dec &&
                                    <a href={row.dec?.original_url} target="_blank" rel="noopener noreferrer">
                                        <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                            Descargar
                                        </Button>
                                    </a>
                                }
                                </Space>
                            </Space>
                        }]}
                    />
                </div>}
            {
                d?.kind === 'OTHER' && (
                    <List
                        pagination={{
                            showSizeChanger: true,
                            position: "bottom"
                        }}
                        loading={working}
                        dataSource={dataFiles}
                        renderItem={(r: DataSetFile) =>

                            <List.Item >
                                <Row gutter={[2, 10]}>
                                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                        <Typography.Text>Nombre del archivo: {r.file_name}</Typography.Text>
                                    </Col>
                                    <Col xxl={24} xl={24} lg={24} md={24} sm={24} xs={24}>
                                        <a href={r.original_url} target="_blank" rel="noopener noreferrer">
                                            <Button type="primary" icon={<DownloadOutlined />}>
                                                Descargar
                                            </Button>
                                        </a>
                                    </Col>
                                </Row>
                            </List.Item>
                        }
                    >
                    </List>
                )
            }

            {d?.kind === 'MONTHLY' &&
                <List
                    className="show-responsive"
                    grid={{
                        gutter: 16,
                        xs: 1,
                        sm: 1,
                        md: 1,
                        lg: 4,
                        xl: 5,
                        xxl: 6
                    }}
                    pagination={{
                        showSizeChanger: true,
                        position: "bottom"
                    }}
                    loading={working}
                    dataSource={final}
                    renderItem={(r: Target) =>
                        <List.Item className="list-item">
                            <Card bordered={false} className="datasource-card">
                                <Row gutter={[2, 10]}>
                                    <Col sm={24} xs={24}>
                                        Año: {r.year}
                                    </Col>
                                    <Col sm={24} xs={24}>
                                        { r.jan && <>
                                                Enero:
                                                <a href={r.jan?.original_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                    </Button>
                                                </a>
                                            </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.feb && <>

                                            Febrero:
                                            <a href={r.feb?.original_url} target="_blank" rel="noopener noreferrer">
                                                <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                </Button>
                                            </a>
                                        </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.mar && <>

                                            Marzo:
                                            <a href={r.mar?.original_url} target="_blank" rel="noopener noreferrer">
                                                <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                </Button>
                                            </a>
                                        </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.apr && <>

                                            Abril:
                                            <a href={r.apr?.original_url} target="_blank" rel="noopener noreferrer">
                                                <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                </Button>
                                            </a>
                                        </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        {r.may && <>
                                                Mayo:
                                                <a href={r.may?.original_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                    </Button>
                                                </a>
                                            </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.jun && <>

                                            Junio:
                                            <a href={r.jun?.original_url} target="_blank" rel="noopener noreferrer">
                                                <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                </Button>
                                            </a>
                                        </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.jul && <>

                                            Julio:
                                            <a href={r.jul?.original_url} target="_blank" rel="noopener noreferrer">
                                                <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                </Button>
                                            </a>
                                        </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.aug && <>

                                            Agosto:
                                            <a href={r.aug?.original_url} target="_blank" rel="noopener noreferrer">
                                                <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                </Button>
                                            </a>
                                        </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.sep && <>

                                                Septiembre:
                                                <a href={r.sep?.original_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                    </Button>
                                                </a>
                                            </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.oct && <>

                                                Octubre:
                                                <a href={r.oct?.original_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                    </Button>
                                                </a>
                                            </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}> 
                                        { r.nov && <>

                                                Noviembre:
                                                <a href={r.nov?.original_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                    </Button>
                                                </a>
                                            </>
                                        }
                                    </Col>
                                    <Col sm={24} xs={24}>
                                        { r.dec && <> 
                                                Diciembre:
                                                <a href={r.dec?.original_url} target="_blank" rel="noopener noreferrer">
                                                    <Button type="primary" className="btn-wrapper" icon={<DownloadOutlined />}>
                                                    </Button>
                                                </a>
                                            </>
                                        }
                                    </Col>
                                </Row>
                            </Card>
                        </List.Item>
                    }
                >
                </List>}
        </PageHeader>
        <Footer tableMode={true} />
    </>

}

function prepareData(source: DataSetFile[]): Target[] {
    const fullData: { [year: string]: Target } = {};
    const month_to_str: { [k: string]: keyof Target } = {
        '0': 'jan',
        '1': 'feb',
        '2': 'mar',
        '3': 'apr',
        '4': 'may',
        '5': 'jun',
        '6': 'jul',
        '7': 'aug',
        '8': 'sep',
        '9': 'oct',
        '10': 'nov',
        '11': 'dec',
    }
    source.forEach((file: DataSetFile) => {
        const year = new Date(file.file_date).getFullYear() + "";
        const month = new Date(file.file_date).getMonth() + "";
        let yearData = fullData[year];
        if (!yearData) {
            fullData[year] = { year: year };
            yearData = fullData[year];
        }
        const target = month_to_str[month];

        yearData[target] = file as any

    })
    return Object.values(fullData);
}