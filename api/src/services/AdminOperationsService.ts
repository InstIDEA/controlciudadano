import {Pool} from "pg";
import {fetchParsedDJBR, ParserResult} from "../analysis/DJBRParserApi";


export class AdminOperationsService {

    constructor(private pool: Pool) {
    }

    async parseAllDecs(doc: string): Promise<unknown> {

        console.log(`Parsing decs of ${doc}`);
        const listResult = await this.pool.query(`
            SELECT data.id, data.link
            FROM analysis.djbr data
                     LEFT JOIN analysis.temp_djbr_scrapped_data tmp ON tmp.raw_data_id = data.id
            WHERE data.document = $1
              AND tmp IS NULL
        `, [doc]);

        console.log(`Found ${listResult.rowCount} rows`);
        const rows = listResult.rows;
        let success = 0;
        let error = 0;
        for (const row of rows) {

            const file = row.link;
            const id = row.id;

            try {
                const parsed = await fetchParsedDJBR(file);
                if (!parsed.data) throw new Error("The api doesn't return data");
                await this.storeParsedData(id, parsed);
                success++;
            } catch (e) {
                console.warn(`The dec ${id} can't be parsed because`, e);
                error++;
            }

        }
        return {
            document: doc,
            success,
            error
        }
    }

    private async storeParsedData(rowId: number, {data}: ParserResult): Promise<void> {

        if (rowId < 0) {

            const toUpdate = [data.resumen.patrimonioNeto, data.resumen.totalActivo, data.resumen.totalPasivo, data.cargo, -rowId];
            const updateResult = await this.pool.query(`
                UPDATE analysis.declarations
                SET net_worth=$1, active=$2, passive=$3, charge=$4
                WHERE id=$5
            `, toUpdate);

            console.log(`Inserted data for ${rowId}, result ${updateResult.rowCount}`, toUpdate);
            return;
        }

        const toInsert = [
            rowId, data.resumen.totalActivo, data.resumen.totalPasivo, data.resumen.patrimonioNeto, new Date(), 'GO_PARSER'
        ];
        const isResult = await this.pool.query(`
            INSERT INTO analysis.temp_djbr_scrapped_data(raw_data_id, active, passive, net_worth, scraped_date, scraped_alg)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, toInsert);

        console.log(`Inserted data for ${rowId}, result ${isResult.rowCount}`, toInsert)
    }
}
