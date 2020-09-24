import { Layout, Menu } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
export function Sidebar(props: {
  menuIndex: string;
}) {
  const { Sider } = Layout;
  return <Sider width={300} className="site-layout-background">
        <Menu
          mode="inline"
          defaultSelectedKeys={[props.menuIndex]}
          style={{ height: '100%', borderRight: 0 }}
        >
          <Menu.Item key="items"><Link to="/ocds/items" />Items adquiridos</Menu.Item>
          <Menu.Item key="itemsRanking"><Link to="/ocds/covid/itemsRanking" />Ranking de items adquiridos</Menu.Item>
          <Menu.Item key="sanctionedSuppliers"><Link to="/ocds/sanctioned_suppliers" />Proveedores</Menu.Item>
          <Menu.Item key="buyers"><Link to="/ocds/buyers" />Entidades Compradoras</Menu.Item>
          <Menu.Item key="tenders"><Link to="/ocds/tenders" />Licitaciones</Menu.Item>
          <Menu.Item key="relations"><Link to="/ocds/relations" />Relaciones entre proveedores</Menu.Item>
        </Menu>
      </Sider>

}
