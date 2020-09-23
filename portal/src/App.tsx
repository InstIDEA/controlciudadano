import * as React from "react";
import 'antd/dist/antd.css';
import './App.css';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {DocumentSearchPage} from "./pages/DocumentSearchPage";
import {QueryParamProvider} from "use-query-params";
import {OCDSAwardItemsPage} from './pages/OCDSAwardItemsPage';
import {OCDSSuppliers} from './pages/OCDSSuppliers';
import {OCDSSupplier} from './pages/OCDSSupplier';
import {Welcome} from './pages/Welcome';
import {DS} from './pages/Datasources';
import {OCDSSupplierRelations} from './pages/OCDSSupplierRelations';
import {AffidavitList} from './pages/AffidavitList';
import {PersonPage} from './pages/Person';
import {OCDSItem} from './pages/OCDSItem';
import {OCDSItemsRankingPage} from './pages/OCDSItemsRankingPage';
import {AndeExoneratedList} from './pages/AndeExonerated';
import {EssapExoneratedList} from './pages/EssapExonerated';
import {ElectedAuthoritiesPage} from './pages/ElectedAuthoritiesPage';
import {OCDSBuyerPage} from './pages/OCDSBuyer';
import {ActionResearchLanding} from './pages/ActionResearchLanding';
import {OCDSBuyersPage} from './pages/OCDSBuyers';
import {OCDSSupplierWithSanctionPage} from './pages/OCDSSupplierWithSanction';
import {OCDSCovidTenders} from './pages/OCDSCovidTenders';
import Banner from "./Home/Banner";

export default function App() {
    return <Routes/>
}

function Routes() {

    return <Router>
        <QueryParamProvider ReactRouterRoute={Route}>
            <Switch>
                <Route path="/people/:document" exact render={() => <PersonPage/>}/>
                <Route path="/people"><DocumentSearchPage/></Route>
                <Route path="/authorities/elected"><ElectedAuthoritiesPage/></Route>
                <Route path="/covid/ande" exact render={() => <AndeExoneratedList/>}/>
                <Route path="/covid/essap" exact render={() => <EssapExoneratedList/>}/>
                <Route path="/sources" exact render={() => <DS/>}/>
                <Route path="/contralory/affidavit" exact render={() => <AffidavitList/>}/>
                <Route path="/ocds/" exact render={() => <Redirect to="/ocds/items"/>}/>
                <Route path="/ocds/tenders" exact render={() => <OCDSCovidTenders/>}/>
                <Route path="/ocds/items" exact render={() => <OCDSAwardItemsPage/>}/>
                <Route path="/ocds/covid/itemsRanking" exact render={() => <OCDSItemsRankingPage/>}/>
                <Route path="/ocds/items/:itemId" exact render={() => <OCDSItem/>}/>
                <Route path="/ocds/suppliers" exact render={() => <OCDSSuppliers/>}/>
                <Route path="/ocds/sanctioned_suppliers" exact render={() => <OCDSSupplierWithSanctionPage/>}/>
                <Route path="/ocds/suppliers/:ruc" exact render={() => <OCDSSupplier/>}/>
                <Route path="/ocds/buyers" exact render={() => <OCDSBuyersPage/>}/>
                <Route path="/ocds/buyer/:id" exact render={() => <OCDSBuyerPage/>}/>
                <Route path="/ocds/relations" exact render={() => <OCDSSupplierRelations/>}/>
                <Route path="/action" exact render={() => <ActionResearchLanding/>}/>
                <Route path="/explore" exact render={() => <Welcome/>}/>
                <Route path="/">
                    <Banner/>
                </Route>
            </Switch>
        </QueryParamProvider>
        {/*<Divider orientation="right" plain>*/}
        {/*    Desarrollado por CDS en conjunto con IDEA*/}
        {/*    <br/>*/}
        {/*    <small>{new Date().getFullYear()} - Todos los derechos reservados</small>*/}
        {/*</Divider>*/}
    </Router>
}
