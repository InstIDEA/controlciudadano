import {Layout, Menu} from 'antd';
import * as React from 'react';
import {ReactNode, useMemo} from 'react';
import {Link, useHistory} from 'react-router-dom';

const menus = {
    action: [
        {key: 'items', link: '/action/ocds/items', label: "¿Se compró más caro?"},
        {key: 'itemsRanking', link: '/action/ocds/itemsRanking', label: "¿Qué se compró?"},
        {key: 'sanctionedSuppliers', link: '/action/ocds/sanctioned_suppliers', label: '¿A quiénes se compró?'},
        {key: 'buyers', link: '/action/ocds/buyers', label: "¿Quienes compraron?"},
        {key: 'tenders', link: '/action/ocds/tenders', label: "¿Conocés las licitaciones más grandes?"},
        {key: 'relations', link: '/action/ocds/relations', label: "Relación entre proveedores"},
    ], explore: [
        {key: 'affidavit', link: '/explore/contralory/affidavit', label: 'Declaraciones juradas'},
        {key: 'authorities', link: '/explore/authorities/elected', label: 'Autoridades Electas'},
        {key: 'auth_djbr', link: '/explore/djbr/list', label: 'Declaraciones de autoridades'},
        {key: 'items', link: '/explore/ocds/items', label: "¿Se compró más caro?"},
        {key: 'itemsRanking', link: '/explore/ocds/itemsRanking', label: "¿Qué se compró?"},
        {key: 'suppliers', link: '/explore/ocds/suppliers', label: 'Proveedores'},
        {key: 'relations', link: '/explore/ocds/relations', label: "Relación entre proveedores"},
        {key: 'ande', link: '/explore/covid/ande', label: 'ANDE: exoneraciones'},
        {key: 'essap', link: '/explore/covid/essap', label: 'ESSAP: exoneraciones'},
        {key: 'sources', link: '/sources', label: 'Fuentes'},
    ], djbr: [
        {key: 'dashboard', link: '/djbr/portal', label: 'Panel'},
        {key: 'auth_djbr', link: '/djbr/list', label: 'Declaraciones de autoridades'},
        {key: 'tutorial', link: '/djbr/tutorial?type=djbr', label: 'Videotutoriales'},
    ]
};


export function Sidebar(props: {
    menuIndex: string;
    children: ReactNode;
}) {

    const history = useHistory();
    const items = useMemo(
        () => getMenu(history.location.pathname).map(i => <Menu.Item key={i.key}>
            <Link to={i.link}/>{i.label}
        </Menu.Item>),
        [history.location.pathname]
    );

    return <>
        <Layout>
            <Layout.Sider width={320}
                          breakpoint='lg'
                          collapsedWidth={0}
            >
                <Menu mode="inline" defaultSelectedKeys={[props.menuIndex]} style={{height: '100%', borderRight: 0}}>
                    {items}
                </Menu>
            </Layout.Sider>
            <Layout.Content>
                {props.children}
            </Layout.Content>
        </Layout>
    </>
}

function getMenu(path: string) {
    if (path.includes('action')) return menus.action;
    if (path.includes('explore')) return menus.explore;
    return menus.djbr;
}
