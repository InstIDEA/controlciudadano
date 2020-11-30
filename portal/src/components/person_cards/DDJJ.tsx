import {Affidavit} from "../../Model";
import {Card, Col, Table, Typography} from "antd";
import Icon from "@ant-design/icons";
import {ReactComponent as Ddjj} from "../../assets/logos/ddjj.svg";
import * as React from "react";
import {formatMoney} from "../../formatters";
import './DDJJ.css'

export function DDJJCard(props: {
    affidavit: Affidavit[]
}) {
    const affidavit = props.affidavit;
    return <div className="ddjj">
        <Col {...{xxl: 12, xl: 12, lg: 12, md: 12, sm: 24, xs: 24}}>
            <Card className="data-box" title="Declaraciones juradas de bienes y rentas"
                  extra={<Icon component={Ddjj} className="icon-card"/>}>
                <Table<Affidavit>
                    dataSource={affidavit}
                    size="small"
                    scroll={{x: 600, y: undefined}}
                    pagination={false}
                    columns={[{
                        title: <Typography.Text><strong>Año</strong></Typography.Text>,
                        render: (r: Affidavit) => <a href={r.linksandwich || r.link} target="_blank"
                                                     rel="noopener noreferrer"
                                                     title="Ver">
                            {r.year}
                        </a>

                    }, {
                        title: <Typography.Text><strong>Activos</strong></Typography.Text>,
                        render: (r: Affidavit) => formatMoney(r.actives),
                        align: 'right'
                    }, {
                        title: <Typography.Text><strong>Pasivos</strong></Typography.Text>,
                        render: (r: Affidavit) => formatMoney(r.passive),
                        align: 'right'
                    }, {
                        title: <Typography.Text><strong>Patrimonio Neto</strong></Typography.Text>,
                        render: (r: Affidavit) => formatMoney(r.networth),
                        align: 'right'
                    }]}>


                </Table>

            </Card>
        </Col></div>
}

