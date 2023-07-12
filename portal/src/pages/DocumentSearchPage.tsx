import * as React from 'react';
import {useCallback, useEffect, useState} from 'react';
import {GenericTable} from "../components/GenericTable";
import {StringParam, useQueryParam} from 'use-query-params';
import {LocalSearchResult} from '../Model';
import {Card, Divider, PageHeader, Typography} from 'antd';
import {ColumnProps} from 'antd/es/table';
import {SimpleApi} from '../SimpleApi';
import {Link, useHistory} from 'react-router-dom';
import {buildSFPUrl} from '../SFPHelper';
import {BaseDatosPage} from '../components/BaseDatosPage';
import {SearchBar} from '../components/SearchBar';

export function DocumentSearchPage() {

    const [document, setDocument] = useQueryParam('document', StringParam);
    const [sfp, setSFP] = useState<object[]>();
    const [local, setLocal] = useState<LocalSearchResult>();
    const history = useHistory();

    function doSearchSFP(cedula: string) {
        if (!cedula) return;

        fetch(getUrl(cedula))
            .then(d => d.json())
            .then(d => {
                setSFP(d.data);
            });
    }

    function doLocalSearch(cedula: string) {
        new SimpleApi().findPeople(cedula)
            .then(d => setLocal(d));
    }

    const doSearch = useCallback((toSearch: string) => {
        setSFP(undefined);
        setLocal(undefined);
        if (!toSearch) return;
        doSearchSFP(toSearch);
        doLocalSearch(toSearch);
    }, []);

    useEffect(() => doSearch(document ?? ''), [document, doSearch]);


    return <>
        <BaseDatosPage menuIndex="people" headerExtra={
            <SearchBar defaultValue={document ?? ''} onSearch={v => setDocument(v)}/>
        }>
            <PageHeader ghost={false}
                        style={{border: '1px solid rgb(235, 237, 240)'}}
                        title=""
                        subTitle="Búsqueda de personas por cédula"
                        onBack={() => history.push('/')}
                        backIcon={null}>

                <Typography.Paragraph>
                    Se busca una cédula en las fuentes de datos listadas.
                </Typography.Paragraph>
                {local && <>
                  <Divider orientation="left" plain>
                    Resultados de búsqueda a bases de datos locales ({local.query})
                  </Divider>
                  <LocalData result={local} showEmpty/>
                </>
                }
                {sfp &&
                  <Card title={<>SFP
                      (externo, solo 2020)
                      (Fuente: <a href="https://datos.sfp.gov.py/data/funcionarios">
                          https://datos.sfp.gov.py/data/funcionarios
                      </a>)
                  </>}>
                    <GenericTable data={sfp}/>
                  </Card>}
            </PageHeader>
        </BaseDatosPage>
    </>

}

const customColumns: { [k: string]: { [k: string]: ColumnProps<any> } } = {
    'sfp': {
        'id': {
            dataIndex: 'documento',
            title: 'LINK',
            render: (_, row: any) => <a
                href={`https://datos.sfp.gov.py/doc/funcionarios/${row.documento}`}>{row.documento}</a>
        }
    },
    'hacienda_funcionarios': {
        'id': {
            dataIndex: 'codigopersona',
            title: 'LINK',
            render: (_, row: any) => <a
                href={`https://datos.hacienda.gov.py/doc/nomina/${row.codigopersona}`}>{row.codigopersona}</a>
        }
    }
}

const customTitles: { [k: string]: React.ReactNode } = {
    'hacienda_funcionarios': <a href="https://datos.hacienda.gov.py/data/nomina/descargas"> Listado de funcionarios de
        Hacienda </a>,
    'sfp': <a href="https://datos.sfp.gov.py/data/funcionarios/download"> SFP </a>,
    'pytyvo': <a href="https://drive.google.com/drive/folders/1gXckuu6cgPdmCeCAKWxNSQXLS46dj8rG">PYTYVO</a>,
    'nangareko': <a href="https://drive.google.com/file/d/1bN_v0Nd31d2oDs4QHd4dguhm6Wa4tnua/view">Lista oficial de
        Ñangareko</a>,
    'nangareko_2': <a href="https://registro.sen.gov.py/">Consulta de beneficiarios Ñangareko</a>,
    'nangareko_transparencia': <a href="https://rindiendocuentas.gov.py/">Lista Ñangareko de Rindiendo cuentas</a>,
    'policia': <a href="https://www.policianacional.gov.py/nomina-de-salarios-de-personal-de-la-policia-nacional/">Nomina
        de Salarios del Personal de la Policía Nacional</a>,
    'ande_exonerados': <Link to="/sources?query=ande_exonerados">Lista de exonerados por la ANDE</Link>
}

export function LocalData(props: { result: LocalSearchResult, showEmpty: boolean }) {
    if (!props.result || !props.result.staging) {
        return <></>
    }
    const {staging} = props.result;

    let toShow = Object.keys(staging)
        .map(key => {
            const data: object[] = staging[key as keyof LocalSearchResult['staging']] || [];
            return {key, data}
        });

    if (!props.showEmpty) {
        toShow = toShow.filter(f => f.data.length);
    }

    return <>
        {toShow.map(source => <React.Fragment key={source.key}>
                <Divider orientation="left" plain> {customTitles[source.key] || source.key} </Divider>
                <GenericTable data={source.data}
                              columns={customColumns[source.key]}
                />
            </React.Fragment>
        )}
    </>

}


function getUrl(cedula: string) {
    return buildSFPUrl(cedula);
}
