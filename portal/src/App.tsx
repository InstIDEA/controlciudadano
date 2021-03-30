import * as React from "react";
import 'antd/dist/antd.css';
import './App.css';
import {BrowserRouter as Router, Redirect, Route, Switch} from "react-router-dom";
import {DocumentSearchPage} from "./pages/DocumentSearchPage";
import {QueryParamProvider} from "use-query-params";
import {OCDSAwardItemsPage} from './pages/OCDSAwardItemsPage';
import {OCDSSuppliers} from './pages/OCDSSuppliers';
import {Welcome} from './pages/Welcome';
import {DS} from './pages/Datasources';
import {OCDSSupplierRelations} from './pages/OCDSSupplierRelations';
import {AffidavitList} from './pages/AffidavitList';
import {PersonSearchPage} from './pages/PersonSearchPage'
import {PersonDetailPage} from './pages/PersonDetailPage'
import {OCDSItemsRankingPage} from './pages/OCDSItemsRankingPage';
import {AndeExoneratedList} from './pages/AndeExonerated';
import {EssapExoneratedList} from './pages/EssapExonerated';
import {ElectedAuthoritiesPage} from './pages/ElectedAuthoritiesPage';
import {ActionResearchLanding} from './pages/ActionResearchLanding';
import {OCDSBuyersPage} from './pages/OCDSBuyers';
import {OCDSSupplierWithSanctionPage} from './pages/OCDSSupplierWithSanction';
import {OCDSCovidTenders} from './pages/OCDSCovidTenders';
import AboutPage from "./pages/AboutPage";
import {LandingPage} from "./pages/Landing";
import {DSDownload} from "./pages/DatasourcesDownload";
import {DisclaimerPage} from "./pages/DisclaimerPage";
import {OCDSItem} from "./pages/OCDSItem";
import {OCDSBuyerPage} from "./pages/OCDSBuyer";
import {OCDSSupplier} from "./pages/OCDSSupplier";
import {DJBRDashboard} from "./pages/DJBRDashboard";
import {TutorialsPage} from "./pages/TutorialsPage";
import {DJBRListPage} from "./pages/DJBRListPage";
import {AnalysisLanding} from "./analysis/pages/AnalysisLanding";
import {AnalysisNetWorthIncrement} from "./analysis/pages/AnalysisNetWorthIncrement";

export default function App() {
    return <Routes/>
}

function Routes() {

    return <Router>
        <QueryParamProvider ReactRouterRoute={Route}>
            <Switch>
                <Route path="/about" exact render={() => <AboutPage/>}/>

                <Route path="/action" exact render={() => <ActionResearchLanding/>}/>
                <Route path="/action/authorities/elected"><ElectedAuthoritiesPage/></Route>
                <Route path="/action/covid/ande" exact render={() => <AndeExoneratedList/>}/>
                <Route path="/action/covid/essap" exact render={() => <EssapExoneratedList/>}/>
                <Route path="/action/ocds/buyers" exact render={() => <OCDSBuyersPage/>}/>
                <Route path="/action/ocds/itemsRanking" exact render={() => <OCDSItemsRankingPage/>}/>
                <Route path="/action/ocds/items" exact render={() => <OCDSAwardItemsPage/>}/>
                <Route path="/action/ocds/relations" exact render={() => <OCDSSupplierRelations/>}/>
                <Route path="/action/ocds/sanctioned_suppliers" exact render={() => <OCDSSupplierWithSanctionPage/>}/>
                <Route path="/action/ocds/suppliers" exact render={() => <OCDSSuppliers/>}/>
                <Route path="/action/ocds/tenders" exact render={() => <OCDSCovidTenders/>}/>

                <Route path="/ocds/items/:itemId" exact render={() => <OCDSItem/>}/>
                <Route path="/ocds/suppliers/:ruc" exact render={() => <OCDSSupplier/>}/>
                <Route path="/ocds/buyer/:id" exact render={() => <OCDSBuyerPage/>}/>
                <Route path="/ocds/" exact render={() => <Redirect to="/ocds/items"/>}/>

                <Route path="/disclaimer" exact render={() => <DisclaimerPage/>}/>

                <Route path="/explore" exact render={() => <Welcome/>}/>
                <Route path="/explore/authorities/elected"><ElectedAuthoritiesPage/></Route>
                <Route path="/explore/contralory/affidavit" exact render={() => <AffidavitList/>}/>
                <Route path="/explore/covid/ande" exact render={() => <AndeExoneratedList/>}/>
                <Route path="/explore/covid/essap" exact render={() => <EssapExoneratedList/>}/>
                <Route path="/explore/ocds/itemsRanking" exact render={() => <OCDSItemsRankingPage/>}/>
                <Route path="/explore/ocds/items" exact render={() => <OCDSAwardItemsPage/>}/>
                <Route path="/explore/ocds/relations" exact render={() => <OCDSSupplierRelations/>}/>
                <Route path="/explore/ocds/suppliers" exact render={() => <OCDSSuppliers/>}/>
                <Route path="/explore/people"><DocumentSearchPage/></Route>
                <Route path="/explore/person/:query?" exact render={() => <PersonSearchPage/>}/>

                <Route path="/person/:document" exact render={() => <PersonDetailPage/>}/>

                <Route path="/sources" exact render={() => <DS/>}/>
                <Route path="/djbr/" exact render={() => <DJBRDashboard/>}/>
                <Route path="/djbr/portal" exact render={() => <DJBRDashboard/>}/>
                <Route path="/djbr/tutorial" exact render={() => <TutorialsPage/>}/>
                <Route path="/djbr/list" exact render={() => <DJBRListPage/>}/>
                <Route path="/explore/djbr/list" exact render={() => <DJBRListPage/>}/>

                <Route path="/sources/:dataSetId" exact render={() => <DSDownload/>}/>

                <Route path="/analysis/" exact render={() => <AnalysisLanding/>}/>
                <Route path="/analysis/net_worth/:document" exact render={() => <AnalysisNetWorthIncrement/>}/>

                <Route path="/">
                    <LandingPage/>
                </Route>
            </Switch>
        </QueryParamProvider>
    </Router>
}
