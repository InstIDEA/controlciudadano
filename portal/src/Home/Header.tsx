import React from 'react';
import { Row, Col, Menu, Popover, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons'

import './static/header.css'

const { Search } = Input;

export function Header(props: {
  tableMode: boolean;
  searchBar?: boolean;
}) {



  const menu = (
    <Menu mode='horizontal' id="nav" key="nav">
      <Menu.Item key="home">
        <a href="/">Inicio</a>
      </Menu.Item>
      <Menu.Item key="explorar">
        <a href="/explore">Explorar</a>
      </Menu.Item>
      <Menu.Item key="analisis">
        <a href="/action">Compras COVID</a>
      </Menu.Item>
      <Menu.Item key="conjunto">
        <a>Fuente de datos</a>
      </Menu.Item>
      <Menu.Item key="docs">
        <a>Acerca de</a>
      </Menu.Item>
    </Menu>
  );

  return (
    props.tableMode ?
      <div id="header" className="header">
        <Row>
          <Col xxl={4} xl={5} lg={6} md={6} sm={20} xs={20}>
            <div className="header-title-wrapper">
              <h1 className="header-table-mode">CONTROL CIUDADANO</h1>
            </div>
          </Col>
          <Col xxl={6} xl={4} lg={4} md={4} sm={4} xs={4}>
            {props.searchBar && (<div className="header-search-wrapper">
              <Search
                prefix={<SearchOutlined />}
                suffix={null}
                placeholder="Buscar.."
                onSearch={value => console.log(value)}
                style={{ width: 200 }}
              />
            </div>)}
          </Col>
          <Col xxl={14} xl={15} lg={14} md={14} sm={0} xs={0}>
            <div className="header-meta">
              <div id="menu">{menu}</div>
            </div>
          </Col>
        </Row>
      </div> :
      <div id="header" className="header">
        <Row>
          <Col xxl={6} xl={7} lg={10} md={10} sm={24} xs={24}>
            <div id="logo">
              <h1 className="header-title">CONTROL CIUDADANO</h1>
            </div>
          </Col>
          <Col xxl={14} xl={17} lg={14} md={14} sm={0} xs={0}>
            <div className="header-meta">
              <div id="menu">{menu}</div>
            </div>
          </Col>
        </Row>
      </div>
  );

}
