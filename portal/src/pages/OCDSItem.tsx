import * as React from 'react';
import {useEffect, useState} from 'react';
import {Link, useHistory, useParams} from 'react-router-dom';
import {SimpleApi} from '../SimpleApi';
import {OCDSItemAwardInfo, OCDSItemPriceEvolution, OCDSItemRelatedParty, OCDSItemTenderInfo, Supplier} from '../Model';
import {
    Checkbox,
    Col,
    Descriptions,
    Layout,
    message,
    PageHeader,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Timeline,
    Tooltip
} from 'antd';
import {formatIsoDate, formatMoney, formatNumber, formatSecondsDuration, formatSortableDate} from '../formatters';
import {getTenderLink} from './OCDSAwardItemsPage';
import {ItemPriceEvolutionGraph} from '../components/graphs/ItemPriceEvolutionGraph';
import {InfoCircleOutlined} from '@ant-design/icons';
import {OCDSPartyTable} from '../components/OCDSPartyTable';
import {Edge, Graph, Node, RelationGraph} from '../components/graphs/RelationGraph';
import {IMPORTANT_RELATIONS, PARTY_ROLES} from '../Constants';
import {Card} from 'antd/es';
import {SupplierDescription} from '../components/SupplierDescription';
import {BaseDatosPage} from '../components/BaseDatosPage';

export function OCDSItem() {

    const {itemId} = useParams<{itemId: string}>();
    const history = useHistory();

    const [data, setData] = useState<OCDSItemAwardInfo[]>();

    useEffect(() => {
        new SimpleApi().getItemInfo(itemId)
            .then(d => setData(d.data))
            .catch(e => message.warn("No se encuentra el item"))
        ;
    }, [itemId]);

    const header = getHeader(data);

    return <BaseDatosPage headerExtra={false}
                          menuIndex="1">

        <PageHeader ghost={false}
                    onBack={() => history.goBack()}
                    backIcon={null}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    title={data ? `${header.name}` : 'Cargando...'}
                    subTitle=""
                    footer={<Tabs defaultActiveKey="PARTIES">
                        <Tabs.TabPane tab="Llamados" key="PROCESS">
                            {data && <OCDSItemDetailTable data={data}/>}
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Evolución de precios" key="EVOLUTION">
                            <PriceEvolutionTab id={itemId}/>
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="Participantes" key="PARTIES">
                            {data && <PartyTab header={header}/>}
                        </Tabs.TabPane>
                    </Tabs>}>

            <div className="content">
                <div className="main">
                    {data && <Descriptions column={2} size="small">
                      <Descriptions.Item label="Nombre">{header.name}</Descriptions.Item>
                      <Descriptions.Item label="ID">{header.id}</Descriptions.Item>
                      <Descriptions.Item label="Llamados">{header.processCount}</Descriptions.Item>
                      <Descriptions.Item label="Concursantes">
                        <Space>
                          <Tooltip title="Cantidad total de concursantes. Puede haber duplicados.">
                            <InfoCircleOutlined/>
                          </Tooltip>
                            {header.tendersCount}
                        </Space>
                      </Descriptions.Item>
                        {Object.keys(header.totalAmount).map(currency =>
                            <Descriptions.Item label={`Total ${currency}`} key={currency}>
                                {formatMoney(header.totalAmount[currency], currency)}
                            </Descriptions.Item>)
                        }
                    </Descriptions>}
                </div>
            </div>


        </PageHeader>
    </BaseDatosPage>
}

/**
 * Widget that fetchs the price evolution and shows it in a table
 */
function PriceEvolutionTab(props: { id: string }) {
    const [data, setData] = useState<OCDSItemPriceEvolution[]>();
    const [selected, setSelected] = useState<string>()
    const [adjusted, setAdjusted] = useState(true);
    const [log, setLog] = useState(false);

    useEffect(() => {
        new SimpleApi().getItemPriceEvolution(props.id)
            .then(c => setData(c.data))
    }, [props.id])

    if (!data) return <div>Cargando ... </div>;

    const groups = groupBy(data, row => `${row.presentation || 'N/A'} - ${row.unit || 'N/A'}`);
    console.log(groups);
    const keys = Object.keys(groups).sort((k1, k2) => groups[k2].count - groups[k1].count);
    const def = keys.length > 0 ? keys[0] : undefined;
    const graphData = selected ? groups[selected].rows : def ? groups[def].rows : undefined;


    return <Row style={{
        width: '100%',
        height: '100%'
    }}>
        <Col span={20}>
            {graphData && <ItemPriceEvolutionGraph points={graphData} adjusted={adjusted} log={log}/>}
        </Col>
        <Col span={4}>
            <Select defaultValue={selected || def} onChange={setSelected}>
                {keys.map(k => <Select.Option value={k} key={k}>{k} ({groups[k]?.count} muestras)</Select.Option>)}
            </Select> <br/>
            <Checkbox checked={adjusted} onChange={_ => setAdjusted(a => !a)}>Ajustado por inflación</Checkbox> <br/>
            <Checkbox checked={log} onChange={_ => setLog(a => !a)}>Escala logarítmica</Checkbox><br/>
            <Space>
                <Tag color="#ff4645">COVID</Tag>
                <Tag color="#e8c1a0">Pre-COVID</Tag>
            </Space>
        </Col>
    </Row>
}


/**
 * Widget that shows the information about the related parties in various ways
 *
 * @param props the identifier to fetch data.
 */
function PartyTab(props: { header: HeaderData }) {

    const [data, setData] = useState<OCDSItemRelatedParty[]>();
    const [party, setParty] = useState<Supplier>();

    useEffect(() => {
        new SimpleApi().getItemParties(props.header.id)
            .then(c => setData(c.data))
    }, [props.header.id])

    function selectParty(id?: string) {
        if (!id || !data) {
            setParty(undefined);
            return;
        }

        new SimpleApi().getSupplier(id)
            .then(d => setParty(d.data))
            .catch(e => console.log(e))

        return;
    }

    if (!data) return <div>Cargando ...</div>;

    const graph = toGraph(data, props.header);

    return <Tabs defaultActiveKey="TABLE">
        <Tabs.TabPane tab="Tabla" key="TABLE">
            <OCDSPartyTable parties={data}/>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Relaciones" key="GRAPH">
            <Layout>
                <Layout.Content>
                    <div style={{width: '100%', height: '80vh', zIndex: 10000}}>
                        <RelationGraph edges={graph.edges}
                                       nodes={graph.nodes}
                                       randomize={false}
                                       onSelect={selectParty}
                                       type="none"
                        />
                    </div>
                </Layout.Content>
                <Layout.Sider style={{
                    background: '#ececec',
                    padding: 10
                }} width={400}>
                    <Space direction="vertical" style={{width: '100%'}}>
                        {party && <Card
                          title={<Link to={`/ocds/suppliers/${party.ruc}`}>{party.name}</Link>}>
                            {data && <SupplierDescription data={party} columns={1}/>}
                        </Card>}
                        <Card title="Relaciones"
                              bordered={false}
                              style={{width: '100%'}}>
                            <Timeline>
                                {Object.keys(PARTY_ROLES)
                                    .filter(role => IMPORTANT_RELATIONS[role] || false)
                                    .map(type =>
                                        <Timeline.Item color={PARTY_ROLES[type].color}
                                                       key={type}>
                                            <span> {PARTY_ROLES[type].title} </span><br/>
                                            <small>{PARTY_ROLES[type].description}</small>
                                        </Timeline.Item>)}
                            </Timeline>
                        </Card>
                        <Card title="Nodos"
                              bordered={false}
                              style={{width: '100%'}}>
                            <Timeline>
                                {Object.keys(NODE_COLORS).map(type =>
                                    <Timeline.Item color={NODE_COLORS[type]} key={type}>
                                        <span>
                                            {type}
                                        </span>
                                    </Timeline.Item>)}
                            </Timeline>
                        </Card>

                    </Space>
                </Layout.Sider>
            </Layout>

        </Tabs.TabPane>
    </Tabs>
}

/**
 * Table that show complex data about a item
 */
function OCDSItemDetailTable(props: { data: OCDSItemAwardInfo[] }) {

    return <Table<OCDSItemAwardInfo>
        rowKey={d => `${d.unit}${d.currency}${d.presentation}`}
        dataSource={props.data}
        expandable={{
            expandedRowRender: record => <TenderSubTable data={record.tenders}/>,
            rowExpandable: record => parseInt(record.count) > 0,
        }}
        columns={[{
            title: 'Presentación',
            dataIndex: 'presentation'
        }, {
            title: 'Unidad',
            dataIndex: 'unit'
        }, {
            title: 'Cantidad',
            dataIndex: 'quantity',
            align: 'right',
            render: it => formatNumber(it)
        }, {
            title: 'Llamados',
            dataIndex: 'count',
            align: 'right',
        }, {
            title: 'Concursantes',
            dataIndex: 'total_tenders',
            align: 'right',
            render: (_, r) => r.total_tenders
                ? `${r.total_tenders} (${formatNumber(r.avg_tenders, 2)} prom)`
                : 'N/A'
        }, {
            title: 'Promedio',
            dataIndex: 'avg_amount',
            align: 'right',
            render: (_, r) => <>
                {formatMoney(r.avg_amount, r.currency)} <br/>
                Max: {formatMoney(r.max_amount, r.currency)} <br/>
                Min: {formatMoney(r.min_amount, r.currency)}
            </>,
            sorter: (a, b) => parseInt(a.avg_amount) - parseInt(b.avg_amount),
        }, {
            title: 'Total',
            dataIndex: 'total_amount',
            align: 'right',
            defaultSortOrder: 'descend',
            render: (_, r) => formatMoney(r.total_amount, r.currency),
            sorter: (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount),
        },]}
    />

}

function TenderSubTable(props: { data: OCDSItemTenderInfo[] }) {

    return <Table<OCDSItemTenderInfo>
        dataSource={props.data}
        rowKey="slug"
        columns={[{
            title: 'Llamado',
            dataIndex: 'title',
            render: (_, r) => <>
                <a href={getTenderLink(r.slug, r.method)} target="__blank" rel="noopener noreferrer">
                    {r.title}
                </a>
            </>
        }, {
            title: 'Adjudicado',
            dataIndex: 'supplier',
            render: (_, r) => r.supplier
                ? <Link to={`/ocds/suppliers/${r.supplier.id}`}>
                    {r.supplier.name}
                    <br/>
                    <small>{r.supplier.id}</small>
                </Link>
                : 'N/A',
        }, {
            title: 'Nombre en licitación',
            dataIndex: 'local_name'
        }, {
            title: 'Método',
            dataIndex: 'method_description'
        }, {
            title: 'Estado',
            dataIndex: 'status',
        }, {
            title: 'Concursantes',
            dataIndex: 'total_tenders',
            align: 'right',
            render: (_, r) => r.tenders || 'N/A'
        }, {
            title: 'Fecha',
            dataIndex: 'date_start',
            defaultSortOrder: 'descend',
            render: (_, t) => `${formatIsoDate(t.date)}`,
            sorter: (a, b) => formatSortableDate(a.date).localeCompare(formatSortableDate(b.date)),

        }, {
            title: 'Fecha firma de contrato',
            dataIndex: 'sign_date',
            render: (_, t) => {
                if (!t.process_duration) return formatIsoDate(t.sign_date);
                return `${formatIsoDate(t.sign_date)} (total ${formatSecondsDuration(parseInt(t.process_duration))})`
            }
        }, {
            title: 'Tags',
            dataIndex: 'flags',
            render: (_, t) => (t.flags || []).sort().map(f => <Tag key={f}>{f}</Tag>)
        }, {
            title: 'Total',
            dataIndex: 'total',
            align: 'right',
            render: (_, r) => formatMoney(r.total, r.currency),
            sorter: (a, b) => parseFloat(a.total) - parseFloat(b.total),
        }]}
    />
}

type HeaderData = ReturnType<typeof getHeader>;

function getHeader(data?: OCDSItemAwardInfo[]) {
    if (!data || data.length === 0) return {
        id: '',
        name: 'Loading',
        processCount: 0,
        tendersCount: 0,
        totalAmount: {},
    };

    const processCount = data.map(t => t.count || '0')
        .reduce((p, c) => p + parseInt(c), 0);

    const totalAmount = data
        .reduce<{ [k: string]: number }>((p, c) => {
            if (p[c.currency]) return {
                ...p,
                [c.currency]: p[c.currency] + parseFloat(c.total_amount)
            };
            else return {
                ...p,
                [c.currency]: parseFloat(c.total_amount)
            }
        }, {});

    const tendersCount = data.map(t => t.total_tenders || '0')
        .reduce((p, c) => p + parseInt(c), 0);

    return {
        id: data[0].id,
        name: data[0].name,
        processCount,
        tendersCount,
        totalAmount
    }
}


type GroupedData<T> = { [k: string]: T & { count: number, rows: T[] } };

export function groupBy<T>(data: T[], keyProducer: (t: T) => string): GroupedData<T> {

    const count: GroupedData<T> = {};

    (data || []).forEach(d => {
        const key = keyProducer(d);
        if (count[key]) {
            count[key].count++;
            count[key].rows = count[key].rows.concat(d);
        } else {
            count[key] = {...d, count: 1, rows: [d]}
        }
    });

    return count;
}

const NODE_COLORS: { [k: string]: string } = {
    "Entidad": "#000000",
    "Llamado": "rgba(236,189,8,0.97)",
    "Participante": "#CCCCCC"
}

export function toGraph(data?: OCDSItemRelatedParty[], item?: HeaderData): Graph {
    if (!data || !item) return {edges: [], nodes: []};
    const edges = new Map<string, Edge>();
    const nodes = new Map<string, Node>();

    // nodes.set(item.id, {id: item.id, label: item.name, color: '#000000'});

    const defColor = 'black';

    data.forEach(d => {
        const isBuy = (d.roles || []).every(role => ['buyer', 'procuringEntity', 'payer'].includes(role));
        nodes.set(d.party_id, {
            id: d.party_id,
            label: d.party_name,
            color: isBuy ? NODE_COLORS.Entidad : NODE_COLORS.Participante
        });
        nodes.set(d.slug, {id: d.slug, label: d.tender_title, color: NODE_COLORS.Llamado});

        (d.roles || [])
            .filter(role => IMPORTANT_RELATIONS[role] || false)
            .forEach(role => {
                const key = `${d.party_id}_${d.slug}_${role}`;
                if (edges.has(key))
                    return;
                edges.set(key, {
                    label: PARTY_ROLES[role] ? PARTY_ROLES[role].title : role,
                    source: d.slug,
                    target: d.party_id,
                    id: key,
                    color: PARTY_ROLES[role] ? PARTY_ROLES[role].color : defColor
                })
            })
    })

    const L = nodes.size / 10;
    const N = 300;

    const finalNodes = Array.from(nodes.values()).map((n, i) => ({
        ...n,
        x: L * Math.cos(Math.PI * 2 * i / N - Math.PI / 2),
        y: L * Math.sin(Math.PI * 2 * i / N - Math.PI / 2),
        // x: i % L,
        // y: Math.floor(i / L),

    }));

    return {
        edges: Array.from(edges.values()),
        nodes: Array.from(finalNodes)
    }
}
