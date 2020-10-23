import { Layout, Menu, Input } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
import { SearchOutlined } from '@ant-design/icons'

export function SearchBar(props: {
  defaultValue: string;
  onSearch?: (value: string) => void;
}) {
  return <>
    <div className="header-search-wrapper">
            <Input.Search
            placeholder="Buscar"
            key="search_input"
            defaultValue={props.defaultValue}
            onSearch={props.onSearch}
            style={{ width: '96%' }}
            formMethod="submit"/>
        </div>
  </>
}
