import {Pool} from "pg";
import {AnalysisDJBR, NetWorthIncreaseAnalysis} from "../APIModel";
import {NetWorthAnalysis} from "../analysis/NetWorthAnalysis";

export class AnalysisService {

    constructor(private pool: Pool) {
    }


    async netWorthIncrement(document: string): Promise<NetWorthIncreaseAnalysis> {

        return new NetWorthAnalysis().buildData(await this.fetchDeclarations(document), document);
    }

    private async fetchDeclarations(document: string): Promise<Array<AnalysisDJBR>> {

        const data = await this.pool.query("SELECT * FROM analysis.djbr WHERE document = $1", [document])
        return data.rows;
    }
}
