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
    { key: 'items', link: '/action/ocds/items', label: "¿Se compró más caro?" },
    { key: 'itemsRanking', link: '/action/ocds/covid/itemsRanking', label: "¿Qué se compró?" },
    { key: 'sanctionedSuppliers', link: '/action/ocds/sanctioned_suppliers', label: '¿A quiénes se compró?' },
    { key: 'buyers', link: '/action/ocds/buyers', label: "¿Quienes compraron?" },
    { key: 'tenders', link: '/action/ocds/tenders', label: "¿Conocés las licitaciones más grandes?" },
    { key: 'relations', link: '/action/ocds/relations', label: "Relación entre proveedores" },
  ];
  const exploreMenu = [
    { key: 'affidavit', link: '/explore/contralory/affidavit', label: 'Declaraciones juradas' },
    { key: 'authorities', link: '/explore/authorities/elected', label: 'Autoridades Electas' },
    { key: 'items', link: '/explore/ocds/items', label: "¿Se compró más caro?" },
    { key: 'itemsRanking', link: '/explore/ocds/covid/itemsRanking', label: "¿Qué se compró?" },
    { key: 'suppliers', link: '/explore/ocds/suppliers', label: 'Proveedores' },
    { key: 'relations', link: '/explore/ocds/relations', label: "Relación entre proveedores" },
    { key: 'ande', link: '/explore/covid/ande', label: 'ANDE: exoneraciones' },
    { key: 'essap', link: '/explore/covid/essap', label: 'ESSAP: exoneraciones' },
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
