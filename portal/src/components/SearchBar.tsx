import {Input} from 'antd';
import * as React from 'react';

export function SearchBar(props: {
    defaultValue: string;
    onSearch?: (value: string) => void;
    placeholder?: string;
}) {
    return <>
        <div className="header-search-wrapper">
            <Input.Search
                placeholder={props.placeholder || 'Buscar'}
                key="search_input"
                defaultValue={props.defaultValue}
                onSearch={props.onSearch}
                style={{width: '96%'}}
                formMethod="submit"/>
        </div>
    </>
}
