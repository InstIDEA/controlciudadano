import * as React from 'react';
import {useEffect, useState} from 'react';
import {Avatar, Card, Col, Layout, Row, Tooltip, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './PersonDetailPage.css'
import Footer from '../components/layout/Footer';
import {ReactComponent as Pytyvo} from '../assets/logos/pytyvo.svg';
import {ReactComponent as Nangareko} from '../assets/logos/nangareko.svg';
import {ReactComponent as Ande} from '../assets/logos/ande.svg';
import {ReactComponent as SalarioSfp} from '../assets/logos/salario_sfp.svg';
import {ReactComponent as Sfp} from '../assets/logos/sfp.svg';
import {ReactComponent as Ddjj} from '../assets/logos/ddjj.svg';
import {ReactComponent as Aqe} from '../assets/logos/a_quienes_elegimos.svg';
import {ReactComponent as PoliciaNacional} from '../assets/logos/policia_nacional.svg';
import Icon from '@ant-design/icons';
import {SimpleApi} from '../SimpleApi';
import {useParams} from 'react-router-dom';
import {Affidavit, AnalysisSearchResult, Authorities, LocalSearchResult} from '../Model';
import {SFPFetcher, SFPRow} from '../SFPHelper';
import {GenericTable} from '../components/GenericTable';
import {formatMoney, getInitials} from '../formatters';
import {AQECard} from '../components/person_cards/AQE';
import {TSJECard} from '../components/person_cards/TSJE';
import {DDJJCard} from "../components/person_cards/DDJJ";
import {Cargo, ChargeCard} from "../components/person_cards/Charge";
import {AQE_URL} from "../AQuienElegimosData";
import {HaciendaCard} from "../components/person_cards/Hacienda";
import {SFPCard} from "../components/person_cards/SFP";

export function PersonDetailPage() {

    const spans = {xxl: 8, xl: 8, lg: 8, md: 12, sm: 24, xs: 24};
    const config = {
        xxl: {offset: 0, span: 24},
        xl: {offset: 0, span: 24},
        lg: {offset: 0, span: 24},
        md: {offset: 0, span: 24},
        sm: {offset: 0, span: 24},
        xs: {offset: 0, span: 24}
    };
    const cardHeight = 200;
    const {document} = useParams<{ document: string }>();
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
            .then(d => {
                setLocal(d);
            });
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
        <Header tableMode={true}/>
        <Layout>
            <Layout.Content style={{minHeight: '80vh', padding: '0 5%'}}>
                <Row gutter={[16, 16]} justify="space-around" align="middle" style={{paddingTop: 20}}>
                    <Col md={14} xs={20} style={{alignSelf: 'flex-end'}}>
                        <Typography.Title style={{color: "rgba(0, 52, 91, 1)"}} level={2}>
                            {header.name}
                        </Typography.Title>
                    </Col>
                    <Col md={8} xs={24} style={{padding: 25, textAlign: 'right'}}>
                        <Tooltip title="SFP">
                            <Icon component={Sfp} style={{
                                color: ((local?.staging.sfp.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                        <Tooltip title="Declaraciones Juradas">
                            <Icon component={Ddjj} style={{
                                color: ((analysis?.analysis.declarations.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                        <Tooltip title="Pytyvo">
                            <Icon component={Pytyvo} style={{
                                color: ((local?.staging.pytyvo.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                        <Tooltip title="Ñangareko">
                            <Icon component={Nangareko} style={{
                                color: ((local?.staging.nangareko.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                        <Tooltip title="ANDE">
                            <Icon component={Ande} style={{
                                color: ((local?.staging.ande_exonerados.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                        <Tooltip title="Policia Nacional">
                            <Icon component={PoliciaNacional} style={{
                                color: ((local?.staging.policia.length || []) > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                        <Tooltip title="A Quien Elegimos">
                            <Icon component={Aqe} style={{
                                color: ((local?.staging?.a_quien_elegimos || []).length > 0 ? 'rgba(0, 52, 91, 1)' : 'rgba(171, 171, 171, 1)'),
                                fontSize: '30px'
                            }}/>
                        </Tooltip>
                    </Col>
                </Row>
                <Row>
                    <Col {...config}>
                        <Card className="card-style header-title-big">
                            <Row gutter={[16, 16]} align="middle">
                                <Col xxl={3} xl={3} md={4} xs={6} style={{alignSelf: 'flex-end', textAlign: "center"}}>
                                    {header.imageURL && <Avatar size={100} src={header.imageURL}/>}
                                    {!header.imageURL && <Avatar size={100} style={{
                                        color: '#00345b',
                                        backgroundColor: '#dfedfb'
                                    }}>{getInitials(header.name)}</Avatar>}
                                </Col>
                                <Col xxl={21} xl={21} md={20} xs={18} style={{alignSelf: 'flex-end'}}>
                                    <Typography.Title style={{color: "rgba(0, 52, 91, 1)"}} level={3}>
                                        Datos Personales
                                    </Typography.Title>
                                    <Typography.Text className="text-layout-content">
                                        <strong>Documento: </strong> {header.document || 'No encontrado'}
                                    </Typography.Text>
                                    <br/>
                                    <Typography.Text className="text-layout-content">
                                        <strong>Nombre: </strong>{header.name || 'No encontrado'}
                                    </Typography.Text>
                                    <br/>
                                    <Typography.Text className="text-layout-content">
                                        <strong>Fecha de nacimiento: </strong> {header.birthDate || 'No encontrado'}
                                    </Typography.Text>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} style={{alignSelf: 'flex-end'}}>
                        <Typography.Title style={{color: "rgba(0, 52, 91, 1)"}} level={3}>Datos públicos según fuentes</Typography.Title>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    {
                        affidavit && affidavit.length > 0 && <DDJJCard affidavit={affidavit} />
                    }
                    {
                        tsje && tsje.length > 0 && <TSJECard tsje={tsje}/>
                    }
                    {
                        local?.staging.pytyvo && local?.staging.pytyvo.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Pytyvo" style={{height: cardHeight}}
                                extra={<Icon component={Pytyvo}
                                             style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
                            <Typography.Text>Departamento: {local.staging.pytyvo[0].department} </Typography.Text>
                            <br/>
                            <Typography.Text>Distrito: {local.staging.pytyvo[0].district} </Typography.Text>
                          </Card>
                        </Col>
                    }
                    {
                        local?.staging.nangareko && local?.staging.nangareko.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Ñangareko" style={{height: cardHeight}}
                                extra={<Icon component={Nangareko}
                                             style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
                            <Typography.Text>Departamento: {local.staging.nangareko[0].department} </Typography.Text>
                            <br/>
                            <Typography.Text>Distrito: {local.staging.nangareko[0].district} </Typography.Text>
                          </Card>
                        </Col>
                    }

                    {
                        local?.staging.hacienda_funcionarios && local?.staging.hacienda_funcionarios.length > 0 &&
                        <HaciendaCard data={local.staging.hacienda_funcionarios} document={header.document}></HaciendaCard>
                    }
                    {/*
                        local?.staging.hacienda_funcionarios && local?.staging.hacienda_funcionarios.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Salarios de hacienda" style={{height: cardHeight}}
                                extra={<Icon component={Sfp}
                                             style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}
                                actions={[
                                    <a href={`https://datos.hacienda.gov.py/doc/nomina/${header.document}`} target="_blank" rel="noopener noreferrer">Mas info</a>
                                ]}>
                            <Typography.Text>Año: {(local.staging.hacienda_funcionarios[0] as any).anio} </Typography.Text>
                            <br/>
                            <Typography.Text>Presupuesto: {formatMoney((local.staging.hacienda_funcionarios[0] as any).montopresupuestado)} </Typography.Text>
                            <br/>
                            <Typography.Text>Devengado: {formatMoney((local.staging.hacienda_funcionarios[0] as any).montodevengado)} </Typography.Text>
                          </Card>
                        </Col>*/
                    }
                    {
                        /*sfpData && sfpData. > 0 && <SFPCard data={sfpData.} document={header.document} />
                        /*<Col {...spans}>
                            <Card className="data-box" title="SFP" style={{height: cardHeight}}
                                  extra={<Icon component={SalarioSfp} style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
                                <Typography.Text>Año: {local.staging.sfp[0].anho} </Typography.Text>
                                <br/>
                                <Typography.Text>Profesión: {(local.staging.sfp[0]).profesion} </Typography.Text>
                                <br/>
                                <Typography.Text>Función: {local.staging.sfp[0].funcion} </Typography.Text>
                                <br/>
                                <a href={`${local.staging.sfp[0].source}`} target="_blank"
                                   rel="noopener noreferrer">Link</a>
                            </Card>
                        </Col>*/
                    }
                    {
                        local?.staging.policia && local?.staging.policia.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Policía Nacional" style={{height: cardHeight}}
                                extra={<Icon component={PoliciaNacional}
                                             style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
                            <Typography.Text>Año: {(local.staging.policia[0] as any).ano} </Typography.Text>
                            <br/>
                            <Typography.Text>Presupuesto: {formatMoney((local.staging.policia[0] as any).presupuesto)} </Typography.Text>
                            <br/>
                            <Typography.Text>Remuneración: {formatMoney((local.staging.policia[0] as any).remuneracion)} </Typography.Text>
                          </Card>
                        </Col>
                    }
                    {
                        local?.staging.ande_exonerados && local?.staging.ande_exonerados.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="ANDE" style={{height: cardHeight}}
                                extra={<Icon component={Ande}
                                             style={{color: 'rgba(0, 52, 91, 1)', fontSize: '30px'}}/>}>
                            <Typography.Text>Agencia: {local.staging.ande_exonerados[0].agencia} </Typography.Text>
                            <br/>
                            <Typography.Text>NIS: {local.staging.ande_exonerados[0].nis} </Typography.Text>
                          </Card>
                        </Col>

                    }
                    {
                        header.charge && header.charge.length > 0 && <ChargeCard cargos={header.charge} spans={spans} document={header.document} />
                    }
                    {
                        local && local.staging && local.staging.a_quien_elegimos && local.staging.a_quien_elegimos.length > 0 &&
                        <AQECard colProps={spans} person={local.staging.a_quien_elegimos[0]}/>
                    }
                </Row>
            </Layout.Content>
        </Layout>
        <Footer tableMode={true}/>
    </>

}

export type SFPLocalData = {
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
    let charge: Array<Cargo> = new Array<Cargo>();
    let birthDate = '';
    let imageURL = '';
    if (affidavit !== undefined) {
        found = true;
        if (affidavit.length > 0) {
            name = affidavit[0].name;
            affidavit.forEach(a => {
                if(a.charge){
                    charge.push({cargo: a.charge, ano:a.year});
                }
            });
        }
    }

    Object.values(sfpData).forEach(rows => {
        if (!rows || !rows.length) return;
        const d = rows[0];
        name = d.nombres + ' ' + d.apellidos;
        found = true;
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
        const aqe = local.staging && local.staging.a_quien_elegimos && local.staging.a_quien_elegimos[0];
        if (aqe) {
            if (aqe.head_shot) {
                imageURL = `https://datos.aquieneselegimos.org.py/media/${local.staging.a_quien_elegimos[0].head_shot}`;
            }
            if (aqe.identifier) {
                document = aqe.identifier + "";
            }
            if (aqe.name && aqe.lastname) {
                name = `${aqe.name} ${aqe.lastname}`
            }
            if (aqe.date_of_birth) {
                birthDate = aqe.date_of_birth.substr(0, 10);
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

