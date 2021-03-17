import {Input, Tooltip} from "antd";
import React from "react";
import {AmountWithSource} from "../../../APIModel";

const amountFormatter = (value?: string | number) => {
    if (!value) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
const amountParser = (value?: string) => parseFloat(`${value}`.replace(/\./g, ''));

/**
 * Heavily inspired in https://ant.design/components/input/
 */
export function AmountInput(props: {
    value?: AmountWithSource;
    disabled?: boolean;
    onChange?: (newVal: AmountWithSource) => void;
    onBlur?: () => void;
    title?: string;
    align?: 'right' | 'left';
    extraAddon?: React.ReactNode;
    placeholder?: string;
}) {

    const {extraAddon, ...rest} = props;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        const parsed = amountParser(value);
        props.onChange && props.onChange({
            amount: isNaN(parsed) ? 0 : parsed,
            source: 'MANUAL'
        });
    };

    const title = generateTitle(props.title, props.value?.source);

    return <Tooltip title={title}
                    placement="topLeft"
                    overlayClassName="numeric-input">
        <Input placeholder="Monto"
               {...rest}
               value={amountFormatter(props.value?.amount)}
               onChange={onChange}
               addonBefore={<SourceWithTooltip source={props.value?.source}/>}
               style={{textAlign: props.align || 'right'}}
               maxLength={25}/>
    </Tooltip>;

}

function SourceWithTooltip({source}: { source?: string }) {
    if (!source) return null;
    const title = generateTitle(undefined, source)
    return <Tooltip title={title}>
        <span>{source}</span>
    </Tooltip>
}

function generateTitle(title?: string, source?: string): string | undefined {
    if (title) return title;
    if (source) return source === 'MANUAL' ? 'Valor ingresado manualmente' : `Obtenido de '${source}'`;
    return undefined;
}
