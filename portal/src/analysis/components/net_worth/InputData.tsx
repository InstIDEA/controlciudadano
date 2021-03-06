import {DeclarationData, FinancialDetail, NetWorthIncreaseAnalysis, NWAnalysisAvailableYear} from "../../../APIModel";
import {
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    InputNumber,
    Modal,
    Radio,
    Row,
    Space,
    Timeline,
    Tooltip,
    Typography
} from "antd";
import React, {useEffect, useState} from "react";
import {formatMoney, formatToDay} from "../../../formatters";
import {MinusCircleOutlined, PlusOutlined} from '@ant-design/icons';
import {Loading} from "../../../components/Loading";
import {ExternalLinkIcon} from "../../../components/icons/ExternalLinkIcon";
import {Disable} from "react-disable";
import {DisclaimerComponent} from "../../../components/Disclaimer";

const amountFormatter = (value?: string | number) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
const amountParser = (value?: string) => `${value}`.replace(/\./g, '')

export function InputData(props: {
    data: NetWorthIncreaseAnalysis;
    disabled: boolean;
    updateDate: (newData: DeclarationData) => void;
    updateSingleYear: (prev: DeclarationData, newData: NWAnalysisAvailableYear) => void
}) {

    const [currentYearToChange, setCurrentYearToChange] = useState<DeclarationData>();

    return <Disable disabled={props.disabled}>
        <Row gutter={[0, 16]}>
            <Col sm={24}>
                <Typography.Title level={5} className="title-color">
                    Datos
                </Typography.Title>
            </Col>
            <Col sm={24}>
                <Card className="custom-card-no-shadow">
                    <InputTitle data={props.data.firstYear}
                                onClick={() => setCurrentYearToChange(props.data.firstYear)}/>
                    <SingleDeclaration data={props.data.firstYear} update={props.updateDate}/>
                </Card>
            </Col>
            <Col sm={24}>
                <Card className="custom-card-no-shadow">
                    <InputTitle data={props.data.lastYear} onClick={() => setCurrentYearToChange(props.data.lastYear)}/>
                    <SingleDeclaration data={props.data.lastYear} update={props.updateDate}/>
                </Card>
            </Col>

            <SelectDeclarationModal
                options={props.data.availableYears}
                current={currentYearToChange}
                visible={!!currentYearToChange}
                onSelect={y => {
                    if (!currentYearToChange) return;
                    props.updateSingleYear(currentYearToChange, y);
                    setCurrentYearToChange(undefined);
                }}
                onCancel={() => setCurrentYearToChange(undefined)}/>

        </Row>
    </Disable>
}

function InputTitle(props: {
    data: DeclarationData;
    onClick: () => void;
}) {

    return <Typography.Title level={5} className="title-color">
        <Tooltip title="Ver información de fuente">
            <div onClick={props.onClick}
                 style={{
                     color: 'rgb(24, 144, 255)',
                     textDecoration: 'underline',
                     cursor: 'pointer'
                 }}
            >
                Año {props.data.year}
            </div>
        </Tooltip>
    </Typography.Title>
}

function getLink(dat: DeclarationData): string | undefined {
    return dat.sources.filter(val => val.type === 'djbr').map(v => v.url).shift();
}

function SelectDeclarationModal(props: {
    options: NWAnalysisAvailableYear[];
    current?: DeclarationData;
    visible: boolean;
    onSelect: (newVal: NWAnalysisAvailableYear) => void;
    onCancel: () => void;
}) {

    return <Modal title="Datos de la declaración"
                  visible={props.visible}
                  okButtonProps={{style: {display: 'none'}}}
                  width="80%"
                  onCancel={props.onCancel}>
        {props.current && <Space direction="vertical">
            <Descriptions column={1} title="Declaración actual" size="small">
                <Descriptions.Item label="Documento original">
                    <a href={getLink(props.current)} target="__blank">
                        <Space>
                            Ver PDF
                            <ExternalLinkIcon/>
                        </Space>
                    </a>
                </Descriptions.Item>
                <Descriptions.Item label="Año">
                    {props.current.year}
                </Descriptions.Item>
            </Descriptions>
            {props.options.length
                ? <Descriptions column={1} title="Cambiar por" size="small"/>
                : <DisclaimerComponent full card>No se cuentan con otras declaraciones</DisclaimerComponent>
            }
            <Timeline>
                {props.options.map(op => <Timeline.Item key={op.year}>
                    <Space>
                        <div>
                            Declaración al {formatToDay(op.date)} (
                            <a href={op.link}>
                                <Space align="end">
                                    Ver PDF
                                    <ExternalLinkIcon/>
                                </Space>
                            </a>)
                        </div>
                        <Button onClick={() => props.onSelect(op)}>Seleccionar</Button>
                    </Space>
                </Timeline.Item>)}
            </Timeline>
            {props.options.length
                ? <DisclaimerComponent full card>
                    Al cambiar de declaración, se perderán los datos que hayas modificado manualmente
                </DisclaimerComponent>
                : null
            }
        </Space>}
        {!props.current && <Loading/>}
    </Modal>
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

    useEffect(() => {
        form.setFieldsValue(props.data);
    }, [props.data.year])

    return <Form {...layout}
                 form={form}
                 name={`dec_form_${props.data.year}`}
                 size="small"
                 initialValues={props.data}
                 onValuesChange={(ch, all) => {
                     props.update({
                         ...props.data,
                         ...all
                     });
                 }}
    >
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
                        return <Form.Item label={val?.name} key={field.name}>
                            <Row gutter={[8, 8]} align="top">
                                <Col span={10}>
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
                                <Col span={6}>
                                    <Tooltip title="Indica si el ingreso es mensual o anual">
                                        <Form.Item name={[field.name, "periodicity"]}
                                                   fieldKey={[field.fieldKey, "periodicity"]}>
                                            <Radio.Group>
                                                <Radio.Button value="monthly"
                                                              style={{width: '100%'}}>Mensual</Radio.Button>
                                                <Radio.Button value="yearly"
                                                              style={{width: '100%'}}>Anual</Radio.Button>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Tooltip>
                                </Col>

                                <Col span={4}>
                                    <Tooltip title="Fuente"> {val?.source} </Tooltip>
                                </Col>

                                <Col span={4}>
                                    <Tooltip title="Eliminar ingreso">
                                        <MinusCircleOutlined onClick={() => funcs.remove(field.name)}/>
                                    </Tooltip>
                                </Col>
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

