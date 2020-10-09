import { Layout, Menu } from 'antd';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ReactNode } from 'react';
export function Sidebar(props: {
  menuIndex: string;
  sidebar?: boolean;
  children: ReactNode;
}) {
  const { Sider } = Layout;
  const actionMenu = [
    { key: 'items', link: '/action/ocds/items', label: 'Items Adquiridos' },
    { key: 'itemsRanking', link: '/action/ocds/covid/itemsRanking', label: 'Ranking de items adquiridos' },
    { key: 'sanctionedSuppliers', link: '/action/ocds/sanctioned_suppliers', label: 'Proveedores' },
    { key: 'buyers', link: '/action/ocds/buyers', label: 'Entidades Compradoras' },
    { key: 'tenders', link: '/action/ocds/tenders', label: 'Licitaciones' },
    { key: 'relations', link: '/action/ocds/relations', label: 'Relaciones entre proveedores' },
  ];
  const exploreMenu = [
    { key: 'people', link: '/explore/people', label: 'Buscador de personas' },
    { key: 'affidavit', link: '/explore/contralory/affidavit', label: 'Declaraciones juradas' },
    { key: 'authorities', link: '/explore/authorities/elected', label: 'Autoridades Electas' },
    { key: 'items', link: '/explore/ocds/items', label: 'Items Adquiridos' },
    { key: 'itemsRanking', link: '/explore/ocds/covid/itemsRanking', label: 'Ranking de items adquiridos' },
    { key: 'suppliers', link: '/explore/ocds/suppliers', label: 'Proveedores' },
    { key: 'relations', link: '/explore/ocds/relations', label: 'Relaciones entre proveedores' },
    { key: 'ande', link: '/explore/covid/ande', label: 'ANDE exoneradas por COVID-19' },
    { key: 'essap', link: '/explore/covid/essap', label: 'ESSAP exoneradas por COVID-19' },
    { key: 'sources', link: '/sources', label: 'Fuentes' },
  ];
  const menuItems = props.sidebar ? exploreMenu : actionMenu;
  return <>
    <Layout>
    <Sider width={300} className="site-layout-background" breakpoint='lg' collapsedWidth={0}>
      <Menu
        mode="inline"
        defaultSelectedKeys={[props.menuIndex]}
        style={{ height: '100%', borderRight: 0 }}
      >
        {
          menuItems.map(i =>
            <Menu.Item key={i.key}><Link to={i.link} />{i.label}</Menu.Item>
          )
        }
      </Menu>
    </Sider>
    <Layout.Content>
      {props.children}
    </Layout.Content>
    </Layout>
  </>
}
