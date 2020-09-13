import pg from 'pg';

const COLUMNS = `
    id            AS id,
    document      AS document,
    name          AS name,
    year          AS year,
    version       AS revision,
    link          AS link,
    origin        AS source,
    link_sandwich AS linksandwich,
    type          AS type,
    active        AS actives,
    passive       AS passive,
    net_worth     AS networth,
    charge        AS charge
`

export class ContraloryService {

    constructor(private db: pg.Pool) {
    }


    async getDeclarations(size: number, page: number) {

        const QUERY = `SELECT ${COLUMNS} FROM analysis.declarations LIMIT $1 OFFSET $2`;
        const pagination = ContraloryService.calcOffsetLimit(page, size);
        const dataP = this.db.query(QUERY, [pagination.limit, pagination.offset]);
        const countP = this.db.query(`SELECT count(*) FROM analysis.declarations`); 

        const [data, count] = await Promise.all([ dataP, countP ]);

        return {
            page: pagination.page,
            size: pagination.size,
            data: data.rows.map(ContraloryService.removeNulls),
            count: count.rows[0].count,
        }
    }

    async getDeclarationsOf(document: string) {

        const QUERY = `SELECT ${COLUMNS} FROM analysis.declarations WHERE document = $1`;
        const data = await this.db.query(QUERY, [document]);

        return {
            data: data.rows.map(ContraloryService.removeNulls),
        }
    }

    private static calcOffsetLimit(page?: number, size?: number) {

        if (!page || page < 1) page = 1;
        if (!size || size > 10000) size = 10000;

        const limit = size;
        const offset = (page - 1) * size;

        return {limit, offset, page, size}
    }

    private static removeNulls(d: any) {
        Object.getOwnPropertyNames(d).forEach((k: string) => {
            if (d[k] === null)
                delete d[k]
        });
        return d;
    }
}
