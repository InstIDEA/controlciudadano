import express from 'express';
import pg from 'pg';
import cors from 'cors';
import {StagingService} from './services/Staging';
import {OCDSService} from './services/OCDS';
import helmet from 'helmet';
import {ContraloryService} from './services/ContraloryService';
import {SearchPeople} from './services/SearchPeople';

const app = express()
const port = process.env.PORT || 3000

const pool = new pg.Pool()

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

app.get('/api/search', wrap(req => {
    const query = req.query.query;
    if (!query || typeof query !== 'string' || query.trim() === '') {
        throw new ApiError('invalid.query', 409, {query});
    }
    return new SearchPeople(pool).findPerson(query);
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
    const page = extractPage(req);
    return new ContraloryService(pool).getDeclarations(page.size, page.page);
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

function extractPage(req: express.Request) {
    const page = toNumber(req.query.page);
    const size = toNumber(req.query.size);
    if (!assertNumber(page) || !assertNumber(size)) {
        throw new ApiError('invalid.pagination', 400, {page, size});
    }

    return {page, size}
}

function handleError(err: unknown, res: express.Response) {
    if (err instanceof ApiError) {
        console.warn('Error in API, check console ', err.meta, err);
        res.status(err.code || 500).send({reason: err.message || 'Unexpected error', meta: err.meta})
    } else {
        console.warn('Error in API, check console ', err);
        res.status(500).send({reason: 'Unexpected error, check console'})
    }
}

function assertNumber(val: any): val is number {
    return typeof val === 'number';

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

function validateNonEmpty(paramName: string, supplierRuc: string): string {
    if (!supplierRuc || supplierRuc.trim() === '') throw new ApiError(`invalid.${paramName}`)
    return supplierRuc;
}
