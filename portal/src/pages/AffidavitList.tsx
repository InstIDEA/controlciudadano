import * as React from 'react';
import {Card, List, PageHeader, Result, Table} from 'antd';
import {Affidavit} from '../Model';
import {Link, useHistory} from 'react-router-dom';
import {formatMoney, formatToDay} from '../formatters';
import {FilePdfOutlined, ShareAltOutlined} from '@ant-design/icons';
import {BaseDatosPage} from '../components/BaseDatosPage';
import {SearchBar} from '../components/SearchBar';
import {DisclaimerComponent} from '../components/Disclaimer';
import {useDJBRStats} from "../hooks/useStats";
import {usePaginatedTable} from "../hooks/usePaginatedTable";


export function AffidavitList() {

    const stats = useDJBRStats();
    const data = usePaginatedTable<Affidavit>('contralory/declarations');
    const history = useHistory();

    if (data.hasError) {
        return <Result status="error" title="Error obteniendo datos"/>
    }

    return <BaseDatosPage menuIndex="affidavit" headerExtra={
        <SearchBar defaultValue={''} onSearch={val => data.updateFilters(guestQuery(val))}/>
    }>
        <PageHeader ghost={false}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    onBack={() => history.push('/')}
                    title="Declaraciones Juradas de Bienes y Rentas de Funcionarios públicos"
                    backIcon={null}>

            <DisclaimerComponent>
                Lista de las declaraciones juradas <b>públicas</b> que han sido publicadas al portal
                de la <a href="https://djbpublico.contraloria.gov.py/index.php"> Contraloría General de la
                República</a>.

                <br/>
                No contamos con todas las declaraciones juradas, pues las mismas se actualizan a diario,
                esta lista fue actualizada por última vez el {formatToDay(stats.last_success_fetch)}
            </DisclaimerComponent>


            <Table<Affidavit> dataSource={data.rows}
                              className="hide-responsive"
                              loading={data.isLoading}
                              rowKey="id"
                              size="small"
                              onChange={data.onChange}
                              pagination={{
                                  defaultCurrent: 1,
                                  defaultPageSize: 10,
                                  total: data.total,
                                  current: data.page
                              }}
                              columns={[{
                                  dataIndex: 'document',
                                  title: 'Documento',
                                  align: 'right',
                                  render: (document, row) => <Link to={`/person/${document}`}>{row.document}</Link>,
                                  sorter: (a, b) => (a.document || '').localeCompare(b.document)
                              }, {
                                  dataIndex: 'name',
                                  title: 'Nombre',
                                  sorter: (a, b) => (a.name || '').localeCompare(b.name),
                              }, {
                                  dataIndex: 'year',
                                  title: 'Año (revision)',
                                  render: (_, row) => `${row.year} (${row.version})`,
                                  sorter: (a, b) => `${a.year}${a.version}`.localeCompare(`${b.year}${b.version}`)
                              }, {
                                  dataIndex: 'active',
                                  title: 'Activos',
                                  align: 'right',
                                  render: (nw) => nw === undefined || nw === null
                                      ? <span>Ayudanos a completar!</span>
                                      : formatMoney(nw),
                                  sorter: (a, b) => (a.active || 0) - (b.active || 0)
                              }, {
                                  dataIndex: 'passive',
                                  title: 'Pasivos',
                                  align: 'right',
                                  render: (nw) => nw === undefined || nw === null
                                      ? <span>Ayudanos a completar!</span>
                                      : formatMoney(nw),
                                  sorter: (a, b) => (a.passive || 0) - (b.passive || 0)
                              }, {
                                  dataIndex: 'net_worth',
                                  title: 'Patrimonio neto',
                                  align: 'right',
                                  defaultSortOrder: 'descend',
                                  render: (nw) => nw === undefined || nw === null
                                      ? <span>Ayudanos a completar!</span>
                                      : formatMoney(nw),
                                  sorter: (a, b) => (a.net_worth || 0) - (b.net_worth || 0)
                              }, {
                                  dataIndex: '',
                                  title: 'Acciones',
                                  render: (_, row) => <div style={{fontSize: '1.5em'}}>
                                      <a href={fixLink(row.link_sandwich || row.link)} target="_blank"
                                         rel="noopener noreferrer"
                                         title="Ver">
                                          <FilePdfOutlined/>
                                      </a>
                                      <a href={fixLink(row.source)} target="_blank" rel="noopener noreferrer"
                                         title="Fuente">
                                          <ShareAltOutlined/>
                                      </a>
                                  </div>
                              }]}/>
            <List className="show-responsive"
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
                      position: "bottom",
                      current: data.page,
                      total: data.total,
                      onChange: data.setPage,
                      onShowSizeChange: data.setPageSize
                  }}
                  dataSource={data.rows}
                  loading={data.isLoading}
                  renderItem={(r: Affidavit) =>
                      <List.Item className="list-item">
                          <Card bordered={false}>
                              Documento: <Link to={`/person/${r.document}`}>{r.document}</Link>
                              <br/>
                              Nombre: {r.name}
                              <br/>
                              Año (revision): {r.year} ({r.version})
                              <br/>
                              Activos: {r.active === undefined || r.active === null
                              ? <span>Ayudanos a completar!</span>
                              : formatMoney(r.active)}
                              <br/>
                              Pasivos: {r.passive === undefined || r.passive === null
                              ? <span>Ayudanos a completar!</span>
                              : formatMoney(r.passive)}
                              <br/>
                              Patrimonio Neto: {r.net_worth === undefined || r.net_worth === null
                              ? <span>Ayudanos a completar!</span>
                              : formatMoney(r.net_worth)}
                              <br/>
                              <div style={{fontSize: '1.5em'}}>
                                  <a href={fixLink(r.link_sandwich || r.link)} target="_blank"
                                     rel="noopener noreferrer" title="Ver">
                                      <FilePdfOutlined/>
                                  </a>
                                  <a href={fixLink(r.source)} target="_blank" rel="noopener noreferrer" title="Fuente">
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

function fixLink(link: string) {
    return (link || '').replace(/ /g, "");
}

function guestQuery(val: string): Partial<Affidavit> {
    if (!val || val === '') return {};
    const asNum = parseInt(val);
    if (!isNaN(asNum)) {
        if (asNum < 9999) return {year: asNum};
        else return {document: `${asNum}`};
    }
    return {name: val};
}
