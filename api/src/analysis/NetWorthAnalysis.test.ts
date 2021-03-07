import {expect} from 'chai';
import {ContextData, NetWorthAnalysis, NetWorthAnalysisEnhancer} from "./NetWorthAnalysis";
import {AnalysisDJBR} from "../APIModel";

describe('NetWorthAnalysisTest', () => { // the tests container
    it('Use the latest available', () => { // the single test
        const toTest = new NetWorthAnalysis(); // this will be your class

        const decs: Array<AnalysisDJBR> = [
            getDec({download_date: new Date('2020/01/01 12:40'), id: 20, year: 2020}),
            getDec({download_date: new Date('2020/01/02 12:40'), id: 19, year: 2020}),
        ]

        expect(toTest.getLatestDeclarationsPerYear(decs)[2020].id).to.be.eq(19);

    });

    it('Fetch two sequential', () => { // the single test
        const toTest = new NetWorthAnalysis(); // this will be your class

        const decs: Array<AnalysisDJBR> = [
            getDec({download_date: new Date('2020/01/01 12:40'), id: 20, year: 2020}),
            getDec({download_date: new Date('2020/01/02 12:40'), id: 19, year: 2020}),
            getDec({download_date: new Date('2020/01/01 12:40'), id: 18, year: 2019}),
            getDec({download_date: new Date('2020/01/02 12:40'), id: 17, year: 2019}),
        ]

        const grouped = toTest.getLatestDeclarationsPerYear(decs);

        const best = toTest.getBestDeclarations(grouped);

        expect(best.last.year).to.be.eq(2020);
        expect(best.last.id).to.be.eq(19);
        expect(best.first.year).to.be.eq(2019);
        expect(best.first.id).to.be.eq(17);

    });

    it('Fetch single year', async () => { // the single test
        const toTest = new NetWorthAnalysis([new NoOpEnhancer()]); // this will be your class

        const dec = getDec({download_date: new Date('2020/01/02 12:40'), id: 17, year: 2019});


        const best = await toTest.getSpecificYear(dec);

        expect(best).to.be.exist;
        expect(best.year).to.be.eq(2019);

    });
});


function getDec(base: Partial<AnalysisDJBR>): AnalysisDJBR {
    return {
        id: 19,
        download_date: new Date('2020/01/01 12:40'),
        year: 2014,
        link: '',
        origin: '',
        name: '',
        document: '',
        net_worth: '',
        active: '',
        passive: '',
        charge: '',
        link_sandwich: '',
        scrapped_data: {},
        type: '',
        version: 2,
        ...base
    }
}


class NoOpEnhancer implements NetWorthAnalysisEnhancer {
    enhance(context: ContextData): Promise<void> {
        return
    }
}
