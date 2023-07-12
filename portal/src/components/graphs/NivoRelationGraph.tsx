import * as React from 'react';
import {ResponsiveNetwork} from '@nivo/network'
import {Graph} from './RelationGraph';

export function NivoRelationGraph(props: Graph) {

    const data = mapToNivo(props);

    return <ResponsiveNetwork
        data={data}
        margin={{top: 0, right: 0, bottom: 0, left: 0}}
        repulsivity={6}
        iterations={60}
        nodeColor={function (t) {
            return t.color
        }}
        nodeBorderWidth={1}
        nodeBorderColor={{from: 'color', modifiers: [['darker', 0.8]]}}
        linkThickness={function (t) {
            return 2 * (2 - t.source.data.depth)
        }}
        // motionStiffness={160}
        // motionDamping={12}
    />
}

function mapToNivo(graph: Graph): {
    nodes: Array<{
        id: string;
        radius: number;
        depth: number;
        color: string;
    }>,
    links: Array<{
        source: string;
        target: string;
        distance: number;
        color: string;
    }>
} {

    return {
        nodes: graph.nodes.map(n => ({id: n.id, radius: 8, depth: 1, color: n.color})),
        links: graph.edges.map(edge => ({
            source: edge.source,
            target: edge.target,
            distance: 100,
            color: edge.color
        }))
    }
}
