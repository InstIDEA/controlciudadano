from etl.engine.Runner import Runner
from etl.engine.core.Condition import Condition, EqualCondition
from etl.engine.core.Context import Context
from etl.engine.core.Flow import FlowBuilder
from etl.engine.core.MultiStep import MultiStep
from etl.engine.steps.DBSteps import GetDB, BeginTransaction
from etl.engine.steps.FileSystemSteps import AssureFolderExists, FileConditions, UnzipFile, CalculateHash
from etl.engine.steps.NetworkSteps import DownloadFile
from etl.engine.steps.Steps import PrintContext, EmptyStep, CallMethod, FailStep
from etl.jobs.StagingTablesSteps import GetDataSetState, GetDataSetFile


class SETFuncionarios:
    """
    This jobs first:

    1. Verify the last month that was uploaded
    2. Check if that month is fully loaded
    3. If that month is already fully loaded, go to next
    4. if not, drop data and reload latest data
    """

    def __init__(self):
        self.name = "SETFuncionarios"

    def get_steps(self):
        return FlowBuilder(). \
            step(AssureFolderExists("/tmp/set")). \
            step(GetDB("main_db")). \
            step(BeginTransaction()). \
            step(GetDataSetState("sfp")). \
            step(CallMethod(lambda ctx: self.__populate_state(ctx))). \
            step(Condition("Check if the file exists").
                 when(FileConditions.exists(lambda c: c.get("UNZIPPED_LOCATION"))).
                 then(EmptyStep()).
                 otherwise(MultiStep()
                           .step(DownloadFile()
                                 .url_producer(lambda c: c.get("URL_TO_DOWNLOAD"))
                                 .destination(lambda c: c.get("ZIPPED_LOCATION")))
                           .step(UnzipFile()
                                 .path(lambda c: c.get("ZIPPED_LOCATION"))
                                 .target(lambda c: c.get("UNZIPPED_LOCATION"))
                                 .single_file(True))
                           )
                 ). \
            step(CalculateHash().file(lambda c: c.get("UNZIPPED_LOCATION"))). \
            step(GetDataSetFile("sfp")). \
            step(Condition("Check if we need to upload the file")
                 .when(EqualCondition("STORED_FILE_HASH", "FILE_HASH"))
                 .then(FailStep("The file is already uploaded, nothing to do"))
                 .otherwise(EmptyStep())
                 ). \
            step(PrintContext()). \
            build()

    def __populate_state(self, ctx: Context) -> bool:
        last_update = ctx.get("DATASET_LAST_UPDATE")

        year = "2020"
        month = "4"

        file_url = f"https://datos.sfp.gov.py/data/funcionarios_{year}_{month}.csv.zip"

        ctx.put("UNZIPPED_LOCATION", f"/tmp/set/funcionarios_{year}_{month}.csv")
        ctx.put("ZIPPED_LOCATION", f"/tmp/set/funcionarios_{year}_{month}.csv.zip")
        ctx.put("URL_TO_DOWNLOAD", file_url)

        return True


if __name__ == '__main__':
    Runner(). \
        with_job(SETFuncionarios()). \
        run_now()

"""
Variable name	Value	Variable scope type
DATASET	sfp
HASH_TABLE	staging.sources
DB_FOR_HASHES	maindb	
FILE_NAME	funcionarios_${ANO}_${MES}.csv	
FOLDER	/tmp/sfp/	
FTP_FOLDER	./data/sfp/	
URL	https://datos.sfp.gov.py/data/funcionarios_${ANO}_${MES}.csv.zip	
DOWNLOADED	funcionarios_${ANO}_${MES}.zip	
"""
