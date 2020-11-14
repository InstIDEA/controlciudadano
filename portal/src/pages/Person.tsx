import * as React from 'react';
import {useEffect, useState} from 'react';
import {Divider, message, PageHeader, Tabs} from 'antd';
import {Affidavit, AnalysisSearchResult, LocalSearchResult} from '../Model';
import {Link, useHistory, useParams} from 'react-router-dom';
import {SimpleApi} from '../SimpleApi';
import {AffidavitTable} from '../components/AffidavitTable';
import {PersonDescription} from '../components/PersonDescription';
import {SFPFetcher, SFPRow} from '../SFPHelper';
import {SFPTable} from '../components/SFPTable';
import {LocalData} from './DocumentSearchPage';
import {GenericTable} from '../components/GenericTable';


export function PersonPage() {

    const {document} = useParams<{ document: string }>();
    const [affidavit, setAffidavit] = useState<Affidavit[]>();
    const [sfpData, setSfpData] = useState<SFPLocalData>({});
    const [analysis, setAnalysis] = useState<AnalysisSearchResult>();
    const [local, setLocal] = useState<LocalSearchResult>();

    const history = useHistory();

    useEffect(() => {
        new SimpleApi()
            .findPeopleInAnalysis(document)
            .then(d => {
                setAnalysis(d);
                setAffidavit(d.analysis.declarations)
            })
        new SimpleApi()
            .findPeople(document)
            .then(d => setLocal(d));
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

        fetcher.fetchAllYears(document)
        return () => fetcher.cancel();
    }, [document])

    const header = tryToGuestHeader(document, affidavit, sfpData, analysis, local);
    const allSfpData = Object.values(sfpData).flatMap(d => d);
    const tsjeElected = analysis?.analysis?.tsje_elected;

    return <PageHeader ghost={false}
                       onBack={() => history.push('/')}
                       style={{border: '1px solid rgb(235, 237, 240)'}}
                       title={header.found ? header.name || 'Cargando ...'
                           : 'No encontrado'}
                       subTitle="CDS - IDEA"
                       footer={<Tabs defaultActiveKey="AFFIDAVIT">
                           <Tabs.TabPane tab="Declaraciones juradas" key="AFFIDAVIT">
                               <AffidavitTable data={affidavit || []} working={!affidavit}/>
                           </Tabs.TabPane>
                           <Tabs.TabPane tab="Salarios según la SFP" key="SFP">
                               <Divider orientation="left" plain>
                                   Estos datos son extraídos de la <a
                                   href="https://datos.sfp.gov.py/data/funcionarios/download"> Secretaria
                                   de la función pública (SFP).</a>
                               </Divider>
                               <SFPTable data={allSfpData || []}
                                         working={Object.keys(sfpData).length === 0}
                                         showPersonalDetails={false}
                               />
                           </Tabs.TabPane>
                           <Tabs.TabPane tab="Otras fuentes" key="LOCAL">
                               <Divider orientation="left" plain>
                                   Resultados de diferentes fuentes de datos.
                               </Divider>
                               {tsjeElected && tsjeElected.length > 0 && <>
                                 <Divider orientation="left" plain>
                                   <Link to="/sources?query=tsje">Elecciones Generales</Link>
                                 </Divider>
                                 <GenericTable data={tsjeElected} columns={{}}/>
                               </>}
                               {local && <LocalData result={local} showEmpty={false}/>}
                           </Tabs.TabPane>
                       </Tabs>}>

        <div className="content">
            <div className="main">
                <PersonDescription data={header} columns={2}/>
            </div>
        </div>


    </PageHeader>

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
    }

    return {
        found,
        name,
        document,
        charge,
        birthDate
    }
}
