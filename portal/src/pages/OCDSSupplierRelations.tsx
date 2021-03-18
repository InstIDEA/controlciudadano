import * as React from 'react';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {AsyncHelper, OCDSSupplierRelation, Supplier} from '../Model';
import {Layout, PageHeader, Space, Timeline} from 'antd';
import {Link, useHistory} from 'react-router-dom';
import {Edge, Graph, Node, RelationGraph} from '../components/graphs/RelationGraph';
import {Card} from 'antd/es';
import {SupplierDescription} from '../components/SupplierDescription';
import {RELATIONS_COLORS, RELATIONS_NAMES} from '../Constants';
import {BaseDatosPage} from '../components/BaseDatosPage';
import './OCDSSupplierRelations.css';
import {useRedashApi} from "../hooks/useApi";
import {DisclaimerComponent} from "../components/Disclaimer";
import {LoadingGraphComponent} from "../components/ddjj/LoadingGraph";
import {SimpleApi} from "../SimpleApi";

const colors = RELATIONS_COLORS;
const names = RELATIONS_NAMES;


export function OCDSSupplierRelations() {

    const data = useRedashApi(18);
    const [actives, setActives] = useState<Set<string>>(new Set(['OCDS_SAME_LEGAL_CONTACT']))
    const [selected, setSelected] = useState<string>();
    const history = useHistory();

    const graph = useMemo(() => toGraph(AsyncHelper.or(data, [])), [data]);

    const filter = useCallback((node: Edge) => {
        return actives.has(node.label)
    }, [actives])

    function toggle(type: string) {
        setActives(curr => {
            const newActives = new Set(curr)
            if (newActives.has(type)) newActives.delete(type);
            else newActives.add(type);
            return newActives
        });
    }


    return <BaseDatosPage menuIndex="relations">
        <PageHeader ghost={false}
                    onBack={() => history.push('')}
                    backIcon={null}
                    style={{border: '1px solid rgb(235, 237, 240)'}}
                    title="Relaciones ente proveedores ¿Tienen vínculos a quienes se compró?"
                    subTitle=""
        >
            <DisclaimerComponent>
                Nodos de relación entre proveedores con igual dirección o número de contacto.

                <br/>
                Se considera "relación entre proveedores" a las empresas que cuenten con el mismo contacto y/o
                dirección, lo cual no implica una relación directa con la contratación ni se considera un delito en sí.
            </DisclaimerComponent>
            <Layout>
                <Layout>
                    <Layout.Content>
                        {data.state === 'LOADED' && <RelationGraph nodes={graph.nodes}
                                                                   edges={graph.edges}
                                                                   onSelect={setSelected}
                                                                   filterEdge={filter}
                        />}
                        {data.state !== 'LOADED' && <LoadingGraphComponent/>}
                    </Layout.Content>
                    <Layout.Sider style={{
                        background: '#ececec',
                        padding: 10
                    }} width={400}>
                        <Space direction="vertical" style={{width: '100%'}}>
                            <Card title="Leyenda"
                                  bordered={false}
                                  style={{width: '100%'}}>

                                <Timeline>
                                    {Object.keys(colors).map(type => <Timeline.Item
                                        className="ocds-timeline-clickable"
                                        color={colors[type]}
                                        key={type}>
                                        <span style={{
                                            color: actives.has(type) ? 'black' : 'gray'
                                        }} onClick={() => toggle(type)}>
                                            {names[type]}
                                        </span>
                                    </Timeline.Item>)}
                                </Timeline>
                            </Card>
                            {selected
                                ? <SupplierCard id={selected}/>
                                : null
                            }
                        </Space>
                    </Layout.Sider>
                </Layout>
            </Layout>
        </PageHeader>
    </BaseDatosPage>

}

export function toGraph(data?: OCDSSupplierRelation[]): Graph {
    if (!data || data.length === 0) return {edges: [], nodes: []};
    const edges = new Map<string, Edge>();
    const nodes = new Map<string, Node>();


    const defColor = 'black';

    data.forEach(d => {
        nodes.set(d.p1ruc, {id: d.p1ruc, label: d.p1name, color: '#000000'});
        nodes.set(d.p2ruc, {id: d.p2ruc, label: d.p2name, color: '#000000'});

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

export function SupplierCard({id}: { id: string }) {

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

    if (!data) return <LoadingGraphComponent/>;

    return <Card
        title={<Link to={`/ocds/suppliers/${id}`}>{data ? data.name : id}</Link>}
    >
        {data && <SupplierDescription data={data} columns={1}/>}
    </Card>
}
