import React, {useState} from "react";
// @ts-ignore
import {EdgeShapes, RandomizeNodePositions, RelativeSize, Sigma, SigmaEnableWebGL} from 'react-sigma';
import FilterWithEdges from '../sigma-react/FilterWithEdges';
// @ts-ignore
import Dagre from 'react-sigma/lib/Dagre';
// @ts-ignore
import ForceAtlas2 from 'react-sigma/lib/ForceAtlas2';
// @ts-ignore
import ForceLink from 'react-sigma/lib/ForceLink';

export let t: SigmaEnableWebGL;

export interface Graph {
    edges: Edge[],
    nodes: Node[]
}

export interface Node {
    id: string,
    label: string;
    color: string;
}

export interface Edge {
    id: string;
    source: string;
    target: string;
    label: string;
    color: string;
}

export function RelationGraph(props: Graph & {
    /**
     * On node select
     */
    onSelect?: (id?: string) => void;
    filterNode?: (node: Node) => boolean;
    filterEdge?: (edge: Edge) => boolean;
    type?: 'dagre' | 'force' | 'link' | 'none';
    randomize?: boolean;
}) {
    const [selected, setSelected] = useState<string>();
    const finalType = props.type ?? 'dagre';

    function onClick(s?: string) {
        if (s === selected) {
            if (props.onSelect)
                props.onSelect(undefined);
            setSelected(undefined)
            return;
        }
        if (props.onSelect)
            props.onSelect(s);
        setSelected(s);
    }

    return <Sigma
        graph={{nodes: props.nodes, edges: props.edges}}
        settings={{
            drawEdges: true,
            drawEdgeLabels: false,
            clone: false,
            animationsTime: 3000
        }}
        style={{width: "100%", height: "800px"}}
        renderer="canvas"
        onClickNode={(e: any) => onClick(e.data.node.id)}
        onClickStage={() => onClick()}
    >
        <EdgeShapes default="curvedArrow"/>
        {props.randomize ? <RandomizeNodePositions>
            <FilterWithEdges neighborsOf={selected}
                             edgesBy={props.filterEdge}
                             nodesBy={props.filterNode}/>
            {finalType !== 'none' ? buildType(finalType) : <></>}
            <RelativeSize initialSize={15}/>
        </RandomizeNodePositions> : <></>}
        {!props.randomize ? <FilterWithEdges neighborsOf={selected}
                                             edgesBy={props.filterEdge}
                                             nodesBy={props.filterNode}/> : <></>}
        {!props.randomize && finalType !== 'none' ? buildType(finalType) : <></>}
        {!props.randomize ? <RelativeSize initialSize={15}/> : <></>}
    </Sigma>
}

function buildType(type: 'dagre' | 'force' | 'link' | 'none') {

    switch (type) {
        case 'dagre':
            return <Dagre boundingBox={{maxX: 10, maxY: 10, minX: 0, minY: 0}}
                          compound
                          directed
                          easing="cubicInOut"
                          multigraph
                          rankDir="TB"
                          worker
            />
        case 'force':
            return <ForceAtlas2 iterationsPerRender={1}
                                linLogMode
                                timeout={2000}
                                worker
            />
        case 'link':
            return <ForceLink background
                              barnesHutTheta={0.5}
                              easing="cubicInOut"
                              edgeWeightInfluence={0}
                              gravity={1}
                              linLogMode
                              randomize="locally"
                              timeout={2000}
                              worker
            />
        case 'none':
            return null;
    }
}
