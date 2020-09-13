import React, {useEffect, useMemo, useState} from 'react';
import {Button, Input, PageHeader, Space, Table, Typography} from 'antd';
import {DownloadOutlined, LinkOutlined} from '@ant-design/icons';
import {useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {StringParam, useQueryParam} from 'use-query-params';


interface DSDefinition {
    name: string,
    url: string,
    ds: string
    original_uri?: string;
}

const sources: Array<DSDefinition> = [
    {name: 'Salario enero 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/01.csv', ds: 'Hacienda'},
    {name: 'Salario febrero 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/02.csv', ds: 'Hacienda'},
    {name: 'Salario marzo 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/03.csv', ds: 'Hacienda'},
    {name: 'Salario abril 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/04.csv', ds: 'Hacienda'},
    {name: 'Salario mayo 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/05.csv', ds: 'Hacienda'},
    {name: 'Salario junio 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/06.csv', ds: 'Hacienda'},
    {name: 'Salario julio 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/07.csv', ds: 'Hacienda'},
    {name: 'Salario agosto 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/08.csv', ds: 'Hacienda'},
    {
        name: 'Salario septiembre 2019',
        url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/09.csv',
        ds: 'Hacienda'
    },
    {name: 'Salario octubre 2019', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/10.csv', ds: 'Hacienda'},
    {
        name: 'Salario noviembre 2019',
        url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/11.csv',
        ds: 'Hacienda'
    },
    {
        name: 'Salario diciembre 2019',
        url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2019/12.csv',
        ds: 'Hacienda'
    },
    {name: 'Salario enero 2020', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2020/01.csv', ds: 'Hacienda'},
    {name: 'Salario febrero 2020', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2020/02.csv', ds: 'Hacienda'},
    {name: 'Salario marzo 2020', url: 'https://datapy.ftp.cds.com.py/hacienda/hacienda_2020/03.csv', ds: 'Hacienda'},

    {name: 'Pytyvo lista 01', url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista01-2020-04-29.csv', ds: 'Pytyvo'},
    {name: 'Pytyvo lista 02', url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista02-2020-04-29.csv', ds: 'Pytyvo'},
    {name: 'Pytyvo lista 03', url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista03-2020-05-06.csv', ds: 'Pytyvo'},
    {name: 'Pytyvo lista 04', url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista04-2020-05-07.csv', ds: 'Pytyvo'},
    {
        name: 'Pytyvo lista 05a',
        url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista05-2020-05-11-a.csv',
        ds: 'Pytyvo'
    },
    {
        name: 'Pytyvo lista 05b',
        url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista05-2020-05-11-b.csv',
        ds: 'Pytyvo'
    },
    {
        name: 'Pytyvo lista 05c',
        url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista05-2020-05-11-c.csv',
        ds: 'Pytyvo'
    },
    {name: 'Pytyvo lista 06', url: 'https://datapy.ftp.cds.com.py/pytyvo/pytyvo-lista06-2020-05-12.csv', ds: 'Pytyvo'},

]

const Paragraph = Typography.Paragraph;

export function DS() {

    const [working, setWorking] = useState(false);
    const [query, setQuery] = useQueryParam('query', StringParam);
    const [data, setData] = useState<DSDefinition[]>(sources);
    const history = useHistory();

    useEffect(() => {
        setWorking(true);
        new RedashAPI().getSources()
            .then(d => {
                setData(prev => [
                    ...d.query_result.data.rows.map(row => ({
                        ds: mapDSToName(row.dataset),
                        name: `${row.file_name}`,
                        url: `https://datapy.ftp.cds.com.py/${mapDSToFolder(row.dataset)}/${row.hash}_${row.file_name}`,
                        original_uri: row.original_uri
                    })),
                    ...prev
                ])
            })
            .finally(() => setWorking(false));
    }, []);

    const filtered = useMemo(() => filterRedashList(data || [], query || '', [
        'name',
        'ds'
    ]), [data, query]);

    return <PageHeader title="Fuentes utilizadas"
                       onBack={() => history.push('/')}
                       subTitle="IDEA - CDS"
                       extra={[
                           <Input.Search placeholder="Buscar"
                                         key="search_input"
                                         defaultValue={query || ''}
                                         onSearch={v => setQuery(v)}
                                         formMethod="submit"/>
                       ]}>

        <Paragraph>
            En esta pagina encontraras todas las fuentes de datos utilizadas, estamos en constante proceso de
            actualización.
        </Paragraph>
        <div style={{padding: 12}}>
            <Table<DSDefinition>
                loading={working}
                rowKey="url"
                dataSource={filtered}
                columns={[{
                    title: 'Fuente',
                    dataIndex: 'ds',
                    sorter: (a, b) => (a.ds || '').localeCompare(b.ds)
                }, {
                    title: 'Nombre',
                    dataIndex: 'name',
                    sorter: (a, b) => (a.name || '').localeCompare(b.name)
                }, {
                    title: "Acciones",
                    dataIndex: "url",
                    render: (_, row) => <Space>
                        <a href={row.url} target="_blank" rel="noopener noreferrer">
                            <Button type="primary" icon={<DownloadOutlined/>}>
                                Descargar
                            </Button>
                        </a>
                        {row.original_uri && <a href={row.original_uri} target="_blank" rel="noopener noreferrer">
                          <Button icon={<LinkOutlined/>}>
                            Ir a fuente
                          </Button>
                        </a>}
                    </Space>
                }]}
            />
        </div>
    </PageHeader>
}

function mapDSToFolder(ds: string) {
    if (ds === 'ande_exonerados') return 'ande';
    if (ds === 'essap_exonerados') return 'essap';
    return ds;
}

function mapDSToName(ds: string) {

    if (ds === 'ande_exonerados') return 'ANDE';
    if (ds === 'essap_exonerados') return 'ESSAP';
    if (ds === 'hacienda_employees') return 'Hacienda';
    if (ds === 'tsje_elected') return 'TSJE';
    return ds;
}
