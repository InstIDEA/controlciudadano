import {Pool} from "pg";
import {AnalysisDJBR, DeclarationData, NetWorthIncreaseAnalysis} from "../APIModel";
import {NetWorthAnalysis} from "../analysis/NetWorthAnalysis";
import {ApiError} from "../index";

export class AnalysisService {

    constructor(private pool: Pool) {
    }


    async netWorthIncrement(document: string): Promise<NetWorthIncreaseAnalysis> {

        const found = await this.fetchDeclarationsOf(document);

        if (found.length === 0 || found[0].document !== document) {
            throw new ApiError(`User with document ${document} not found`, 404, {
                document
            });
        }
        return new NetWorthAnalysis().buildData(await this.fetchDeclarationsOf(document), document);
    }

    async getDataOfYear(document: string, id: number): Promise<DeclarationData> {

        const found = await this.fetchDeclaration(id);


        if (found.length === 0 || found[0].document !== document) {
            throw new ApiError(`Declaration with id ${id} of ${document} not found`, 404, {
                document,
                id
            });
        }

        return new NetWorthAnalysis().getSpecificYear(found[0]);
    }

    private async fetchDeclarationsOf(document: string): Promise<Array<AnalysisDJBR>> {

        const data = await this.pool.query("SELECT * FROM analysis.djbr WHERE document = $1", [document])
        return data.rows;
    }

    private async fetchDeclaration(id: number): Promise<Array<AnalysisDJBR>> {

        const data = await this.pool.query("SELECT * FROM analysis.djbr WHERE id = $1", [id])
        return data.rows;
    }
}
