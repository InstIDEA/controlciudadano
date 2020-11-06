import pg from 'pg';

const queries = {
    'nangareko': "SELECT array_agg(name) as names, cid as document FROM staging.nangareko WHERE upper(trim(regexp_replace(name, '\\s+', '', 'g'))) LIKE $1 GROUP BY cid ",
    'policia': "SELECT DISTINCT array_agg(nombres || ' ' || apellidos) as names, max(presupuesto) as salary, cedula as document  FROM staging.policia WHERE upper(trim(regexp_replace(nombres || apellidos, '\\s+', '', 'g')))  LIKE $1 GROUP BY cedula",
    'ande_exonerados': "SELECT array_agg(cliente) as names, documento as document FROM staging.ande_exonerados WHERE upper(trim(regexp_replace(cliente, '\\s+', '', 'g')))  LIKE $1 GROUP BY documento",
    'tsje_elected': "SELECT array_agg(nombre || ' ' || apellido) as names, cedula as document, max(edad) as age FROM analysis.tsje_elected WHERE upper(trim(regexp_replace(nombre || apellido, '\\s+', '', 'g')))  LIKE $1 GROUP BY cedula",
    'declarations': "SELECT array_agg(name) as names, document, max(active) as active, max(passive) as passive, max(net_worth) as net_worth FROM analysis.declarations WHERE upper(trim(regexp_replace(name, '\\s+', '', 'g'))) LIKE $1 GROUP BY document",
}


export class SearchPeople {

    constructor(private db: pg.Pool) {
    }


    async findPerson(query: string): Promise<{ query: string, data: Record<string, unknown> }> {

        if (!query || !query.trim()) return {query: query, data: {}};

        const promises = [];
        const toSearch = `%${query.toUpperCase().replace(/%/g, '').replace(/\s+/g, '%')}%`;
        // now we search by name
        const tables = Object.keys(queries).map((key: keyof typeof queries) => ({name: key, sql: queries[key]}))
        for (let table of tables) {
            const sql = table.sql;
            console.log(`Executing query: "${sql}" with param "${toSearch}"`)
            promises.push(this.db.query(sql, [toSearch]));
        }

        const results = await Promise.all(promises);
        const toRet: Record<string, Array<{ source: string, names: string[], document: string, [key: string]: unknown }>> = {};
        for (let i = 0; i < results.length; i++) {
            const name = tables[i].name;
            console.log(`Result from ${name} has ${results[i].rows.length} rows`)
            const rows: Array<{ source: string, names: string[], document: string, [key: string]: unknown }> = results[i].rows;
            // const rows = [];

            rows.forEach(row => {
                if (!(row.document in toRet)) {
                    toRet[row.document] = [];
                }
                toRet[row.document].push({
                    source: name,
                    ...row
                })
            });
        }


        return {
            query,
            data: toRet
        }
    }

}
