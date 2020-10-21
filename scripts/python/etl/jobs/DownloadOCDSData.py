from datetime import date, datetime
from datetime import timedelta
from typing import Callable

from sqlalchemy import text

from etl.engine.Runner import Runner, Context
from etl.engine.core.Flow import FlowBuilder
from etl.engine.steps.DBSteps import GetDB, BeginTransaction, QueryDB
from etl.engine.steps.Steps import SkipIfRecent


class DownloadOCDSData:

    def __init__(self):
        self.name = "DownloadOCDSData"

    def get_steps(self):
        return FlowBuilder(). \
            step(GetDB("main_db")). \
            step(BeginTransaction()). \
            step(QueryDB()
                 .query("SELECT last_update FROM staging.data_set WHERE name = :name")
                 .params({"name": "ocds"})
                 .with_result(self.__handle_result())
                 ). \
            step(SkipIfRecent()
                 .date(lambda ctx: ctx.get("LAST_DATE"))
                 .compare_with(datetime.now() - timedelta(days=7))
                 ). \
            step(CurlStep()
                 .url(lambda ctx: "http://datapy.ftp.cds.com.py:26800/schedule.json")
                 .data(lambda ctx: {'project': 'kingfisher',
                                    'spider': 'paraguay_dncp_records',
                                    'from_date': ctx.get("LAST_DATE").strftime("%Y-%m-%dT%H:%M:%S")
                                    })
                 .store_result_in_key("CURL_RESULT_BODY")
                 .with_result(self.__store_job_id())
                 ). \
            build()
        # step(WaitFor()
        #      .method_return_true(self.__handle_wait())
        #      ). \
        # step(SingleInsert()
        #      .query("INSERT INTO view_data_dncp_data.selected_collections VALUES ({})")
        #      .ctx_params(lambda ctx: [ctx.get("PROCESS_ID")])
        #      ). \

    def __handle_result(self) -> Callable[[Context], bool]:
        def handler(ctx: Context):
            result = ctx.get("QUERY_RESULT")

            ctx.warn("result from query: ")
            ctx.warn(result)

            if len(result) == 0:
                last_update = self.__insert_definition(ctx)
            else:
                if len(result) > 1:
                    ctx.warn("More than one result returned from the data_set, should only be one with name 'ocds'")
                last_update = result[0]['last_update']

            ctx.put("LAST_DATE", last_update)

            return True

        return handler

    def __insert_definition(self, ctx):
        con = ctx.get("CONNECTION")
        to_ret = date.today() - timedelta(days=8)

        con.insert(text("INSERT INTO staging.data_set VALUES (:institution, :name, :last_update, :title, :url, :type)"),
                   institution="Dirección Nacional de Contrataciones Públicas (DNCP)",
                   name="ocds",
                   last_update=to_ret,
                   title="Conjunto de procesos de licitación pública en formato OCDS",
                   url="https://contrataciones.gov.py/datos/",
                   type="OTHER"
                   )

        return to_ret

    def __store_job_id(self):
        def handler(ctx):
            body = ctx.get("CURL_RESULT_BODY")
            raise Exception("Not implemented")
            # as_json = to_json(body)
            # ctx.put("PROCESS_ID", as_json["job_id"])

        return handler

    def __handle_wait(self):
        def handler(ctx):
            db = ctx.get("CONNECTION")
            process_id = ctx.get("PROCESS_ID")

            result = db.query(text("SELECT store_end_at FROM public.collection WHERE id = :process_id"),
                              process_id=process_id)

            if len(result) == 0 or result[0].store_end_at == None:
                return False
            return True

        return handler


if __name__ == '__main__':
    Runner(). \
        with_job(DownloadOCDSData()). \
        run_now()
