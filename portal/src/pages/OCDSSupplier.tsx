import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {OCDSSupplierContract, OCDSSupplierRelation, Supplier} from '../Model';
import {SimpleApi} from '../SimpleApi';
import {Checkbox, message, PageHeader, Table, Tabs} from 'antd';
import {useHistory, useParams} from 'react-router-dom';
import {formatIsoDate, formatMoney} from '../formatters';
import {SupplierDescription} from '../components/SupplierDescription';
import {RedashAPI} from '../RedashAPI';
import {RelationGraph} from '../components/graphs/RelationGraph';
import {toGraph} from './OCDSSupplierRelations';
import {SupplierRelationsTable} from '../components/SupplierRelationsTable';
import {getTenderLink} from './OCDSAwardItemsPage';
import {BooleanParam, useQueryParam} from 'use-query-params';
import {Header} from "../components/layout/Header";

export function OCDSSupplier() {

    const {ruc} = useParams<{ ruc: string }>();
    const history = useHistory();
    const [data, setData] = useState<Supplier>();
    const [onlyCovid, setOnlyCovid] = useQueryParam('onlyCovid', BooleanParam);

    const [contracts, setContracts] = useState<OCDSSupplierContract[]>();
    const [page, setPage] = useState({page: 1, pageSize: 100});

    useEffect(() => {
        new SimpleApi().getSupplier(ruc)
            .then(d => setData(d.data))
            .catch(e => {
                message.warn("Can't fetch supplier")
                console.warn(e)
            })
        ;
    }, [ruc]);

    useEffect(() => {
        setContracts(undefined);
        new SimpleApi().getSupplierContracts(ruc, page)
            .then(d => setContracts(d.data));
    }, [ruc, page]);

    const finalContracts = contracts
        ? contracts.filter(c => c.is_covid === !!onlyCovid)
        : [];


    return <>
        <Header tableMode={true}/>
        <PageHeader ghost={false}
                    onBack={() => history.goBack()}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    title={data ? `${data.name}` : 'Cargando...'}
                    subTitle="CDS - IDEA"
                    extra={[
                        <Checkbox key="onlyCovid" checked={!!onlyCovid} onChange={_ => setOnlyCovid(a => !a)}>
                            Solo fondos de emergencia
                        </Checkbox>
                    ]}
                    footer={<Tabs defaultActiveKey="CONTRACTS">
                        <Tabs.TabPane tab="Contratos" key="CONTRACTS">
                            <ContractsTable contracts={finalContracts} page={page} setPage={setPage}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Asociaciones" key="RELATIONS">
                            <SupplierRelations ruc={ruc}/>
                        </Tabs.TabPane>
                    </Tabs>}>

            <div className="content">
                <div className="main">
                    {data && <SupplierDescription data={data} columns={2}/>}
                </div>
            </div>


        </PageHeader>
    </>
}

export function ContractsTable(props: {
    contracts: OCDSSupplierContract[],
    page: { page: number, pageSize: number },
    setPage: (page: { page: number, pageSize: number }) => void
}) {
    return <Table<OCDSSupplierContract>
        dataSource={props.contracts}
        loading={!props.contracts}
        rowKey="ruc"
        size="small"
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
            key: 'process_slug',
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
            dataIndex: 'sign_date',
            title: 'Fecha de firma',
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
    ruc: string,
}) {

    const {ruc} = props;
    const [data, setData] = useState<OCDSSupplierRelation[]>();

    useEffect(() => {
        new RedashAPI()
            .getRelations()
            .then(relations => setData(relations.query_result.data.rows.filter(r => {
                return ruc.endsWith(r.p1ruc) || ruc.endsWith(r.p2ruc);
            })))
    }, [ruc])

    const graph = useMemo(() => toGraph(data), [data]);

    if (!data) return <>Cargando</>;

    if (!data.length) return <>Sin relaciones</>;

    return <Tabs defaultActiveKey="TABLE">
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

