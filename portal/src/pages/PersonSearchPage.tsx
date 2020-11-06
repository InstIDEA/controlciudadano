import * as React from 'react';
import { Layout, Row, Col, Card, Input, Typography, Button, Badge, Select, Tooltip, Collapse, InputNumber, Tag } from 'antd';
import { Header } from '../components/layout/Header';
import './PersonSearchPage.css'
import Footer from '../components/layout/Footer';
import { useQueryParam, StringParam } from 'use-query-params';
import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Async, PersonDataStatistics, AsyncHelper } from '../Model';
import { RedashAPI } from '../RedashAPI';
import { formatMoney } from '../formatters';
import { SimpleApi } from '../SimpleApi';
import { ReactComponent as Pytyvo } from '../assets/logos/pytyvo.svg';
import { ReactComponent as Nangareko } from '../assets/logos/nangareko.svg';
import { ReactComponent as Ande } from '../assets/logos/ande.svg';
import { ReactComponent as Sfp } from '../assets/logos/sfp.svg';
import { ReactComponent as Ddjj } from '../assets/logos/ddjj.svg';
import { ReactComponent as PoliciaNacional } from '../assets/logos/policia_nacional.svg';
import Icon from '@ant-design/icons';
interface Filter {
    key: string;
    name: string;
    from?: number;
    to?: number;
}
interface QueryResuls {
    document: string;
    name: string;
    sources: string[];
    netWorth: number;
    salary: number;
}

interface FilterCounter {
    salary: number;
    assets: number;
    pytyvo: number;
    nangareko: number;
    policia: number;
    ande: number;
}

export function PersonSearchPage() {

    const [document, setDocument] = useQueryParam('document', StringParam);


    const [stats, setStats] = useState<Async<PersonDataStatistics>>({
        state: 'NO_REQUESTED'
    })
    const [data, setData] = useState<QueryResuls[]>();
    const [local, setLocal] = useState<QueryResuls[]>();
    const [filterCounter, setFilterCounter] = useState<FilterCounter>({ salary: 0, assets: 0, pytyvo: 0, nangareko: 0, policia: 0, ande: 0 });
    const [appliedFilters, setAppliedFilters] = useState<Filter[]>([]);

    useEffect(() => {
        setStats({ state: 'FETCHING' })
        new RedashAPI().getPersonDataStatistics()
            .then(d => setStats({
                state: 'LOADED',
                data: d.query_result.data.rows[0]
            }))
            .catch(e => setStats({
                state: 'ERROR',
                error: e
            }))
    }, [])

    useEffect(() => {
        if (!data) return;
        let totalSalario = 0;
        let totalPatrimonio = 0;
        let totalPytyvo = 0;
        let totalNangareko = 0;
        let totalPolicia = 0;
        let totalAnde = 0;

        data.forEach(e => {
            if (e.sources.indexOf('spf') !== -1) totalSalario += 1;
            if (e.sources.indexOf('declarations') !== -1) totalPatrimonio += 1;
            if (e.sources.indexOf('pytyvo') !== -1) totalPytyvo += 1;
            if (e.sources.indexOf('nangareko') !== -1) totalNangareko += 1;
            if (e.sources.indexOf('policia') !== -1) totalPolicia += 1;
            if (e.sources.indexOf('ande_exonerados') !== -1) totalAnde += 1;
            setFilterCounter({
                salary: totalSalario,
                assets: totalPatrimonio,
                pytyvo: totalPytyvo,
                policia: totalPolicia,
                nangareko: totalNangareko,
                ande: totalAnde
            })
        })
    }, [data])

    function doLocalSearch(cedula: string) {
        new SimpleApi().findPeopleByName(cedula)
            .then(d => {
                let results: QueryResuls[] = [];
                Object.keys(d.data).forEach((ci: string) => {
                    const document = ci;
                    const name = d.data[ci][0].names[0];
                    let netWorth: number;
                    let sources: string[] = [];
                    d.data[ci].forEach(row => {
                        if (row.source === 'declarations') netWorth = row.net_worth!;
                        sources.push(row.source);
                    });
                    results.push({ document: document, name: name, sources: sources, netWorth: netWorth!, salary: 0 });
                })
                setLocal(results);
                setData(results);
            });
    }

    const doSearch = useCallback((toSearch: string) => {
        setLocal(undefined);
        if (!toSearch) return;
        doLocalSearch(toSearch);
    }, []);

    useEffect(() => doSearch(document || ''), [document, doSearch]);


    useEffect(() => {
        if (!appliedFilters) return;
    }, [appliedFilters])


    const sortResultHandler = (key: string) => {
        if (!data) return;
        if (key === 'salary') {
            const sort = [...data].sort((r1, r2) => r2.salary || 0 - r1.salary || 0);
            setData(sort)
        }
        else if (key === 'networth') {
            const sort = [...data].sort((r1, r2) => r2.netWorth || 0 - r1.netWorth || 0);
            setData(sort)
        }
    }

    const applyFilterHandler = (event: Filter) => {
        debugger
        if (appliedFilters.find(e => e.key === event.key)) return;
        setAppliedFilters(oldArray => [...oldArray, event]);
    }

    const deleteFilterHandler = (removedTag: Filter) => {
        const tags = appliedFilters.filter(tag => tag !== removedTag);
        setAppliedFilters(tags);
    };

    useEffect(() => {
        if (!local) return;
        if (appliedFilters.length <= 0) {
            setData(local);
            return;
        }
        let newData: QueryResuls[] = local;
        appliedFilters.forEach(filter => {
            if (filter.key === 'Salario') {
                newData = newData.filter(e => e.salary < (filter.to || 0) && e.salary > (filter.from || 0))
            }
            else if (filter.key === 'Patrimonio Neto') {
                newData = newData.filter(e => e.netWorth < (filter.to || 0) && e.netWorth > (filter.from || 0))
            }
            else {
                newData = newData.filter(e => e.sources.includes(filter.key))
            }
        })
        setData(newData);

    }, [appliedFilters, local])

    return <>
        <Header tableMode={true} />
        <Layout>
            <Layout.Sider width={400} className="hide-responsive">
                <FilterMenu spans={{ xxl: 24, xl: 24, lg: 24, md: 24, sm: 24, xs: 24 }} cardsWidth={300} filterCallback={applyFilterHandler}
                    counters={filterCounter} sorter={sortResultHandler} />
            </Layout.Sider>
            <Layout>
                <Layout.Content className="content-padding">
                    <Row gutter={[8, 16]}>
                        <Col className="show-responsive" xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 22 }} xs={{ offset: 1, span: 22 }} style={{ textAlign: 'left' }}>
                            <Collapse defaultActiveKey={['1']}>
                                <Collapse.Panel header="Filtros" key="1">
                                    <FilterMenu spans={{ xxl: 24, xl: 24, lg: 24, md: 24, sm: 24, xs: 24 }} cardsWidth={250} filterCallback={applyFilterHandler}
                                        counters={filterCounter} sorter={sortResultHandler} />
                                </Collapse.Panel>
                            </Collapse>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 22 }} xs={{ offset: 1, span: 22 }} style={{ textAlign: 'left' }}>
                            <Input.Search
                                placeholder="Buscar"
                                key="search_input"
                                style={{ color: 'rgba(0, 52, 91, 1)', border: '2px solid', borderRadius: '5px', textAlign: 'left' }}
                                defaultValue={document || ''}
                                onSearch={v => setDocument(v)}
                                formMethod="submit" />
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 22 }} xs={{ offset: 1, span: 22 }} style={{ textAlign: 'left' }}>
                            <Card className="card-layout-content">
                                <Typography.Text className="text-layout-content">
                                    <strong>Filtros Aplicados: </strong> {(appliedFilters || []).map(filter =>
                                        <Tag key={filter.key} closable onClose={() => deleteFilterHandler(filter)}>{filter.name} </Tag>
                                    )}
                                </Typography.Text>
                            </Card>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 22 }} xs={{ offset: 1, span: 22 }} style={{ textAlign: 'left' }}>
                            <Card className="card-layout-content"
                            >
                                <Row gutter={[8, 16]}>
                                    <Col xxl={{ offset: 0, span: 12 }}
                                        xl={{ offset: 0, span: 12 }}
                                        lg={{ offset: 0, span: 12 }}
                                        md={{ offset: 0, span: 24 }} sm={{ offset: 1, span: 24 }} xs={{ offset: 1, span: 24 }}>
                                        <Statistic name="Cantidad Funcionarios MH:"
                                            obs={AsyncHelper.map(stats, d => '')}
                                            data={AsyncHelper.map(stats, d => d.treasury_data_payed_salaries)} />
                                    </Col>
                                    <Col xxl={{ offset: 0, span: 12 }}
                                        xl={{ offset: 0, span: 12 }}
                                        lg={{ offset: 0, span: 12 }}
                                        md={{ offset: 0, span: 24 }} sm={{ offset: 1, span: 24 }} xs={{ offset: 1, span: 24 }}>
                                        <Statistic name="Cantidad Funcionarios SFP:"
                                            obs={AsyncHelper.map(stats, d => '')}
                                            data={AsyncHelper.map(stats, d => d.sfp_payed_salaries)} />
                                    </Col>
                                    <Col xxl={{ offset: 0, span: 12 }}
                                        xl={{ offset: 0, span: 12 }}
                                        lg={{ offset: 0, span: 12 }}
                                        md={{ offset: 0, span: 24 }} sm={{ offset: 1, span: 24 }} xs={{ offset: 1, span: 24 }}>
                                        <Typography.Text className="text-layout-content" strong> Cantidad de personas con </Typography.Text>
                                        <Statistic name="Pytyvo:"
                                            obs={AsyncHelper.map(stats, d => '')}
                                            data={AsyncHelper.map(stats, d => d.pytyvo_count)} />
                                        <Statistic name="Ñangareko:"
                                            obs={AsyncHelper.map(stats, d => '')}
                                            data={AsyncHelper.map(stats, d => d.nangareko_count)} />
                                        <Statistic name="ANDE:"
                                            obs={AsyncHelper.map(stats, d => '')}
                                            data={AsyncHelper.map(stats, d => d.ande_count)} />
                                    </Col>
                                    <Col xxl={{ offset: 0, span: 12 }}
                                        xl={{ offset: 0, span: 12 }}
                                        lg={{ offset: 0, span: 12 }}
                                        md={{ offset: 0, span: 24 }} sm={{ offset: 1, span: 24 }} xs={{ offset: 1, span: 24 }}>
                                        <Statistic name="Cantidad de personas con DDJJ:"
                                            obs={AsyncHelper.map(stats, d => '')}
                                            data={AsyncHelper.map(stats, d => d.affidavid_count)} />
                                    </Col>

                                </Row>
                            </Card>
                        </Col>
                        <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 20 }} xs={{ offset: 1, span: 20 }} style={{ textAlign: 'left' }}>
                            <Typography.Title level={3} className="title-layout-content"> Resultados </Typography.Title>
                        </Col>
                        {
                            data && <>
                                <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 1, span: 20 }} xs={{ offset: 1, span: 20 }} style={{ textAlign: 'left' }}>
                                    <Row>
                                        <Col xxl={7} xl={7} lg={7} md={0} sm={0} xs={0}>
                                            <Typography.Text>
                                                Nombre
                                            </Typography.Text>
                                        </Col>
                                        <Col xxl={5} xl={5} lg={5} md={0} sm={0} xs={0}>
                                            <Typography.Text>
                                                Salario
                                    </Typography.Text>
                                        </Col>
                                        <Col xxl={5} xl={5} lg={5} md={0} sm={0} xs={0}>
                                            <Typography.Text>
                                                Patrimonio Neto
                                    </Typography.Text>
                                        </Col>
                                        <Col xxl={5} xl={5} lg={5} md={0} sm={0} xs={0}>
                                            <Typography.Text>
                                                Fuente de Datos
                                    </Typography.Text>
                                        </Col>
                                    </Row>
                                </Col>
                                {
                                    data.map(
                                        row =>
                                            <Col xxl={{ offset: 0, span: 20 }} xl={{ offset: 0, span: 20 }} lg={{ offset: 0, span: 20 }} md={{ offset: 0, span: 20 }} sm={{ offset: 0, span: 24 }} xs={{ offset: 0, span: 24 }} style={{ textAlign: 'left' }}
                                                key={row.document}>
                                                <Card className="card-layout-content">
                                                    <Row gutter={[8, 16]}>

                                                        <Col xxl={0} xl={0} lg={0} md={6} sm={6} xs={6}>
                                                            <Typography.Text className="text-layout-content" strong>Nombre: </Typography.Text>
                                                        </Col>
                                                        <Col xxl={7}
                                                            xl={7}
                                                            lg={7}
                                                            md={18}
                                                            sm={18}
                                                            xs={18}>
                                                            {<Typography.Text className="text-layout-content"> {row.name} </Typography.Text>}
                                                        </Col>
                                                        <Col xxl={0} xl={0} lg={0} md={6} sm={6} xs={6}>
                                                            <Typography.Text className="text-layout-content" strong> Salario: </Typography.Text>
                                                        </Col>
                                                        <Col xxl={5}
                                                            xl={5}
                                                            lg={5}
                                                            md={18} sm={18} xs={18}>
                                                            <Typography.Text className="text-layout-content"> </Typography.Text>
                                                        </Col>
                                                        <Col xxl={0} xl={0} lg={0} md={6} sm={6} xs={6}>
                                                            <Typography.Text className="text-layout-content" strong> Patrimonio Neto: </Typography.Text>
                                                        </Col>
                                                        <Col xxl={5}
                                                            xl={5}
                                                            lg={5}
                                                            md={18} sm={18} xs={18}>
                                                            <Typography.Text className="text-layout-content"> {formatMoney(row.netWorth)} </Typography.Text>
                                                        </Col>
                                                        <Col xxl={5}
                                                            xl={5}
                                                            lg={5}
                                                            md={24} sm={24} xs={24}>
                                                            {row.sources.indexOf('sfp') !== -1 && <Tooltip title="SFP"><Icon component={Sfp} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} /></Tooltip>}
                                                            {row.sources.indexOf('declarations') !== -1 && <Tooltip title="Declaraciones Juradas"> <Icon component={Ddjj} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} /> </Tooltip>}
                                                            {row.sources.indexOf('pytyvo') !== -1 && <Tooltip title="Pytyvo"> <Icon component={Pytyvo} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} /> </Tooltip>}
                                                            {row.sources.indexOf('nangareko') !== -1 && <Tooltip title="Ñangareko"> <Icon component={Nangareko} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} /> </Tooltip>}
                                                            {row.sources.indexOf('ande_exonerados') !== -1 && <Tooltip title="ANDE"> <Icon component={Ande} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} /> </Tooltip>}
                                                            {row.sources.indexOf('policia') !== -1 && <Tooltip title="Policia Nacional"> <Icon component={PoliciaNacional} style={{ color: 'rgba(0, 52, 91, 1)', fontSize: '30px' }} /> </Tooltip>}
                                                        </Col>
                                                        <Col xxl={2}
                                                            xl={2}
                                                            lg={2}
                                                            md={24} sm={24} xs={24}>
                                                            <Link to={`/person/detail/${row.document}`}>
                                                                <Button className="mas-button">Ver más</Button>
                                                            </Link>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </Col>
                                    )

                                }
                            </>
                        }

                    </Row>
                </Layout.Content>
            </Layout>
        </Layout>
        <Footer tableMode={true} />
    </>

} function Statistic(props: {
    data: Async<number>,
    name: string,
    obs: Async<string>
}) {
    const number = AsyncHelper.or(props.data, 0)
    const isLoaded = props.data.state === 'LOADED';
    const observation = AsyncHelper.or(props.obs, "Cargando...")
    const numberClasses = isLoaded
        ? "description"
        : "description loading"
    return <Tooltip placement="top" title={observation}>
        <Col className="info-box">
            <Typography.Text className="text-layout-content"><strong>{props.name}</strong> <span className={numberClasses}>{formatMoney(number)}</span></Typography.Text>
        </Col>
    </Tooltip>
}

function FilterMenu(props: {
    spans: any;
    cardsWidth: number;
    counters: FilterCounter;
    filterCallback: (filter: Filter) => void;
    sorter: (key: string) => void;
}) {
    const filterOptions = [{ name: 'Salario', key: 'salary' }, { name: 'Patrimonio Neto', key: 'networth' }];
    const [selected, setSelected] = useState<string>();
    const [from, setFrom] = useState<number>();
    const [to, setTo] = useState<number>();
    const [query, setQuery] = useState('');
    const dataOptions: { name: string; key: string; qty: number; }[] =
        [{ name: 'Pytyvo', key: 'pytyvo', qty: props.counters.pytyvo },
        { name: 'Ñangareko', key: 'nangareko', qty: props.counters.nangareko },
        { name: 'Funcionarios de Hacienda', key: 'hacienda', qty: 0 },
        { name: 'SFP', key: 'sfp', qty: 0 },
        { name: 'Personal Policía Nacional', key: 'policia', qty: props.counters.policia },
        { name: 'Exonerado Ande', key: 'ande_exonerados', qty: props.counters.ande }];

    const filtered = useMemo(() => filterList(dataOptions, query), [dataOptions, query]);
    function filterList(options: { name: string; key: string; qty: number; }[], query: string) {
        if (!query || query.trim() === "") return options;

        const fToSearch = query.toLowerCase();

        const toRet = options.filter(op => {
            return op.name.toLowerCase().includes(fToSearch);
        })
        return toRet;
    }
    function onChange(value: any) {
        setFrom(value);
    }
    function changeTo(value: any) {
        setTo(value);
    }

    function applyRangeFilter() {
        const filter: Filter = {
            key: selected!,
            name: filterOptions.find(e => e.key === selected)?.name || '',
            from: from!,
            to: to!
        }
        props.filterCallback(filter);
    }

    function addFilter(key: string) {
        const filter: Filter = {
            key: key,
            name: dataOptions.find(e => e.key === key)?.name || '',
        }
        props.filterCallback(filter);
    }

    function sort(key: string) {
        props.sorter(key);
    }
    return <Row className="cards" gutter={[16, 24]}>
        <Col xxl={{ offset: 1, span: 20 }} xl={{ offset: 1, span: 20 }} lg={{ offset: 1, span: 20 }} md={{ offset: 1, span: 20 }} sm={{ offset: 1, span: 20 }} xs={{ offset: 1, span: 20 }}>
            <Typography.Text className="sidebar-title">Ordenar Por</Typography.Text>
            <Card size="small"
                style={{ width: props.cardsWidth }}
                className="card-style">
                <Row gutter={[8, 16]}>
                    <Col {...props.spans}>
                        <Typography.Text> <Button type="text" style={{ color: 'rgba(0, 52, 91, 1)' }} onClick={() => sort('salary')}>Salario</Button> </Typography.Text>
                        <Badge className="float-right" count={props.counters.salary} style={{ backgroundColor: '#b2c1cc' }} />

                    </Col>
                    <Col {...props.spans}>

                        <Typography.Text> <Button type="text" style={{ color: 'rgba(0, 52, 91, 1)' }} onClick={() => sort('networth')}>Patrimonio Neto</Button> </Typography.Text>
                        <Badge className="float-right" count={props.counters.assets} style={{ backgroundColor: '#b2c1cc' }} />
                    </Col>
                </Row>
            </Card>
        </Col>

        <Col xxl={{ offset: 1, span: 20 }} xl={{ offset: 1, span: 20 }} lg={{ offset: 1, span: 20 }} md={{ offset: 1, span: 20 }} sm={{ offset: 1, span: 20 }} xs={{ offset: 1, span: 20 }}>
            <Typography.Text className="sidebar-title">Filtros</Typography.Text>
            <Card size="small"
                style={{ width: props.cardsWidth }}
                className="card-style" title="Rango monetario">
                <Input.Group>
                    <Row gutter={[8, 16]}>
                        <Col {...props.spans}>
                            <Select style={{ width: '100%' }} defaultValue={selected} onChange={setSelected}>
                                {filterOptions.map(k => <Select.Option value={k.key} key={k.key}>{k.name} </Select.Option>)}
                            </Select>
                        </Col>
                        <Col {...props.spans}>
                            <InputNumber type="number" style={{ width: '100%' }} placeholder="Desde" defaultValue={from} onChange={onChange} />
                        </Col>
                        <Col {...props.spans}>
                            <InputNumber type="number" style={{ width: '100%' }} placeholder="Hasta" defaultValue={to} onChange={changeTo} />
                        </Col>
                        <Col {...props.spans}>
                            <Button className="mas-button" style={{ float: "right" }} onClick={applyRangeFilter}>Aplicar</Button>
                        </Col>
                    </Row>
                </Input.Group>
            </Card>
        </Col>
        <Col xxl={{ offset: 1, span: 20 }} xl={{ offset: 1, span: 20 }} lg={{ offset: 1, span: 20 }} md={{ offset: 1, span: 20 }} sm={{ offset: 1, span: 20 }} xs={{ offset: 1, span: 20 }}>
            <Card size="small"
                style={{ width: props.cardsWidth }}
                className="card-style" title="Datos">
                <Row gutter={[8, 16]}>
                    <Col {...props.spans}>
                        <Input.Search
                            placeholder="Buscar"
                            key="search_input"
                            style={{ color: 'rgba(0, 52, 91, 1)', border: '1px solid', borderRadius: '5px', textAlign: 'left' }}
                            onSearch={setQuery}
                            formMethod="submit" />
                    </Col>
                    {
                        filtered.map(option =>
                            <Col {...props.spans} key={option.name}>
                                <Typography.Text><Button type="text" style={{ color: 'rgba(0, 52, 91, 1)' }} onClick={() => addFilter(option.key)}>{option.name}</Button></Typography.Text>
                                <Badge className="float-right" count={option.qty} style={{ backgroundColor: '#b2c1cc' }} />
                            </Col>
                        )
                    }
                </Row>
            </Card>
        </Col>
    </Row>
}