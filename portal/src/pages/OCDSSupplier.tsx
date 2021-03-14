import * as React from 'react';
import {useMemo, useState} from 'react';
import {Async, AsyncHelper, OCDSSupplierContract, OCDSSupplierRelation} from '../Model';
import {SimpleApi} from '../SimpleApi';
import {Checkbox, PageHeader, Result, Table, Tabs} from 'antd';
import {Link, useHistory, useParams} from 'react-router-dom';
import {SupplierDescription} from '../components/SupplierDescription';
import {BooleanParam, useQueryParam} from 'use-query-params';
import {Header} from "../components/layout/Header";
import {useMediaQuery} from "@react-hook/media-query";
import {AsyncRenderer} from "../components/AsyncRenderer";
import {getTenderLink} from "./OCDSAwardItemsPage";
import {formatIsoDate, formatMoney} from "../formatters";
import {toGraph} from "./OCDSSupplierRelations";
import {SupplierRelationsTable} from "../components/SupplierRelationsTable";
import {RelationGraph} from "../components/graphs/RelationGraph";
import {useApi, useRedashApi} from "../hooks/useApi";
import {ApiError} from "../RedashAPI";
import {SupplierDashBoard} from "../components/ocds/SupplierDashboard";

export function OCDSSupplier() {

    const {ruc} = useParams<{ ruc: string }>();
    const history = useHistory();
    const data = useApi(new SimpleApi().getSupplier, [ruc]);
    const [onlyCovid, setOnlyCovid] = useQueryParam('onlyCovid', BooleanParam);

    const [page, setPage] = useState({page: 1, pageSize: 100});
    const contracts = useApi(new SimpleApi().getSupplierContracts, [ruc, page])

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');

    // TODO fetch only this supplier relations
    const allRelations = useRedashApi(18);
    const relations = useMemo(() => AsyncHelper.filter(allRelations, r => {
        return ruc.endsWith(r.p1ruc) || ruc.endsWith(r.p2ruc);
    }), [allRelations, ruc])

    const finalContracts = AsyncHelper
        .map(contracts.data, result => result.data.filter(c => c.is_covid === !!onlyCovid))


    return <>
        <Header tableMode={true}/>
        <AsyncRenderer resourceName={`Proveedor ${ruc}`}
                       data={data.data}
                       refresh={data.refresh}>
            {supplier => <PageHeader ghost={false}
                                     onBack={() => history.goBack()}
                                     style={{border: '1px solid rgb(235, 237, 240)'}}
                                     title={supplier.data.name}
                                     subTitle=""
                                     extra={[
                                         <Checkbox key="onlyCovid" checked={!!onlyCovid}
                                                   onChange={_ => setOnlyCovid(a => !a)}>
                                             Solo fondos de emergencia
                                         </Checkbox>
                                     ]}
                                     footer={<Tabs defaultActiveKey="DASHBOARD">
                                         <Tabs.TabPane tab="Datos" key="DASHBOARD">
                                             <SupplierDashBoard contracts={finalContracts}
                                                                header={supplier.data}
                                                                relations={relations}/>
                                         </Tabs.TabPane>
                                         <Tabs.TabPane tab="Contratos" key="CONTRACTS">
                                             {/*TODO replace for dynamic table*/}
                                             <AsyncRenderer resourceName={`Contratos de ${supplier.data.name}`}
                                                            loadingText={["Obteniendo contratos", `Cargando datos de ${supplier.data.name}`]}
                                                            data={finalContracts} refresh={contracts.refresh}>
                                                 {c => <ContractsTable contracts={c}
                                                                       page={page}
                                                                       setPage={setPage}
                                                                       isSmall={isSmall}/>}
                                             </AsyncRenderer>
                                         </Tabs.TabPane>
                                         <Tabs.TabPane tab="Asociaciones" key="RELATIONS">
                                             <SupplierRelations name={supplier.data.name}
                                                                relations={relations}
                                             />
                                         </Tabs.TabPane>
                                     </Tabs>}>
                <div className="content">
                    <div className="main">
                        {data && <SupplierDescription data={supplier.data} columns={2}/>}
                    </div>
                </div>
            </PageHeader>
            }
        </AsyncRenderer>
    </>

}

export function ContractsTable(props: {
    contracts: OCDSSupplierContract[],
    page: { page: number, pageSize: number },
    setPage: (page: { page: number, pageSize: number }) => void,
    isSmall: boolean
}) {
    return <Table<OCDSSupplierContract>
        dataSource={props.contracts}
        loading={!props.contracts}
        rowKey="tender_slug"
        size="small"
        scroll={{
            x: props.isSmall ? 1000 : undefined
        }}
        pagination={{
            pageSize: props.page.pageSize,
            onChange: (p) => props.setPage({page: p, pageSize: props.page.pageSize}),
            onShowSizeChange: (_, ps) => props.setPage({
                page: props.page.page,
                pageSize: ps
            }),
            total: 100,
            current: props.page.page
        }}
        columns={[{
            key: 'tender_slug',
            title: 'Llamado',
            render: (_, r) => {
                const url = getTenderLink(r.tender_slug, r.procurement_method)
                return <a href={url}>
                    {r.tender_title}
                </a>
            },
            sorter: (a, b) => (a.tender_title || '')
                .localeCompare(b.tender_title),
        }, {
            key: 'buyer_id',
            title: 'Entidad Contratante',
            render: (_, r) => {
                return r.buyer_id
                    ? <Link to={`/ocds/buyer/${r.buyer_id}`}> {r.buyer_name} </Link>
                    : null
            },
            sorter: (a, b) => (a.buyer_name || '')
                .localeCompare(b.buyer_name),
        }, {
            dataIndex: 'contract_id',
            title: 'Contrato',
            align: 'right',
            render: (_, r) => <a
                href={`https://contrataciones.gov.py/licitaciones/adjudicacion/contrato/${r.contract_award_id}.html`}>
                {r.contract_id}
            </a>,
            sorter: (a, b) => (a.contract_id || '')
                .localeCompare(b.contract_id),
        }, {
            dataIndex: 'amount',
            title: 'Monto',
            align: 'right',
            render: (amount, row) => formatMoney(amount, row.currency),
            sorter: (a, b) => parseInt(a.amount) - parseInt(b.amount)
        }, {
            dataIndex: 'published_date',
            title: 'Fecha de publicación',
            align: 'right',
            render: sign => formatIsoDate(sign),
            sorter: (a, b) => (a.published_date || '')
                .localeCompare(b.published_date),
        }, {
            dataIndex: 'sign_date',
            title: 'Fecha de firma de contrato',
            align: 'right',
            render: sign => formatIsoDate(sign),
            sorter: (a, b) => (a.sign_date || '')
                .localeCompare(b.sign_date),
        }]}
        title={pageData => {
            if (!pageData.length) return null;
            const sum = pageData.map(pd => parseInt(pd.amount))
                .reduce((a, b) => a + b, 0);
            return <p>
                En <b>{pageData.length}</b> contratos, se le adjudico un total
                de <b>{formatMoney(sum, 'PYG')}</b>
            </p>
        }}
    />
}


export function SupplierRelations(props: {
    name: string,
    relations: Async<OCDSSupplierRelation[], ApiError>
}) {

    const graph = useMemo(() => toGraph(AsyncHelper.or(props.relations, [])), [props.relations]);

    return <AsyncRenderer resourceName={`Relaciones de ${props.name}`}
                          data={props.relations}>
        {data => data.length === 0
            ? <Result title={`El proveedor ${props.name} no tiene relaciones`}/>
            : <Tabs defaultActiveKey="TABLE">
                <Tabs.TabPane tab="Tabla" key="TABLE">
                    <SupplierRelationsTable data={data} showOrigin={false}/>
                </Tabs.TabPane>
                <Tabs.TabPane tab="Grafico" key="RELATIONS">
                    <RelationGraph nodes={graph.nodes}
                                   edges={graph.edges}
                                   onSelect={() => null}
                    />
                </Tabs.TabPane>
            </Tabs>
        }
    </AsyncRenderer>

}

