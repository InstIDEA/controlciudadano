import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { OCDSSupplierRelation, Supplier } from '../Model';
import { Layout, PageHeader, Space, Timeline, Spin, Typography } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { Edge, Graph, Node, RelationGraph } from '../components/graphs/RelationGraph';
import { RedashAPI } from '../RedashAPI';
import { Card } from 'antd/es';
import { SimpleApi } from '../SimpleApi';
import { SupplierDescription } from '../components/SupplierDescription';
import { RELATIONS_COLORS, RELATIONS_NAMES } from '../Constants';
import { BaseDatosPage } from '../components/BaseDatosPage';

const colors = RELATIONS_COLORS;
const names = RELATIONS_NAMES;


export function OCDSSupplierRelations() {

    const [data, setData] = useState<OCDSSupplierRelation[]>();
    const [actives, setActives] = useState<string[]>(['OCDS_SAME_LEGAL_CONTACT'])
    const [selected, setSelected] = useState<string>();
    const history = useHistory();
    const isExploreMenu = history.location.pathname.includes('explore');

    useEffect(() => {
        new RedashAPI('a2kmZeR9AdGeldeP0RXg2JWSZeevSA62xzpN15jb')
            .getRelations()
            .then(d => setData(d.query_result.data.rows));
        // .then(d => setData(d.query_result.data.rows.slice(0, 2000)));
    }, [])

    const graph = useMemo(() => toGraph(data), [data]);

    const filter = useCallback((node: Edge) => {
        return actives.length === 0 || actives.includes(node.label)
    }, [actives])

    function toggle(type: string) {
        if (actives.includes(type)) setActives(actives.filter(a => a !== type));
        else setActives([...actives, type]);
    }

    return <BaseDatosPage menuIndex="relations" sidebar={isExploreMenu}>
        <PageHeader ghost={false}
            onBack={() => history.push('')}
            backIcon={null}
            style={{ border: '1px solid rgb(235, 237, 240)' }}
            title={"¿Tienen vínculos a quienes se compró?Relaciones ente proveedores"}
            subTitle="CDS - IDEA"
        >
             <Typography.Paragraph>
                Grafo de relación entre proveedores con igual dirección o número de contacto
            </Typography.Paragraph>
            <Layout>
                <Layout>
                    <Layout.Content>
                        {data && <RelationGraph nodes={graph.nodes}
                            edges={graph.edges}
                            onSelect={setSelected}
                            filterEdge={filter}
                        />}
                        {!data && 'Cargando ...'}
                    </Layout.Content>
                    <Layout.Sider style={{
                        background: '#ececec',
                        padding: 10
                    }} width={400}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Card title="Leyenda"
                                bordered={false}
                                style={{ width: '100%' }}>

                                <Timeline>
                                    {Object.keys(colors).map(type => <Timeline.Item color={colors[type]} key={type}>
                                        <span style={{
                                            color: actives.includes(type) ? 'black' : 'gray'
                                        }} onClick={() => toggle(type)}>
                                            {names[type]}
                                        </span>
                                    </Timeline.Item>)}
                                </Timeline>
                            </Card>
                            {selected && <SupplierCard id={selected} />}
                        </Space>
                    </Layout.Sider>
                </Layout>
            </Layout>
        </PageHeader>
    </BaseDatosPage>

}

export function toGraph(data?: OCDSSupplierRelation[]): Graph {
    if (!data) return { edges: [], nodes: [] };
    const edges = new Map<string, Edge>();
    const nodes = new Map<string, Node>();


    const defColor = 'black';

    data.forEach(d => {
        nodes.set(d.p1ruc, { id: d.p1ruc, label: d.p1name, color: '#000000' });
        nodes.set(d.p2ruc, { id: d.p2ruc, label: d.p2name, color: '#000000' });

        if (edges.has(`${d.p1ruc}_${d.p2ruc}_${d.relation}`)
            || edges.has(`${d.p2ruc}_${d.p1ruc}_${d.relation}`)
        )
            return;
        edges.set(`${d.p1ruc}_${d.p2ruc}_${d.relation}`, {
            label: d.relation,
            source: d.p1ruc,
            target: d.p2ruc,
            id: `${d.p1ruc}_${d.p2ruc}_${d.relation}`,
            color: colors[d.relation] || defColor
        })
    })

    return {
        edges: Array.from(edges.values()),
        nodes: Array.from(nodes.values())
    }
}

export function SupplierCard({ id }: { id: string }) {

    const [data, setData] = useState<Supplier>()

    useEffect(() => {
        if (!id) {
            setData(undefined);
            return;
        }
        setData(undefined)
        new SimpleApi()
            .getSupplier(id)
            .then(d => setData(d.data))


    }, [id])

    if (!data) return <><Spin/></>;

    return <Card
        title={<Link to={`/ocds/suppliers/${id}`} target="__blank">{data ? data.name : id}</Link>}
    >
        {data && <SupplierDescription data={data} columns={1} />}
    </Card>
}
