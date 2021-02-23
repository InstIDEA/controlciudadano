import {DeclarationData, FinancialDetail, NetWorthIncreaseAnalysis} from "../../../APIModel";
import {Button, Card, Col, Form, Input, InputNumber, Radio, Row, Space, Tooltip, Typography} from "antd";
import React from "react";
import {formatMoney} from "../../../formatters";
import {MinusCircleOutlined, PlusOutlined, RightSquareOutlined} from '@ant-design/icons';

const amountFormatter = (value?: string | number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const amountParser = (value?: string) => `${value}`.replace(/\./g, '')

export function InputData(props: {
    data: NetWorthIncreaseAnalysis,
    updateDate: (newData: DeclarationData) => void
}) {

    return <Row gutter={[0, 16]}>
        <Col sm={24}>
            <Typography.Title level={5} className="title-color">
                Datos
            </Typography.Title>
        </Col>
        <Col sm={24}>
            <Card className="custom-card-no-shadow">
                <Typography.Title level={5} className="title-color">
                    <RemoteLink text={`Año ${props.data.firstYear.year}`} link={getLink(props.data.firstYear)}/>
                </Typography.Title>
                <SingleDeclaration data={props.data.firstYear} update={props.updateDate}/>
            </Card>
        </Col>
        <Col sm={24}>
            <Card className="custom-card-no-shadow">
                <Typography.Title level={5} className="title-color">
                    <RemoteLink text={`Año ${props.data.lastYear.year}`} link={getLink(props.data.lastYear)}/>
                </Typography.Title>
                <SingleDeclaration data={props.data.lastYear} update={props.updateDate}/>
            </Card>
        </Col>

    </Row>
}

function RemoteLink(props: {
    text: string,
    link?: string
}) {
    if (!props.link) return <>props.text</>;


    return <Tooltip title="Ir a fuente principal">
        <a href={props.link}>
            <Space>
                {props.text}
                <RightSquareOutlined/>
            </Space>
        </a>
    </Tooltip>
}

function getLink(dat: DeclarationData): string | undefined {
    return dat.sources.filter(val => val.type === 'djbr').map(v => v.url).shift();
}

export function SingleDeclaration(props: {
    data: DeclarationData,
    update: (newData: DeclarationData) => void
}) {
    const [form] = Form.useForm();
    const layout = {
        labelCol: {span: 8},
        wrapperCol: {span: 16},
    };

    return <Form {...layout}
                 form={form}
                 name={`dec_form_${props.data.year}`}
                 size="small"
                 initialValues={props.data}
                 onValuesChange={(ch, all) => {
                     console.log('changed something: ', ch, 'new data is', all);
                     props.update({
                         ...props.data,
                         ...all
                     });
                 }}
    >
        {/*<div style={{textAlign: 'left'}}>*/}
        {/*    <pre>*/}
        {/*        {JSON.stringify(props.data, null, 2)}*/}
        {/*    </pre>*/}
        {/*</div>*/}
        <Form.Item name="totalActive" label="Total activos:" rules={[{required: true}]}>
            <InputNumber precision={0}
                         formatter={amountFormatter}
                         parser={amountParser}
                         style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item name="totalPassive" label="Total Pasivos:" rules={[{required: true}]}>
            <InputNumber precision={0}
                         formatter={amountFormatter}
                         parser={amountParser}
                         style={{width: '100%'}}/>
        </Form.Item>

        <Form.List name="incomes">
            {(fields, funcs) => (
                <>
                    {fields.map(field => {

                        const val: FinancialDetail = form.getFieldValue(["incomes", field.name]);

                        return <Form.Item label={val?.name}>
                            <Row gutter={[8, 8]}>
                                <Col>
                                    <Form.Item name={[field.name, "amount"]}
                                               fieldKey={[field.fieldKey, "amount"]}
                                               required>
                                        <InputNumber precision={0}
                                                     formatter={amountFormatter}
                                                     parser={amountParser}
                                                     style={{width: '100%'}}
                                                     placeholder="Monto"
                                                     prefix="Gs."
                                        />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item name={[field.name, "periodicity"]}
                                               fieldKey={[field.fieldKey, "periodicity"]}>
                                        <Radio.Group>
                                            <Radio.Button value="monthly">Mensual</Radio.Button>
                                            <Radio.Button value="yearly">Anual</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>


                                {val?.source !== 'MANUAL' && <Col>
                                    <Tooltip title="Fuente"> {val?.source} </Tooltip>
                                </Col>}

                                {val?.source === 'MANUAL' && <Col>
                                    <MinusCircleOutlined onClick={() => funcs.remove(field.name)}/>
                                </Col>}
                            </Row>
                        </Form.Item>
                    })}

                    <Form.Item wrapperCol={{span: 24}}>
                        <Button type="dashed" onClick={() => funcs.add({
                            periodicity: 'monthly',
                            amount: 0,
                            source: 'MANUAL',
                            observation: '',
                            name: `Ingreso`
                        })} block icon={<PlusOutlined/>}>
                            Agregar Ingreso
                        </Button>
                    </Form.Item>
                </>
            )}

        </Form.List>

        <Form.Item label="Ingresos totales (por año)">
            <Input disabled value={formatMoney(props.data.totalIncome)}/>
        </Form.Item>
        <Form.Item label="Patrimonio Neto">
            <Input disabled value={formatMoney(props.data.netWorth)}/>
        </Form.Item>
    </Form>;
}

