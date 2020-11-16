import * as React from 'react';
import { Row, Col, Card, Space, Typography, Layout, Tooltip } from 'antd';
import { Header } from '../components/layout/Header';
import './PersonDetailPage.css'
import Footer from '../components/layout/Footer';
import { ReactComponent as Pytyvo } from '../assets/logos/pytyvo.svg';
import { ReactComponent as Nangareko } from '../assets/logos/nangareko.svg';
import { ReactComponent as Ande } from '../assets/logos/ande.svg';
import { ReactComponent as SalarioSfp } from '../assets/logos/salario_sfp.svg';
import { ReactComponent as Sfp } from '../assets/logos/sfp.svg';
import { ReactComponent as Ddjj } from '../assets/logos/ddjj.svg';
import { ReactComponent as Aqe } from '../assets/logos/a_quienes_elegimos.svg';
import { ReactComponent as PoliciaNacional } from '../assets/logos/policia_nacional.svg';
import Icon from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { SimpleApi } from '../SimpleApi';
import { useParams } from 'react-router-dom';
import { Affidavit, AnalysisSearchResult, LocalSearchResult, Authorities } from '../Model';
import { SFPRow, SFPFetcher } from '../SFPHelper';
import { GenericTable } from '../components/GenericTable';
import { formatMoney } from '../formatters';
import { AQE_URL, ESTADOS_CIVILES, PAISES_NACIMIENTO } from "../AQuienElegimosData";
export function PersonDetailPage() {

    const spans = { xxl: 8, xl: 8, lg: 8, md: 12, sm: 24, xs: 24};
    const config = { xxl: { offset: 0, span: 24 }, xl: { offset: 0, span: 24 }, lg: { offset: 0, span: 24 }, md: { offset: 0, span: 24 }, sm: { offset: 0, span: 24 }, xs: { offset: 0, span: 24 } };
    const cardHeight = 200;
    const { document } = useParams();
    const [affidavit, setAffidavit] = useState<Affidavit[]>();
    const [tsje, setTsje] = useState<Authorities[]>();
    const [sfpData, setSfpData] = useState<SFPLocalData>({});
    const [analysis, setAnalysis] = useState<AnalysisSearchResult>();
    const [local, setLocal] = useState<LocalSearchResult>();


    useEffect(() => {
        new SimpleApi()
            .findPeopleInAnalysis(document)
            .then(d => {
                setAnalysis(d);
                setAffidavit(d.analysis.declarations)
                setTsje(d.analysis.tsje_elected);
            })
        new SimpleApi()
            .findPeople(document)
            .then(d => { setLocal(d); });
    }, [document]);

     useEffect(() => {
 
         const fetcher = new SFPFetcher();
 
         fetcher.addHandler(data => {
             if (data.type === 'error') {
                 console.warn(`No se puede cargar datos del año ${data.year} para ${document}`, 5000);
                 return;
             }
             setSfpData(prev => ({
                 ...prev,
                 [`${data.year}`]: data.data
             }));
         });
         fetcher.fetchAllYears(document)
         return () => fetcher.cancel();
     }, [document])

    const header = tryToGuestHeader(document, affidavit, sfpData, analysis, local);
    return <>
        <Header tableMode={true} />
        <Layout>
            <Layout.Content style={{minHeight: '80vh', padding: '0 5%'}}>
                <Row gutter={[16, 16]}>
                    <Col xxl= {8} xl= {8} lg= {8} md= {12} sm= {24} xs={24}>
                        <Typography.Title level={2} className="title-layout-content">
                            {header.name}
                        </Typography.Title>
                    </Col>
                    <Col xxl= {12} xl= {12} lg= {12} md= {12} sm= {24} xs={24} style={{padding: 25}}>
                        <Tooltip title="SFP">
                            <Icon component={Sfp} style={{  color: ((local?.staging.sfp.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)') , fontSize: '30px' }} />
                        </Tooltip>
                        <Tooltip title="Declaraciones Juradas">
                            <Icon component={Ddjj} style={{ color: ((analysis?.analysis.declarations.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'), fontSize: '30px' }} />
                        </Tooltip>
                        <Tooltip title="Pytyvo">
                            <Icon component={Pytyvo} style={{ color: ((local?.staging.pytyvo.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'), fontSize: '30px' }} />
                        </Tooltip>
                        <Tooltip title="Ñangareko">
                            <Icon component={Nangareko} style={{ color: ((local?.staging.nangareko.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'), fontSize: '30px' }} />
                        </Tooltip>
                        <Tooltip title="ANDE">
                            <Icon component={Ande} style={{ color: ((local?.staging.ande_exonerados.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'), fontSize: '30px' }} />
                        </Tooltip>
                        <Tooltip title="Policia Nacional">
                            <Icon component={PoliciaNacional} style={{ color: ((local?.staging.policia.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'), fontSize: '30px' }} />
                        </Tooltip>
                        <Tooltip title="A Quien Elegimos">
                            <Icon component={Aqe} style={{ color: ((local?.staging.a_quien_elegimos.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'), fontSize: '30px' }} />
                        </Tooltip>
                    </Col>
                    <Space direction="vertical" />
                    <Col {...config}>
                        <Card className="card-style header-title-big" title="Datos Personales" cover={<img src={header.imageURL} style={{width: '25%'}} />}>
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
                    <Col {...config}>
                        <Card className="card-style header-title-medium" title="Cargo">
                            <Typography.Text className="text-layout-content">
                                {header.charge || 'No encontrado'}
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
                                <Typography.Text>Presupuesto: {formatMoney((local.staging.hacienda_funcionarios[0] as any).montopresupuestado)} </Typography.Text>
                                <br />
                                <Typography.Text>Devengado: {formatMoney((local.staging.hacienda_funcionarios[0] as any).montodevengado)} </Typography.Text>
                            </Card>
                        </Col>
                    }
                    {
                        local?.staging.policia && local?.staging.policia.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="Policía Nacional" style={{ height: cardHeight }} extra={<Icon component={PoliciaNacional} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                <Typography.Text>Año: {(local.staging.policia[0] as any).ano} </Typography.Text>
                                <br />
                                <Typography.Text>Presupuesto: {formatMoney((local.staging.policia[0] as any).presupuesto)} </Typography.Text>
                                <br />
                                <Typography.Text>Remuneración: {formatMoney((local.staging.policia[0] as any).remuneracion)} </Typography.Text>
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
                        affidavit.map(
                            declaration =>
                            <Col {...spans}>
                                <Card className="data-box" title="Declaración Jurada" style={{ height: cardHeight }} extra={<Icon component={Ddjj} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}    >
                                    <Typography.Text>Año (Revisión): {declaration.year} ({declaration.revision}) </Typography.Text>
                                    <br />
                                    <Typography.Text>Activos: {formatMoney(declaration.actives)} </Typography.Text>
                                    <br />
                                    <Typography.Text>Pasivos: {formatMoney(declaration.passive)} </Typography.Text>
                                    <br />
                                    <Typography.Text>Patrimonio Neto: {formatMoney(declaration.networth)} </Typography.Text>
                                    <br />
                                    <a href={`${declaration.link}`} target="_blank" rel="noopener noreferrer">Link</a>
                                </Card>
                            </Col>
                        )
                    }
                    {
                        tsje && tsje.length > 0 &&
                        tsje.map(
                            election =>
                            <Col {...spans}>
                                <Card className="data-box" title="TSJE" style={{ height: cardHeight }} extra={<Icon component={Ddjj} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}    >
                                    <Typography.Text>Año: {election.ano} </Typography.Text>
                                    <br />
                                    <Typography.Text>Candidatura: {election.cand_desc} </Typography.Text>
                                    <br />
                                    <Typography.Text>Nombre Lista: {election.nombre_lista} ({election.siglas_lista}) </Typography.Text>
                                    <br />
                                </Card>
                            </Col>
                        )
                    }
                    {
                        local && local.staging && local.staging.a_quien_elegimos && local.staging.a_quien_elegimos.length > 0 &&
                        <Col {...spans}>
                            <Card className="data-box" title="A quien elegimos" extra={<Icon component={Aqe} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} />}>
                                {local.staging.a_quien_elegimos[0].date_of_death && local.staging.a_quien_elegimos[0].date_of_death.length > 1 ?<Typography.Text>Fecha de muerte: {local.staging.a_quien_elegimos[0].date_of_death} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].national_identity ?<Typography.Text>País de nacimiento: {PAISES_NACIMIENTO[local.staging.a_quien_elegimos[0].national_identity]} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].city_of_residence ?<Typography.Text>Ciudad de residencia: {local.staging.a_quien_elegimos[0].city_of_residence} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].estado_civil ?<Typography.Text>Estado civil: {ESTADOS_CIVILES[local.staging.a_quien_elegimos[0].estado_civil]} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].decendents ?<Typography.Text>Cantidad de hijos: {local.staging.a_quien_elegimos[0].decendents} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].email_address ?<Typography.Text>Email: {local.staging.a_quien_elegimos[0].email_address} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].phone ?<Typography.Text>Teléfono de contacto: {local.staging.a_quien_elegimos[0].phone} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].contact_detail ?<Typography.Text>Teléfono celular: {local.staging.a_quien_elegimos[0].contact_detail} <br /> </Typography.Text>: ''}
                                {local.staging.a_quien_elegimos[0].tw ? <Typography.Text>- <a href={local.staging.a_quien_elegimos[0].tw}>Twitter</a> </Typography.Text> : '' }
                                {local.staging.a_quien_elegimos[0].fb ? <Typography.Text>- <a href={local.staging.a_quien_elegimos[0].fb}>Facebook</a> </Typography.Text> : '' }
                                {local.staging.a_quien_elegimos[0].insta ? <Typography.Text>- <a href={local.staging.a_quien_elegimos[0].insta}>Instagram</a> </Typography.Text> : ''}
                                {local.staging.a_quien_elegimos[0].insta || local.staging.a_quien_elegimos[0].fb || local.staging.a_quien_elegimos[0].tw ? <br/>: '' }
                                <a href={`${AQE_URL}/detalle-persona/${local.staging.a_quien_elegimos[0].id}`} target="_blank" rel="noopener noreferrer">Link</a>
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
    let imageURL = '';
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
        const aquienelegimos: any = local.staging.a_quien_elegimos[0];
        if (aquienelegimos) {
            if(aquienelegimos.head_shot) {
                imageURL = `${AQE_URL}/media/${local.staging.a_quien_elegimos[0].head_shot}`;
            }
            if(aquienelegimos.identifier) {
                document = aquienelegimos.identifier
            }
            if(aquienelegimos.name && aquienelegimos.lastName) {
                name =  `${aquienelegimos.name} ${aquienelegimos.lastName}`
            }
            if(aquienelegimos.date_of_birth) {
                birthDate = aquienelegimos.date_of_birth.substr(0, 10);
            }
        }
    }

    return {
        found,
        name,
        document,
        charge,
        birthDate,
        imageURL
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