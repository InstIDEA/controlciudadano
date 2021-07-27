import React, {CSSProperties, useEffect, useState} from "react";
import {Result} from "antd";
import {LoadingGraphComponent} from "./ddjj/LoadingGraph";


export function Loading(props: {
    text?: string | string[];
    interval?: number;
    style?: CSSProperties;
    className?: string;
}) {

    const size = !props.text && !Array.isArray(props.text)
        ? 3
        : props.text.length;

    const [idx, setIdx] = useState(0);
    const text = getText(idx, props.text)

    useEffect(() => {
        const ival = setInterval(() => {
            setIdx(pre => (pre + 1) % size);
        }, props.interval || 1000);

        return () => clearInterval(ival)
    }, [props.interval, size])

    return <Result title={text}
                   style={props.style}
                   className={props.className}
                   icon={<LoadingGraphComponent/>}
    />
}

function getText(idx: number, text?: string | string[]): string {

    const base = text === undefined
        ? "Cargando"
        : Array.isArray(text)
            ? text[idx]
            : text;

    return base + ".".repeat(idx + 2);
}
