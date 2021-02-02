import crypto from "crypto";
import pg from 'pg';
import {ContraloryService} from './ContraloryService';

type Mapper = (k: { [k: string]: any }) => { [k: string]: any };

const staging = [
    {table: 'pytyvo', column: 'cid'},
    {table: 'nangareko', column: 'cid'},
    {table: 'nangareko_2', column: 'cid'},
    {table: 'nangareko_transparencia', column: 'numero_documento'},
    {table: 'hacienda_funcionarios', column: 'codigopersona'},
    {table: 'sfp', column: 'documento'},
    {table: 'policia', column: 'cedula'},
    {table: 'ande_exonerados', column: 'regexp_replace(documento, \'[^0-9]+\', \'\', \'g\')'},
    {table: 'a_quien_elegimos', column: 'regexp_replace(identifier, \'\\.\', \'\', \'g\')'}
];

const analysis = [
    {table: 'tsje_elected', column: 'document'},
    {table: 'djbr', column: 'document'},
]

const mappers: { [k: string]: Mapper } = {
    'nangareko_2': (row) => ({cid: row.cid, name: row.name}),
    'pytyvo': (r) => ({...r, file: crypto.createHash('md5').update(r.file).digest('hex')}),
    'policia': (r) => ({...r, filename: crypto.createHash('md5').update(r.filename).digest('hex')}),
}

const IDENTITY: Mapper = row => row;

export class StagingService {

    constructor(private db: pg.Pool) {
    }

    async findStaging(cedula: string): Promise<{ query: string, staging: Record<string, unknown> }> {
        const promises = [];

        for (let table of staging) {
            promises.push(this.db.query(`SELECT * FROM staging.${table.table} WHERE ${table.column} = $1`, [cedula]));
        }

        const results = await Promise.all(promises);
        const toRet: { [k: string]: object[] } = {};
        for (let i = 0; i < results.length; i++) {
            const tableName = staging[i].table;
            toRet[tableName] = results[i].rows.map(mappers[tableName] || IDENTITY);
        }
        return {
            query: cedula,
            staging: toRet
        };
    }

    async findAnalysis(document: string) {

        const promises = [];

        for (let table of analysis) {
            promises.push(this.db.query(`SELECT * FROM analysis.${table.table} WHERE ${table.column} = $1`, [document]));
        }

        const results = await Promise.all(promises);
        const toRet: { [k: string]: object[] } = {};
        for (let i = 0; i < results.length; i++) {
            const tableName = analysis[i].table;
            toRet[tableName] = results[i].rows;
        }
        toRet['declarations'] = (await (new ContraloryService(this.db).getDeclarationsOf(document))).data;
        return {
            query: document,
            analysis: toRet
        };
    }
}
