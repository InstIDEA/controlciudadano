import {SelectedFilters} from '@appbaseio/reactivesearch';
import {Card, Col, Tag} from 'antd';
import * as React from 'react';
import Animate from 'rc-animate';

export function CurrentFilters() {

    return <SelectedFilters showClearAll={true}
                            clearAllLabel="Limpiar"
                            render={props => <CurrentFilterRenderer {...props} />}
    />
}

type Filters = Record<string, {
    value: string | string[] | null | { label: string },
    label: string
}>;

export function CurrentFilterRenderer(props: {
    selectedValues: Filters,
    setValue: (component: string, newVal: string | string[] | null) => void
}) {

    const {selectedValues, setValue} = props;
    const clearFilter = (component: string) => {
        setValue(component, null);
    };

    if (!hasFilter(selectedValues)) {
        return null;
    }


    return <Col xs={{span: 24}}>
        <Animate component=""
                 showProp="title"
                 transitionAppear
                 transitionName="fade"
        >
            <Card className="card-style" title="Filtros aplicados" style={{width: '100%'}}>
                {Object.keys(selectedValues).map(key => {
                    const component = selectedValues[key];
                    const value = component.value;

                    if (!value) {
                        return <> </>
                    }

                    if (Array.isArray(value)) {
                        return value.map((val: unknown) => <Tag
                            color={FilterColors[key] || 'gray'}
                            closable
                            key={`${key}_${val}`}
                            onClose={() => setValue(key, value.filter((sb: unknown) => sb !== val))}
                        >
                            {getFilterKeyName(key)}: {getMappedValName(val)}
                        </Tag>)
                    }

                    let label = JSON.stringify(component.value);
                    if (typeof value === 'string') {
                        label = value;
                    }
                    if (typeof value === 'object' && 'label' in value) {
                        label = value.label;
                    }

                    return <Tag closable
                                color={FilterColors[key] || 'gray'}
                                onClose={() => clearFilter(key)}
                                key={key}>
                        {getFilterKeyName(key)}: {getMappedValName(label)}
                    </Tag>
                })}
            </Card>
        </Animate>
    </Col>;
}

const FilterColors: Record<string, string> = {
    list: 'rgb(205 83 52)',
    departament: '#f50',
    year_elected: '#108ee9',
    election: 'rgb(205 83 52)',
    district: '#108ee9',
    charge: "#2e801a",
    title: "#a94d74"
}

function getFilterKeyName(val: string): string {

    const keys: Record<string, string> = {
        "list": "Partido",
        "departament": "Departamento",
        "year_elected": "Año",
        "district": "Distrito",
        "election": "Elecciones",
        "charge": "Tipo de candidatura",
        "title": "Titular o suplente"
    };

    return keys[val] || val;
}

function getMappedValName(val: unknown): string {

    if (val && `${val}`.endsWith('EEMBUCU')) return 'ÑEEMBUCU';
    return `${val}`;
}

/**
 * Check if a filter has a value selected
 *
 * @param filters
 */
export function hasFilter(filters: Filters): boolean {

    if (!filters) return false;
    return !!Object.keys(filters)
        .map(key => filters[key].value)
        .find(val => {
            if (Array.isArray(val)) return val.length !== 0;
            return !!val;
        })
}
