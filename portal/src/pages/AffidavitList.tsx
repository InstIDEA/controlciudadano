import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Input, PageHeader, Table, Typography} from 'antd';
import {Affidavit} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList, RedashAPI} from '../RedashAPI';
import {formatMoney} from '../formatters';
import {FilePdfOutlined, ShareAltOutlined} from '@ant-design/icons';

export function AffidavitList() {

    const [working, setWorking] = useState(false);
    const [data, setData] = useState<Affidavit[]>();
    const history = useHistory();
    const [query, setQuery] = useState('');

    useEffect(() => {
        setWorking(true);
        new RedashAPI('t1vzCahxS5vaNYJ8Fdzn0Fur7oEMAShRqMZPMiTS')
            .getAffidavit()
            .then(d => setData(d.query_result.data.rows))
            .finally(() => setWorking(false))
        ;
    }, []);


    const filtered = useMemo(() => filterRedashList(data || [], query, [
        'name',
        'document',
        'year'
    ]), [data, query]);

    return <PageHeader ghost={false}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       onBack={() => history.push('/')}
                       title="Declaraciones Juradas"
                       subTitle="CDS - IDEA"
                       extra={[
                           <Input.Search placeholder="Buscar"
                                         key="search_input"
                                         defaultValue={query}
                                         onSearch={setQuery}
                                         formMethod="submit"/>
                       ]}>


        <Typography.Paragraph>
            Listado de las declaraciones juradas provenientes de la
            <a href="https://djbpublico.contraloria.gov.py/index.php"> Contraloría General de la República</a>
        </Typography.Paragraph>

        <Table<Affidavit> dataSource={filtered}
                          loading={working}
                          rowKey="id"
                          size="small"
                          pagination={{
                              defaultCurrent: 1,
                              defaultPageSize: 10
                          }}
                          columns={[{
                              dataIndex: 'document',
                              title: 'Documento',
                              align: 'right',
                              render: document => <Link to={`/people/${document}`}>{document}</Link>,
                              sorter: (a, b) => (a.document || '').localeCompare(b.document)
                          }, {
                              dataIndex: 'name',
                              title: 'Nombre',
                              sorter: (a, b) => (a.name || '').localeCompare(b.name),
                          }, {
                              dataIndex: 'year',
                              title: 'Año (revision)',
                              render: (_, row) => `${row.year} (${row.revision})`,
                              sorter: (a, b) => `${a.year}${a.revision}`.localeCompare(`${b.year}${b.revision}`)
                          }, {
                              dataIndex: 'actives',
                              title: 'Activos',
                              align: 'right',
                              render: (nw) => nw === undefined || nw === null
                                  ? <span>Ayudanos a completar!</span>
                                  : formatMoney(nw),
                              sorter: (a, b) => (a.actives || 0) - (b.actives || 0)
                          }, {
                              dataIndex: 'passive',
                              title: 'Pasivos',
                              align: 'right',
                              render: (nw) => nw === undefined || nw === null
                                  ? <span>Ayudanos a completar!</span>
                                  : formatMoney(nw),
                              sorter: (a, b) => (a.passive || 0) - (b.passive || 0)
                          }, {
                              dataIndex: 'networth',
                              title: 'Patrimonio neto',
                              align: 'right',
                              defaultSortOrder: 'descend',
                              render: (nw) => nw === undefined || nw === null
                                  ? <span>Ayudanos a completar!</span>
                                  : formatMoney(nw),
                              sorter: (a, b) => (a.networth || 0) - (b.networth || 0)
                          }, {
                              dataIndex: '',
                              title: 'Links',
                              render: (_, row) => <div style={{fontSize: '1.5em'}}>
                                  <a href={row.linksandwich || row.link} target="_blank" rel="noopener noreferrer"
                                     title="Ver">
                                      <FilePdfOutlined/>
                                  </a>
                                  <a href={row.source} target="_blank" rel="noopener noreferrer" title="Fuente">
                                      <ShareAltOutlined/>
                                  </a>
                              </div>
                          }]}/>
    </PageHeader>

}
