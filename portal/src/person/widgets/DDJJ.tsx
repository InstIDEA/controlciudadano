import {Affidavit} from "../../Model";
import {Card, Col, Table, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";
import {formatMoney} from "../../formatters";
import './DDJJ.css'
import {SOURCE_NAME_MAP} from "../../pages/PersonSearchPage";

export function DDJJCard(props: {
    affidavit: Affidavit[]
}) {
    const affidavit = props.affidavit;
    return <>
        <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}} className="ddjj">
            <Card className="data-box" title={SOURCE_NAME_MAP['declarations']}
                  extra={<Icon component={Ddjj} className="icon-card"/>}>
                <Table<Affidavit>
                    dataSource={affidavit}
                    rowKey="id"
                    size="small"
                    scroll={{x: undefined, y: undefined}}
                    pagination={false}
                    columns={[{
                        title: <Typography.Text><strong>Año (revisión)</strong></Typography.Text>,
                        render: (r: Affidavit) => <a href={r.link_sandwich || r.link} target="_blank"
                                                     rel="noopener noreferrer"
                                                     title="Ver">
                            {r.year} {r.revision && `({$r.revision})`}
                        </a>

                    }, {
                        title: <Typography.Text><strong>Activos (Gs.)</strong></Typography.Text>,
                        render: (r: Affidavit) => r.active
                            ? formatMoney(r.active)
                            : 'Ayudanos a completar',
                        align: 'right'
                    }, {
                        title: <Typography.Text><strong>Pasivos (Gs.)</strong></Typography.Text>,
                        render: (r: Affidavit) => formatMoney(r.passive),
                        align: 'right'
                    }, {
                        title: <Typography.Text><strong>Patrimonio Neto (Gs.)</strong></Typography.Text>,
                        render: (r: Affidavit) => formatMoney(r.net_worth),
                        align: 'right'
                    }]}>


                </Table>

            </Card>
        </Col>
    </>
}

