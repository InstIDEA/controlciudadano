import * as React from 'react';
import {useMemo, useState} from 'react';
import {Card, List, PageHeader, Table} from 'antd';
import {Affidavit, AsyncHelper} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {filterRedashList} from '../RedashAPI';
import {formatMoney, formatSortableDate} from '../formatters';
import {FilePdfOutlined, ShareAltOutlined} from '@ant-design/icons';
import {BaseDatosPage} from '../components/BaseDatosPage';
import {SearchBar} from '../components/SearchBar';
import {DisclaimerComponent} from '../components/Disclaimer';
import {useDJBRStats} from "../hooks/useStats";
import {useRedashApi} from "../hooks/useApi";

export function AffidavitList() {

    const stats = useDJBRStats();
    const data = useRedashApi(19);
    const history = useHistory();
    const [query, setQuery] = useState('');

    const filtered = useMemo(() => filterRedashList(AsyncHelper.or(data, []), query, [
        'name',
        'document',
        'year'
    ]), [data, query]);

    return <BaseDatosPage menuIndex="affidavit" headerExtra={
        <SearchBar defaultValue={query || ''} onSearch={setQuery}/>
    }>
        <PageHeader ghost={false}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => history.push('/')}
                    title="Declaraciones Juradas de Bienes y Rentas de Funcionarios públicos"
                    subTitle=""
                    backIcon={null}>


            <DisclaimerComponent>
                Lista de las declaraciones juradas <b>públicas</b> que han sido publicadas al portal
                de la <a href="https://djbpublico.contraloria.gov.py/index.php"> Contraloría General de la
                República</a>.

                <br/>
                No contamos con todas las declaraciones juradas, pues las mismas se actualizan a diario,
                esta lista fue actualizada por última vez el {formatSortableDate(stats.last_success_fetch)}
            </DisclaimerComponent>


            <Table<Affidavit> dataSource={filtered}
                              className="hide-responsive"
                              loading={data.state === 'FETCHING'}
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
                                  render: document => <Link to={`/person/${document}`}>{document}</Link>,
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
                                  title: 'Acciones',
                                  render: (_, row) => <div style={{fontSize: '1.5em'}}>
                                      <a href={row.linksandwich || row.link} target="_blank"
                                         rel="noopener noreferrer"
                                         title="Ver">
                                          <FilePdfOutlined/>
                                      </a>
                                      <a href={row.source} target="_blank" rel="noopener noreferrer" title="Fuente">
                                          <ShareAltOutlined/>
                                      </a>
                                  </div>
                              }]}/>
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
                dataSource={filtered}
                loading={data.state === 'FETCHING'}
                renderItem={(r: Affidavit) =>
                    <List.Item className="list-item">
                        <Card bordered={false}>
                            Documento: <Link to={`/person/${r.document}`}>{r.document}</Link>
                            <br/>
                            Nombre: {r.name}
                            <br/>
                            Año (revision): {r.year} ({r.revision})
                            <br/>
                            Activos: {r.actives === undefined || r.actives === null
                            ? <span>Ayudanos a completar!</span>
                            : formatMoney(r.actives)}
                            <br/>
                            Pasivos: {r.passive === undefined || r.passive === null
                            ? <span>Ayudanos a completar!</span>
                            : formatMoney(r.passive)}
                            <br/>
                            Patrimonio Neto: {r.networth === undefined || r.networth === null
                            ? <span>Ayudanos a completar!</span>
                            : formatMoney(r.networth)}
                            <br/>
                            <div style={{fontSize: '1.5em'}}>
                                <a href={r.linksandwich || r.link} target="_blank" rel="noopener noreferrer"
                                   title="Ver">
                                    <FilePdfOutlined/>
                                </a>
                                <a href={r.source} target="_blank" rel="noopener noreferrer" title="Fuente">
                                    <ShareAltOutlined/>
                                </a>
                            </div>

                        </Card>
                    </List.Item>
                }
            >
            </List>
        </PageHeader>
    </BaseDatosPage>;
}
