import * as React from 'react';
import { Row, Col, Card, Space, Typography, Layout, message } from 'antd';
import { Header } from '../components/layout/Header';
import './PersonDetailPage.css'
import Footer from '../components/layout/Footer';
import { ReactComponent as Pytyvo } from '../assets/logos/pytyvo.svg';
import { ReactComponent as Nangareko } from '../assets/logos/nangareko.svg';
import { ReactComponent as Ande } from '../assets/logos/ande.svg';
import { ReactComponent as SalarioSfp } from '../assets/logos/salario_sfp.svg';
import { ReactComponent as Sfp } from '../assets/logos/sfp.svg';
import { ReactComponent as Ddjj } from '../assets/logos/ddjj.svg';
import { ReactComponent as PoliciaNacional } from '../assets/logos/policia_nacional.svg';
import Icon from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { SimpleApi } from '../SimpleApi';
import { useParams } from 'react-router-dom';
import { Affidavit, AnalysisSearchResult, LocalSearchResult } from '../Model';
import { SFPRow, SFPFetcher } from '../SFPHelper';
import { GenericTable } from '../components/GenericTable';
export function PersonDetailPage() {

    const spans = { xxl: 8, xl: 8, lg: 8, md: 12, sm: 24, xs: 24};
    const config = { xxl: { offset: 0, span: 24 }, xl: { offset: 0, span: 24 }, lg: { offset: 0, span: 24 }, md: { offset: 0, span: 24 }, sm: { offset: 0, span: 24 }, xs: { offset: 0, span: 24 } };
    const cardHeight = 200;
    const { document } = useParams();
    const [affidavit, setAffidavit] = useState<Affidavit[]>();
    const [sfpData, setSfpData] = useState<SFPLocalData>({});
    const [analysis, setAnalysis] = useState<AnalysisSearchResult>();
    const [local, setLocal] = useState<LocalSearchResult>();


    useEffect(() => {
        new SimpleApi()
            .findPeopleInAnalysis(document)
            .then(d => {
                setAnalysis(d);
                setAffidavit(d.analysis.declarations)
                console.log(d)
            })
        new SimpleApi()
            .findPeople(document)
            .then(d => { setLocal(d); console.log(d) });
    }, [document]);

    useEffect(() => {
 
         const fetcher = new SFPFetcher();
 
         fetcher.addHandler(data => {
             if (data.type === 'error') {
                 message.warn(`No se puede cargar datos del año ${data.year} para ${document}`, 5000);
                 return;
             }
             setSfpData(prev => ({
                 ...prev,
                 [`${data.year}`]: data.data
             }));
         });
         console.log(fetcher);
         fetcher.fetchAllYears(document)
         return () => fetcher.cancel();
     }, [document])

    const header = tryToGuestHeader(document, affidavit, sfpData, analysis, local);
    return <>
        <Header tableMode={true} />
        <Layout>
            <Layout.Content style={{minHeight: '80vh', padding: '0 5%'}}>
                <Row gutter={[16, 16]}>
                    <Col {...config}>
                        <Typography.Title level={2} className="title-layout-content">
                            {header.name}
                        </Typography.Title>
                    </Col>
                    <Space direction="vertical" />
                    <Col {...config}>
                        <Card className="card-style header-title-big" title="Cargo">
                            <Typography.Text className="text-layout-content">
                                {header.charge || 'No encontrado'}
                            </Typography.Text>
                        </Card>
                    </Col>
                    <Col {...config}>
                        <Card className="card-style header-title-big" title="Datos Personales">
                            <Typography.Text className="text-layout-content">
                                <strong>Documento: </strong> {header.document || 'No encontrado'}
                            </Typography.Text>
                            <br />
                            <Typography.Text className="text-layout-content">
                                <strong>Nombre: </strong>{header.name || 'No encontrado'}
                            </Typography.Text>
                            <br />
                            <Typography.Text className="text-layout-content">
                                <strong>Fecha de nacimiento: </strong> {header.birthDate || 'No encontrado'}
                            </Typography.Text>

                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    {
                        local?.staging.pytyvo && local?.staging.pytyvo.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="Pytyvo" style={{ height: cardHeight }} extra={<Icon component={Pytyvo} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Departamento: {(local.staging.pytyvo[0] as any).department} </Typography.Text>
                                <br />
                                <Typography.Text>Distrito: {(local.staging.pytyvo[0] as any).district} </Typography.Text>
                            </Card>
                        </Col>
                    }
                    {
                        local?.staging.nangareko && local?.staging.nangareko.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="Ñangareko" style={{ height: cardHeight }} extra={<Icon component={Nangareko} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Departamento: {(local.staging.nangareko[0] as any).department} </Typography.Text>
                                <br />
                                <Typography.Text>Distrito: {(local.staging.nangareko[0] as any).district} </Typography.Text>
                            </Card>
                        </Col>
                    }
                    {
                        local?.staging.sfp && local?.staging.sfp.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="SFP" style={{ height: cardHeight }} extra={<Icon component={Sfp} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Año: {(local.staging.sfp[0] as any).anho} </Typography.Text>
                                <br />
                                <Typography.Text>Profesión: {(local.staging.sfp[0] as any).profesion} </Typography.Text>
                                <br />
                                <Typography.Text>Función: {(local.staging.sfp[0] as any).funcion} </Typography.Text>
                                <br/>
                                <a href={`${(local.staging.sfp[0] as any).source}`} target="_blank" rel="noopener noreferrer">Link</a>
                            </Card>
                        </Col>

                    }
                    {
                        local?.staging.hacienda_funcionarios && local?.staging.hacienda_funcionarios.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="Salarios SFP" style={{ height: cardHeight }} extra={<Icon component={SalarioSfp} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Año: {(local.staging.hacienda_funcionarios[0] as any).anio} </Typography.Text>
                                <br />
                                <Typography.Text>Presupuesto: {(local.staging.hacienda_funcionarios[0] as any).montopresupuestado} </Typography.Text>
                                <br />
                                <Typography.Text>Devengado: {(local.staging.hacienda_funcionarios[0] as any).montodevengado} </Typography.Text>
                            </Card>
                        </Col>
                    }
                    {
                        local?.staging.policia && local?.staging.policia.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="Policía Nacional" style={{ height: cardHeight }} extra={<Icon component={PoliciaNacional} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Año: {(local.staging.policia[0] as any).ano} </Typography.Text>
                                <br />
                                <Typography.Text>Presupuesto: {(local.staging.policia[0] as any).presupuesto} </Typography.Text>
                                <br />
                                <Typography.Text>Remuneración: {(local.staging.policia[0] as any).remuneracion} </Typography.Text>
                            </Card>
                        </Col>
                    }
                    {
                        local?.staging.ande_exonerados && local?.staging.ande_exonerados.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="ANDE" style={{ height: cardHeight }} extra={<Icon component={Ande} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Agencia: {local.staging.ande_exonerados[0].agencia} </Typography.Text>
                                <br />
                                <Typography.Text>NIS: {local.staging.ande_exonerados[0].nis} </Typography.Text>
                            </Card>
                        </Col>

                    }
                    {
                        affidavit && affidavit.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="Declaración Jurada" style={{ height: cardHeight }} extra={<Icon component={Ddjj} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}    >
                                <Typography.Text>Año (Revisión): {affidavit[0].year} ({affidavit[0].revision}) </Typography.Text>
                                <br />
                                <Typography.Text>Activos: {affidavit[0].actives} </Typography.Text>
                                <br />
                                <Typography.Text>Pasivos: {affidavit[0].passive} </Typography.Text>
                                <br />
                                <Typography.Text>Patrimonio Neto: {affidavit[0].networth} </Typography.Text>
                                <br />
                                <a href={`${affidavit[0].source}`} target="_blank" rel="noopener noreferrer">Link</a>
                            </Card>
                        </Col>
                    }
                </Row>
            </Layout.Content>
        </Layout>
        <Footer tableMode={true} />
    </>

}

type SFPLocalData = {
    [k: string]: SFPRow[]
}

function tryToGuestHeader(baseDoc: string,
    affidavit: Affidavit[] | undefined,
    sfpData: SFPLocalData,
    analysis?: AnalysisSearchResult,
    local?: LocalSearchResult
) {

    let name = '';
    let document = baseDoc;
    let found = false;
    let charge = '';
    let birthDate = '';
    if (affidavit !== undefined) {
        found = true;
        if (affidavit.length > 0) {
            name = affidavit[0].name;
            charge = affidavit[0].charge;
        }
    }

    Object.values(sfpData).forEach(rows => {
        if (!rows || !rows.length) return;
        const d = rows[0];
        name = d.nombres + ' ' + d.apellidos;
        found = true;
        if (d.funcion) {
            charge = d.funcion
        }
        birthDate = d.fechaNacimiento;
    })

    if (analysis && analysis.analysis) {
        const election = analysis.analysis.tsje_elected;
        if (election && election.length > 0) {
            name = name || `${election[0].nombre} ${election[0].apellido}`;
        }
    }

    if (local && local.staging) {
        const ande = local.staging.ande_exonerados;
        if (ande && ande.length > 0) {
            name = name || `${ande[0].cliente}`;
        }
        const nangareko: any = local.staging.nangareko;
        if (nangareko && nangareko.length) {
            name = name || `${nangareko[0].name}`;
        }
        const hacienda: any = local.staging.hacienda_funcionarios;
        if (hacienda && hacienda.length) {
            name = name || `${hacienda[0].nombres} ${hacienda[0].apellidos}`;
        }
    }

    return {
        found,
        name,
        document,
        charge,
        birthDate
    }
}

export function LocalData(props: { s: string, result: LocalSearchResult, showEmpty: boolean }) {
    if (!props.result || !props.result.staging) {
        return <></>
    }
    const { staging } = props.result;

    let toShow = Object.keys(staging)
        .map(key => {
            const data: unknown[] = staging[key as keyof LocalSearchResult['staging']] || [];
            return { key, data }
        });

    if (!props.showEmpty) {
        toShow = toShow.filter(f => f.data.length);
    }

    return <>
        {toShow.map(source =>
            <GenericTable data={source.data} />
        )}
    </>

}