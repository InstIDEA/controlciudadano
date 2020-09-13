import * as React from 'react';
import {ResponsiveNetwork} from '@nivo/network'
import {Graph} from './RelationGraph';

export function NivoRelationGraph(props: Graph) {

    const data = mapToNivo(props);

    return <ResponsiveNetwork
        nodes={data.nodes}
        links={data.links}
        margin={{top: 0, right: 0, bottom: 0, left: 0}}
        repulsivity={6}
        iterations={60}
        nodeColor={function (t) {
            return t.color
        }}
        nodeBorderWidth={1}
        nodeBorderColor={{from: 'color', modifiers: [['darker', 0.8]]}}
        linkThickness={function (t) {
            return 2 * (2 - t.source.depth)
        }}
        motionStiffness={160}
        motionDamping={12}
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


const t = {
    "nodes": [
        {
            "id": "1",
            "radius": 8,
            "depth": 1,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "2",
            "radius": 8,
            "depth": 1,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "3",
            "radius": 8,
            "depth": 1,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "4",
            "radius": 8,
            "depth": 1,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "5",
            "radius": 8,
            "depth": 1,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "6",
            "radius": 8,
            "depth": 1,
            "color": "rgb(97, 205, 187)"
        },
        {
            "id": "0",
            "radius": 12,
            "depth": 0,
            "color": "rgb(244, 117, 96)"
        },
        {
            "id": "1.0",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "1.1",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "1.2",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "1.3",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "1.4",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "2.0",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "2.1",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "2.2",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "2.3",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.0",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.1",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.2",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.3",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.4",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.5",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.6",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.7",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "3.8",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.0",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.1",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.2",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.3",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.4",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.5",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "4.6",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.0",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.1",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.2",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.3",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.4",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.5",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.6",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.7",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "5.8",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "6.0",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "6.1",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "6.2",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "6.3",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        },
        {
            "id": "6.4",
            "radius": 4,
            "depth": 2,
            "color": "rgb(232, 193, 160)"
        }
    ],
    "links": [
        {
            "source": "0",
            "target": "1",
            "distance": 50
        },
        {
            "source": "1",
            "target": "1.0",
            "distance": 30
        },
        {
            "source": "1",
            "target": "1.1",
            "distance": 30
        },
        {
            "source": "1",
            "target": "1.2",
            "distance": 30
        },
        {
            "source": "1",
            "target": "1.3",
            "distance": 30
        },
        {
            "source": "1",
            "target": "1.4",
            "distance": 30
        },
        {
            "source": "0",
            "target": "2",
            "distance": 50
        },
        {
            "source": "2",
            "target": "2.0",
            "distance": 30
        },
        {
            "source": "2",
            "target": "2.1",
            "distance": 30
        },
        {
            "source": "2",
            "target": "2.2",
            "distance": 30
        },
        {
            "source": "2",
            "target": "2.3",
            "distance": 30
        },
        {
            "source": "0",
            "target": "3",
            "distance": 50
        },
        {
            "source": "3",
            "target": "3.0",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.1",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.2",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.3",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.4",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.5",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.6",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.7",
            "distance": 30
        },
        {
            "source": "3",
            "target": "3.8",
            "distance": 30
        },
        {
            "source": "0",
            "target": "4",
            "distance": 50
        },
        {
            "source": "4",
            "target": "4.0",
            "distance": 30
        },
        {
            "source": "4",
            "target": "4.1",
            "distance": 30
        },
        {
            "source": "4",
            "target": "4.2",
            "distance": 30
        },
        {
            "source": "4",
            "target": "4.3",
            "distance": 30
        },
        {
            "source": "4",
            "target": "4.4",
            "distance": 30
        },
        {
            "source": "4",
            "target": "4.5",
            "distance": 30
        },
        {
            "source": "4",
            "target": "4.6",
            "distance": 30
        },
        {
            "source": "0",
            "target": "5",
            "distance": 50
        },
        {
            "source": "5",
            "target": "5.0",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.1",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.2",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.3",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.4",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.5",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.6",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.7",
            "distance": 30
        },
        {
            "source": "5",
            "target": "5.8",
            "distance": 30
        },
        {
            "source": "0",
            "target": "6",
            "distance": 50
        },
        {
            "source": "6",
            "target": "6.0",
            "distance": 30
        },
        {
            "source": "6",
            "target": "6.1",
            "distance": 30
        },
        {
            "source": "6",
            "target": "6.2",
            "distance": 30
        },
        {
            "source": "6",
            "target": "6.3",
            "distance": 30
        },
        {
            "source": "6",
            "target": "6.4",
            "distance": 30
        }
    ]
};
