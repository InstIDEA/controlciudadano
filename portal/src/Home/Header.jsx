import React from 'react';
import { Row, Col, Menu, Popover } from 'antd';

import { enquireScreen } from 'enquire-js';
import './static/header.css'

class Header extends React.Component {
  state = {
    menuVisible: false,
    menuMode: 'horizontal',
  };

  componentDidMount() {
    enquireScreen((b) => {
      this.setState({ menuMode: b ? 'inline' : 'horizontal' });
    });
  }

  render() {
    const { menuMode, menuVisible } = this.state;

    const menu = (
      <Menu mode={menuMode} id="nav" key="nav">
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
          <a>Conjuto de datos</a>
        </Menu.Item>
        <Menu.Item key="docs">
          <a>Acerca de</a>
        </Menu.Item>
      </Menu>
    );

    return (
      <div id="header" className="header">
        {menuMode === 'inline' ? (
          <Popover
            overlayClassName="popover-menu"
            placement="bottomRight"
            content={menu}
            trigger="click"
            visible={menuVisible}
            arrowPointAtCenter
            onVisibleChange={this.onMenuVisibleChange}
          >
          </Popover>
        ) : null}
        <Row>
          <Col xxl={6} xl={7} lg={10} md={10} sm={24} xs={24}>
            <div id="logo" to="/">
              <h1 className="header-title">CONTROL CIUDADANO</h1>
            </div>
          </Col>
          <Col xxl={14} xl={17} lg={14} md={14} sm={0} xs={0}>
            <div className="header-meta">
              {menuMode === 'horizontal' ? <div id="menu">{menu}</div> : null}
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default Header;
