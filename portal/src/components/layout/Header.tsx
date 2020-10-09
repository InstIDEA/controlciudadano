import React, {ReactNode} from 'react';
import {Col, Dropdown, Menu, Row} from 'antd';
import './Header.css'
import {MenuOutlined} from '@ant-design/icons';
import {Link} from 'react-router-dom';

const menu = <Menu mode='horizontal' id="nav" key="nav">
    <Menu.Item key="home">
        <Link className="menu-item" to="/">Inicio</Link>
    </Menu.Item>
    <Menu.Item key="explorar">
        <Link className="menu-item" to="/explore">Explorar Datos</Link>
    </Menu.Item>
    <Menu.Item key="analisis">
        <Link className="menu-item" to="/action">Compras COVID</Link>
    </Menu.Item>
    <Menu.Item key="conjunto">
        <Link className="menu-item" to="/sources">Fuente de datos</Link>
    </Menu.Item>
    <Menu.Item key="docs">
        <Link className="menu-item" to="/about">Acerca de</Link>
    </Menu.Item>
</Menu>;

export function Header(props: {
    tableMode: boolean;
    searchBar?: ReactNode;
    showSeparator?: boolean;
}) {

    const showSeparator = props.showSeparator !== undefined
        ? props.showSeparator
        : props.tableMode;

    return (props.tableMode
            ? <div id="header" className="header">
                <Row>
                    <Col xxl={4} xl={5} lg={6} md={6} sm={22} xs={22}>
                        <div className="header-title-wrapper" style={{
                            borderRight: showSeparator ? '1px solid rgb(236, 241, 245)' : undefined
                        }}>
                            <Link to="/">
                                <h1 className="header-table-mode">CONTROL CIUDADANO</h1>
                            </Link>
                        </div>
                    </Col>
                    <Col xxl={0} xl={0} lg={0} md={0} sm={2} xs={2}>
                        <div className="collapsed-menu">
                            <Dropdown className="dropdown-item" overlay={menu} trigger={['click']}>
                                <MenuOutlined/>
                            </Dropdown>
                        </div>
                    </Col>
                    <Col xxl={6} xl={4} lg={4} md={4} sm={24} xs={24}>
                        {props.searchBar}
                    </Col>
                    <Col xxl={14} xl={15} lg={14} md={14} sm={0} xs={0}>
                        <div className="header-meta">
                            <div id="menu">{menu}</div>
                        </div>
                    </Col>
                </Row>
            </div>
            : <div id="header" className="header">
                <Row>
                    <Col xxl={8} xl={8} lg={8} md={8} sm={22} xs={22}>
                        <div>
                            <Link to="/">
                                <h1 className="header-title">CONTROL CIUDADANO</h1>
                            </Link>
                        </div>
                    </Col>
                    <Col xxl={14} xl={14} lg={14} md={14} sm={0} xs={0}>
                        <div className="header-meta">
                            <div id="menu">{menu}</div>
                        </div>
                    </Col>
                    <Col xxl={0} xl={0} lg={0} md={0} sm={2} xs={2}>
                        <div className="collapsed-menu">
                            <Dropdown className="dropdown-item" overlay={menu} trigger={['click']}>
                                <MenuOutlined/>
                            </Dropdown>
                        </div>
                    </Col>
                </Row>
            </div>
    );

}
