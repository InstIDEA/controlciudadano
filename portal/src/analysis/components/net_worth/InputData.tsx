import {DeclarationData, NetWorthIncrementData} from "../../AnalysisModel";
import {Card, Col, Form, Input, InputNumber, Row, Typography} from "antd";
import React from "react";
import {FieldData} from 'rc-field-form/lib/interface';
import {formatMoney} from "../../../formatters";

export function InputData(props: {
    data: NetWorthIncrementData,
    updateDate: (newData: DeclarationData) => void
}) {
    return <Row justify="center" gutter={[0, 16]}>
        <Col sm={24}>
            <Typography.Title level={5} className="title-color">
                Datos
            </Typography.Title>
        </Col>
        <Col sm={24}>
            <Card className="custom-card-no-shadow">
                <Typography.Title level={5} className="title-color">
                    Año: {props.data.firstYear.year}
                </Typography.Title>
                <SingleDeclaration data={props.data.firstYear} update={props.updateDate}/>
            </Card>
        </Col>
        <Col sm={24}>
            <Card className="custom-card-no-shadow">
                <Typography.Title level={5} className="title-color">
                    Año: {props.data.lastYear.year}
                </Typography.Title>
                <SingleDeclaration data={props.data.lastYear} update={props.updateDate}/>
            </Card>
        </Col>

    </Row>
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
                 initialValues={props.data}
                 onFieldsChange={(ch, all) => {
                     console.log(buildData(props.data, all));
                     props.update(buildData(props.data, all));
                 }}
    >
        <Form.Item name="income" label="Sueldo mensual:" rules={[{required: true}]}>
            <InputNumber precision={0} style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item name="otherActives" label="Otros activos:" rules={[{required: true}]}>
            <InputNumber precision={0} style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item label="Total activos">
            <Input disabled value={formatMoney(props.data.active)}/>
        </Form.Item>
        <Form.Item name="passive" label="Total Pasivos" rules={[{required: true}]}>
            <InputNumber precision={0} style={{width: '100%'}}/>
        </Form.Item>
        <Form.Item label="Patrimonio Neto">
            <Input disabled value={formatMoney(props.data.netWorth)}/>
        </Form.Item>
    </Form>;
}

function buildData(
    original: DeclarationData,
    newValues: FieldData[]
): DeclarationData {
    const numberFields = ["active", "passive", "income", "otherActives"]
    const newDec: any = {};
    for (const val of newValues) {
        const name = Array.isArray(val.name) ? `${val.name[0]}` : null;
        let finalVal: any = val.value;
        if (name === null) continue;
        if (numberFields.includes(name)) finalVal = parseFloat(finalVal);
        newDec[name] = finalVal;
    }
    return {
        ...original,
        ...newDec
    }
}
