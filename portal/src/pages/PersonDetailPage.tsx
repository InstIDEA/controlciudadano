import * as React from 'react';
import {useEffect, useMemo, useState} from 'react';
import {Avatar, Card, Col, Layout, Row, Space, Tooltip, Typography} from 'antd';
import {Header} from '../components/layout/Header';
import './PersonDetailPage.css'
import Footer from '../components/layout/Footer';
import {ReactComponent as Pytyvo} from '../assets/logos/pytyvo.svg';
import {ReactComponent as Nangareko} from '../assets/logos/nangareko.svg';
import {ReactComponent as Ande} from '../assets/logos/ande.svg';
import {ReactComponent as HaciendaIcon} from '../assets/logos/hacienda.svg';
import {ReactComponent as Sfp} from '../assets/logos/sfp.svg';
import {ReactComponent as Ddjj} from '../assets/logos/ddjj.svg';
import {ReactComponent as Aqe} from '../assets/logos/a_quienes_elegimos.svg';
import {ReactComponent as PoliciaNacional} from '../assets/logos/policia_nacional.svg';
import Icon from '@ant-design/icons';
import {SimpleApi} from '../SimpleApi';
import {useParams} from 'react-router-dom';
import {Affidavit, AnalysisSearchResult, Authorities, Hacienda, LocalSearchResult} from '../Model';
import {SFPRow} from '../SFPHelper';
import {formatMoney, getInitials} from '../formatters';
import {AQECard} from '../components/person_cards/AQE';
import {TSJECard} from '../components/person_cards/TSJE';
import {DDJJCard} from "../components/person_cards/DDJJ";
import {Charge, ChargeCard} from "../components/person_cards/Charge";
import {HaciendaCard} from "../components/person_cards/Hacienda";
import {SFPCard} from '../components/person_cards/SFP';
import {COLOR_GREY, COLOR_ORANGE} from "../Constants";
import {useMediaQuery} from '@react-hook/media-query';
import {SOURCE_NAME_MAP} from "./PersonSearchPage";
import {fixName} from '../nameUtils';

export function PersonDetailPage() {

    const isSmall = useMediaQuery('only screen and (max-width: 768px)');
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
    const [analysis, setAnalysis] = useState<AnalysisSearchResult>();
    const [local, setLocal] = useState<LocalSearchResult>();


    useEffect(() => {
        new SimpleApi()
            .findPeopleInAnalysis(document)
            .then(d => {
                if (!d || !d.analysis) return;
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

    const header = useMemo(
        () => tryToGuestHeader(document, affidavit, analysis, local),
        [document, affidavit, analysis, local]
    );

    return <>
        <Header tableMode={true}/>
        <Layout>
            <Layout.Content style={{minHeight: '80vh', padding: '0 5%'}}>
                <Row gutter={[16, 16]} justify="space-around" align="middle" style={{paddingTop: 20}}>
                    <Col md={14} xs={20} style={{alignSelf: 'flex-end'}}>
                        <Typography.Title style={{color: COLOR_ORANGE}} level={2}>
                            {header.name}
                        </Typography.Title>
                    </Col>
                    <Col md={8} xs={24} style={{padding: isSmall ? 0 : 25, textAlign: isSmall ? 'center' : 'right'}}>
                        <Sources local={local} analysis={analysis}/>
                    </Col>
                </Row>
                <Row>
                    <Col {...config}>
                        <Card className="card-style header-title-big">
                            <Row gutter={[16, 16]} align="middle">
                                <Col xxl={3} xl={3} md={4} sm={6} xs={24}
                                     style={{alignSelf: 'flex-end', textAlign: "center"}}>
                                    {header.imageURL && <Avatar size={100} src={header.imageURL}/>}
                                    {!header.imageURL && <Avatar size={100} className={"avatar-person"} style={{
                                        color: '#00345b',
                                        backgroundColor: '#dfedfb'
                                    }}>{getInitials(header.name)}</Avatar>}
                                </Col>
                                <Col xxl={21} xl={21} md={20} sm={18} xs={24} style={{alignSelf: 'flex-end'}}>
                                    <Typography.Title style={{color: "rgba(0, 52, 91, 1)"}} level={3}>
                                        Datos Personales
                                    </Typography.Title>
                                    <Typography.Text className="text-layout-content">
                                        <strong>Documento: </strong> {formatMoney(header.document) || 'No encontrado'}
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
                        <Typography.Title style={{color: "rgba(0, 52, 91, 1)"}} level={3}>Datos públicos según
                            fuentes</Typography.Title>
                    </Col>
                </Row>
                <Row gutter={[16, 16]}>
                    {
                        affidavit && affidavit.length > 0 && <DDJJCard affidavit={affidavit}/>
                    }
                    {
                        tsje && tsje.length > 0 && <TSJECard tsje={tsje}/>
                    }
                    {
                        local?.staging.pytyvo && local?.staging.pytyvo.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Pytyvo" style={{height: cardHeight}}
                                extra={<Icon component={Pytyvo} className="icon-card"/>}>
                            <Space direction="vertical">
                              <LVRow label={"Departamento"} value={local.staging.pytyvo[0].department}/>
                              <LVRow label={"Distrito"} value={local.staging.pytyvo[0].district}/>
                            </Space>
                          </Card>
                        </Col>
                    }
                    {
                        local?.staging.nangareko && local?.staging.nangareko.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Ñangareko" style={{height: cardHeight}}
                                extra={<Icon component={Nangareko} className="icon-card"/>}>
                            <Space direction="vertical">
                              <LVRow label={"Departamento"} value={local.staging.nangareko[0].department}/>
                              <LVRow label={"Distrito"} value={local.staging.nangareko[0].district}/>
                            </Space>
                          </Card>
                        </Col>
                    }

                    {
                        local?.staging.hacienda_funcionarios && local?.staging.hacienda_funcionarios.length > 0 &&
                        <HaciendaCard data={local.staging.hacienda_funcionarios}
                                      document={header.document}/>
                    }

                    {
                        local?.staging.sfp && local?.staging.sfp.length > 0 &&
                        <SFPCard data={local.staging.sfp}
                                 document={header.document}/>
                    }

                    {
                        local?.staging.policia && local?.staging.policia.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Policía Nacional" style={{height: cardHeight}}
                                extra={<Icon component={PoliciaNacional} className="icon-card"/>}>
                            <Space direction="vertical">
                              <LVRow label={"Año"} value={local.staging.policia[0].ano}/>
                              <LVRow label={"Presupuesto"} value={local.staging.policia[0].presupuesto}/>
                              <LVRow label={"Remuneración"} value={local.staging.policia[0].remuneracion}/>
                            </Space>
                          </Card>
                        </Col>
                    }
                    {
                        local?.staging.ande_exonerados && local?.staging.ande_exonerados.length > 0 &&
                        <Col {...spans}>
                          <Card className="data-box" title="Exonerado por la ANDE durante la Pandemia COVID 19"
                                style={{height: cardHeight}}
                                extra={<Icon component={Ande} className="icon-card"/>}
                                actions={[
                                    <a href="https://informacionpublica.paraguay.gov.py/portal/#!/ciudadano/solicitud/31210"
                                       target="_blank" rel="noopener noreferrer">Ver solicitud de acceso a información pública
                                    </a>
                                ]}
                          >
                            <Space direction="vertical">
                              <LVRow label={"Agencia"} value={local.staging.ande_exonerados[0].agencia}/>
                              <LVRow label={"NIS"} value={local.staging.ande_exonerados[0].nis}/>
                            </Space>
                          </Card>
                        </Col>

                    }
                    {
                        header.charge && header.charge.length > 0 &&
                        <ChargeCard cargos={header.charge} spans={spans} document={header.document}/>
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
                          analysis?: AnalysisSearchResult,
                          local?: LocalSearchResult
) {

    let name = '';
    let document = baseDoc;
    let found = false;
    let charge: Array<Charge> = [];
    let birthDate = '';
    let imageURL = '';
    if (affidavit !== undefined) {
        found = true;
        if (affidavit.length > 0) {
            name = affidavit[0].name;
            affidavit.forEach(a => {
                if (a.charge) {
                    charge.push({charge: a.charge, year: a.year, source: Ddjj, sourceName: SOURCE_NAME_MAP['declarations']});
                }
            });
        }
    }

    if (local && local.staging.sfp && local.staging.sfp.length > 0) {

        const localClone = local.staging.sfp.map(s => s)
            .sort((s1, s2) => s1.anho > s2.anho
                ? -1
                : s1.anho !== s2.anho
                    ? 1
                    : s1.mes - s2.mes
            );

        const d = localClone[0];
        name = d.nombres + ' ' + d.apellidos;
        found = true;
        birthDate = d.fecha_nacimiento ? d.fecha_nacimiento.substr(0, 10) : d.fecha_nacimiento;

        const chargeData: Record<string, number> = {};
        localClone.filter(h => !!h.cargo)
            .forEach(h => {
                if (chargeData[h.cargo]) {
                    return;
                } else {
                    chargeData[h.cargo] = h.anho
                }
            });

        Object.keys(chargeData).forEach(c => charge.push({
            charge: c,
            year: chargeData[c],
            source: Sfp,
            sourceName: SOURCE_NAME_MAP['sfp']
        }));
    }

    if (analysis && analysis.analysis) {
        const election = analysis.analysis.tsje_elected;
        if (election && election.length > 0) {
            name = name || `${election[0].full_name}`;
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
        const pytyvo: any = local.staging.pytyvo;
        if (pytyvo && pytyvo.length) {
            name = name || `${pytyvo[0].name}`;
        }
        const hacienda: Hacienda[] = local.staging.hacienda_funcionarios;
        if (hacienda && hacienda.length) {
            name = name || `${hacienda[0].nombres} ${hacienda[0].apellidos}`;

            const chargeData: Record<string, number> = {};

            hacienda
                .map(h => h) // clone the array
                .sort((h1, h2) => h1.anio > h2.anio ? 1 : -1)
                .filter(h => !!h.cargo)
                .forEach(h => {
                    if (chargeData[h.cargo]) {
                        return;
                    } else {
                        chargeData[h.cargo] = h.anio
                    }
                });


            Object.keys(chargeData).forEach(c => charge.push({
                charge: c,
                year: chargeData[c],
                source: HaciendaIcon,
                sourceName: SOURCE_NAME_MAP['mh']
            }));

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
        name: fixName(name),
        document,
        charge,
        birthDate,
        imageURL
    }
}

export function LVRow(props: {
    label: string,
    value: string
}) {
    return <Space direction="horizontal">
        <Typography.Text><strong>{props.label}:</strong>
        </Typography.Text>{props.value}<br/>
    </Space>
}


export function Sources({local, analysis}: {
    local?: LocalSearchResult,
    analysis?: AnalysisSearchResult

}) {
    return <>
        <Tooltip title="Ministerio de Hacienda">
            <Icon component={HaciendaIcon} style={{
                color: local?.staging.hacienda_funcionarios?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="SFP">
            <Icon component={Sfp} style={{
                color: local?.staging.sfp?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="Declaraciones Juradas">
            <Icon component={Ddjj} style={{
                color: analysis?.analysis.declarations?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="Pytyvo">
            <Icon component={Pytyvo} style={{
                color: local?.staging.pytyvo?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="Ñangareko">
            <Icon component={Nangareko} style={{
                color: local?.staging.nangareko?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="ANDE">
            <Icon component={Ande} style={{
                color: local?.staging.ande_exonerados?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="Policía Nacional">
            <Icon component={PoliciaNacional} style={{
                color: local?.staging.policia?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
        <Tooltip title="A Quíenes Elegimos">
            <Icon component={Aqe} style={{
                color: local?.staging?.a_quien_elegimos?.length ? COLOR_ORANGE : COLOR_GREY,
                fontSize: '30px'
            }}/>
        </Tooltip>
    </>
}
