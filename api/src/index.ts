import express from 'express';
import pg from 'pg';
import cors from 'cors';
import {StagingService} from './services/Staging';
import {OCDSService} from './services/OCDS';
import helmet from 'helmet';
import {ContraloryService} from './services/ContraloryService';
import {AnalysisService} from "./services/AnalysisService";
import {AdminOperationsService} from "./services/AdminOperationsService";
import {ColumnConfig, DataTablesService} from "./datatables/DataTablesService";

const app = express()
const port = process.env.PORT || 3000

const apiKey = process.env.API_KEY || generateRandomString(32);
if (!process.env.API_KEY) {
    console.warn(`No API_KEY provided, using generated key: "${apiKey}"`)
}

const pool = new pg.Pool()
const dtService = new DataTablesService(pool);

app.use(cors())
app.use(helmet());

app.get('/api/', (_, res) => res.send({msg: 'Hello world!'}))
app.get('/api/find', wrap(req => {
    const cedula = req.query.query;
    if (!cedula || typeof cedula !== 'string' || cedula.trim() === '') {
        throw new ApiError('invalid.cedula', 409, {cedula});
    }
    return new StagingService(pool).findStaging(cedula);
}))

app.get('/api/findAnalysis', wrap(req => {
    const document = req.query.query;
    if (!document || typeof document !== 'string' || document.trim() === '') {
        throw new ApiError('invalid.cedula', 409, {document: document});
    }
    return new StagingService(pool).findAnalysis(document);
}))

app.get('/api/people/:document/declarations', wrap(req => {
    const document = req.params.document;
    if (!document || typeof document !== 'string' || document.trim() === '') {
        throw new ApiError('invalid.cedula', 409, {document});
    }
    return new ContraloryService(pool).getDeclarationsOf(document);
}));

app.get('/api/contralory/declarations', wrap(req => {
    const columns: ColumnConfig[] = [
        {name: 'id', filterType: "no_filter"},
        {name: 'document', filterType: 'equals'},
        {name: 'name', filterType: 'contain'},
        {name: 'year', filterType: 'equals'},
        {name: 'version', filterType: 'equals'},
        {name: 'link', filterType: 'no_filter'},
        {name: 'origin', filterType: 'no_filter'},
        {name: 'link_sandwich', filterType: 'no_filter'},
        {name: 'type', filterType: 'no_filter'},
        {name: 'active', filterType: 'equals', descNullLast: true},
        {name: 'passive', filterType: 'equals', descNullLast: true},
        {name: 'net_worth', filterType: 'equals', descNullLast: true},
        {name: 'charge', filterType: 'equals'},
    ];
    return dtService.query({
        columns,
        table: 'analysis.djbr',
        idColumn: 'id',
        baseOrder: {
            'net_worth': 'DESC'
        }
    }, {
        ...extractPage(req),
        filter: dtService.extractColumnFilter(req.query, columns),
        order: dtService.extractSortOrder(req.query, columns)
    });
}));

app.get('/api/ocds/items', wrap(req => {
    const page = extractPage(req);
    return new OCDSService(pool).getPaginatedList(page.page, page.size);
}));

app.get('/api/ocds/suppliers', wrap(req => {
    const page = extractPage(req);
    return new OCDSService(pool).getSuppliers(page.page, page.size);
}));

app.get('/api/ocds/suppliers/:supplierRuc', wrap(req => {
    const supplier = validateNonEmpty('supplierRuc', req.params.supplierRuc)
    return new OCDSService(pool).getSupplierInfo(supplier);
}));

app.get('/api/ocds/items/:itemId', wrap(req => {
    const item = validateNonEmpty('itemId', req.params.itemId)
    return new OCDSService(pool).getItemInfo(item);
}));

app.get('/api/ocds/items/:itemId/evolution', wrap(req => {
    const item = validateNonEmpty('itemId', req.params.itemId)
    return new OCDSService(pool).getItemPriceEvolution(item);
}));

app.get('/api/ocds/items/:itemId/parties', wrap(req => {
    const item = validateNonEmpty('itemId', req.params.itemId)
    return new OCDSService(pool).getItemParties(item);
}));

app.get('/api/ocds/buyer/:id', wrap(req => {
    const buyerId = validateNonEmpty('id', req.params.id)
    return new OCDSService(pool).getBuyerInfo(buyerId);
}));

app.get('/api/ocds/buyer/:id/suppliers', wrap(req => {
    const buyerId = validateNonEmpty('id', req.params.id)
    return new OCDSService(pool).getSuppliersByBuyer(buyerId);
}));

app.get('/api/ocds/suppliers/:supplierRuc/contracts', wrap(req => {
    const page = extractPage(req);
    const supplier = validateNonEmpty('supplierRuc', req.params.supplierRuc)
    return new OCDSService(pool).getSupplierContracts(page.page, page.size, supplier);
}));


app.get('/api/analysis/net_worth_increment', wrap(req => {
    const document = validateNonEmpty('document',
        validateString('document', req.query.document));
    return new AnalysisService(pool).netWorthIncrement(document);
}));

app.get('/api/analysis/net_worth_increment/byDec', wrap(req => {
    const document = validateNonEmpty('document',
        validateString('document', req.query.document));
    const id = validateNumber('id', req.query.id);
    return new AnalysisService(pool).getDataOfYear(document, id);
}));

app.get('/api/admin/parse_all_decs', wrap(req => {
    const document = validateNonEmpty('document',
        validateString('document', req.query.document));
    const givenKey = validateNonEmpty('apiKey',
        validateString('apiKey', req.query.apiKey));

    if (apiKey !== givenKey) {
        throw new ApiError("Invalid api key", 403, {key: givenKey});
    }
    return new AdminOperationsService(pool).parseAllDecs(document);
}));

app.listen(port, () => console.log(`API listening at http://localhost:${port}`))


function wrap(fn: (req: express.Request, res: express.Response) => Promise<unknown> | object | void) {
    return (req: express.Request, res: express.Response) => {
        if (!fn) return;
        handlePromise(res, () => fn(req, res))
            .catch(err => handleError(err, res));
    }
}

async function handlePromise(
    res: express.Response,
    prom: () => Promise<unknown> | void | object
) {
    try {
        const response = prom();
        if (response instanceof Promise) {
            const body = await response;
            res.send(body);
        } else {
            res.send(response);
        }
    } catch (e) {
        handleError(e, res);
    }
}

function extractPage(req: express.Request): { page: number, size: number } {
    const page = toNumber(req.query.page || '1');
    const size = toNumber(req.query.size || '10');
    if (!assertNumber(page) || !assertNumber(size)) {
        throw new ApiError('invalid.pagination', 400, {page: req.query.page, size: req.query.size});
    }

    return {page, size}
}

function handleError(err: object, res: express.Response) {
    if (err instanceof ApiError) {
        console.warn('ApiError in API, check console ', err.meta, err);
        res.status(err.code || 500).send({reason: err.message || 'Unexpected error', meta: err.meta})
    } else {
        console.warn('Error in API, check console ', err);
        res.status(500).send({reason: 'Unexpected error, check console'})
    }
}

function assertNumber(val: any): val is number {
    return typeof val === 'number' && !isNaN(val);

}

function toNumber(page: any): number {
    if (typeof page === 'string') return parseInt(page);
    if (typeof page === 'number') return page;
    return NaN;
}

export class ApiError extends Error {
    constructor(msg: string, public code?: number, public meta?: unknown) {
        super(msg);
    }
}

function validateNonEmpty(paramName: string, param: string): string {
    if (!param || param.trim() === '') throw new ApiError(`invalid.${paramName}`)
    return param;
}

function validateNonEmptyString(paramName: string, param: unknown): string {
    const str = validateString(paramName, param);
    if (!str || str.length === 0) throw new ApiError(`invalid.${paramName}`)
    return str;
}

function validateString(paramName: string, param: any): string {
    if (!param || typeof param !== 'string') {
        throw new ApiError('invalid.' + paramName, 409, {param});
    }
    return param;
}

function validateNumber(paramName: string, param: any): number {
    if (!param || typeof param !== 'string' || isNaN(parseInt(param))) {
        throw new ApiError('invalid.' + paramName, 409, {param});
    }

    return parseInt(param);
}

function generateRandomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
