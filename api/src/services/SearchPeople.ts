import pg from 'pg';

const queries = {
    'nangareko': "SELECT name, cid as document FROM staging.nangareko WHERE upper(trim(regexp_replace(name, '\\s+', '', 'g'))) LIKE $1 GROUP BY cid, name ",
    'policia': "SELECT DISTINCT nombres || ' ' || apellidos as name, max(presupuesto) as salary, cedula as document  FROM staging.policia WHERE upper(trim(regexp_replace(nombres || apellidos, '\\s+', '', 'g')))  LIKE $1 GROUP BY nombres,apellidos,cedula",
    'ande_exonerados': "SELECT cliente as name, documento as document FROM staging.ande_exonerados WHERE upper(trim(regexp_replace(cliente, '\\s+', '', 'g')))  LIKE $1 GROUP BY cliente, documento",
    'tsje_elected': "SELECT nombre || ' ' || apellido as name, cedula as document, max(edad) as age FROM analysis.tsje_elected WHERE upper(trim(regexp_replace(nombre || apellido, '\\s+', '', 'g')))  LIKE $1 GROUP BY nombre, apellido, cedula",
    'declarations': "SELECT name, max(active) as active, max(passive) as passive, max(net_worth) as net_worth FROM analysis.declarations WHERE upper(trim(regexp_replace(name, '\\s+', '', 'g'))) LIKE $1 GROUP BY name",
}


export class SearchPeople {

    constructor(private db: pg.Pool) {
    }


    async findPerson(query: string): Promise<{ query: string, data: Record<string, unknown> }> {

        if (!query || !query.trim()) return {query: query, data: {}};

        const promises = [];
        const toSearch = `%${query.toUpperCase().replace(/\s+/g, '').replace(/%/g, '')}%`;
        // now we search by name
        const tables = Object.keys(queries).map((key: keyof typeof queries) => ({name: key, sql: queries[key]}))
        for (let table of tables) {
            const sql = table.sql;
            console.log(`Executing query: "${sql}" with param "${toSearch}"`)
            promises.push(this.db.query(sql, [toSearch]));
        }

        const results = await Promise.all(promises);
        const toRet: { [k: string]: object[] } = {};
        for (let i = 0; i < results.length; i++) {
            const name = tables[i].name;
            console.log(`Result from ${name} has ${results[i].rows.length} rows`)
            toRet[name] = results[i].rows;
        }

        return {
            query,
            data: toRet
        }
    }

}
