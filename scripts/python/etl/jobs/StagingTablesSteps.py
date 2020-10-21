from __future__ import annotations

from typing import Callable

from sqlalchemy import text

from etl.engine.core.BaseStep import BaseStep
from etl.engine.core.Context import Context
from etl.engine.steps.DBSteps import get_con, to_arr_dict


class GetDataSetState(BaseStep):

    def __init__(self, data_set: str):
        super().__init__(f"GetDataSetStateStep ${data_set}")
        self.__data_set = data_set

    def prepare(self, ctx: Context) -> bool:
        ctx.put("DATASET", self.__data_set)

        con = get_con(ctx)

        result = to_arr_dict(
            con.execute(text("SELECT * FROM staging.data_set WHERE name = :name"), name=self.__data_set))

        ctx.log("Info from database:")
        ctx.log(result)
        ctx.log("-------------------")

        if len(result) != 1:
            return ctx.fail(
                f"The data set name is not unique '{self.__data_set}', returned '{len(result)} rows, aborting")

        row = result[0]
        ctx.put("DATASET_ID", row["id"])
        ctx.put("DATASET_LAST_UPDATE", row["last_update"])

        return True


class GetDataSetFile(BaseStep):
    __hash_provider: Callable[[Context], str]

    def __init__(self, data_set: str):
        super().__init__(f"GetDataSetFile ${data_set}")
        self.__data_set = data_set
        self.__hash_provider = lambda c: c.get("FILE_HASH")

    def with_hash(self, clb: Callable[[Context], str]) -> GetDataSetFile:
        self.__hash_provider = clb
        return self

    def prepare(self, ctx: Context) -> bool:


        hash_to_find = self.__hash_provider(ctx)
        if hash_to_find is None or hash_to_find == "_INVALID_":
            return ctx.fail("Invalid hash provided to 'GetDataSetFile'")

        data_set_id = ctx.get("DATASET_ID")

        con = get_con(ctx)

        result = to_arr_dict(
            con.execute(text("SELECT * FROM staging.data_set_file WHERE hash = :hash and data_set_id = :id"),
                        hash=hash_to_find, id=data_set_id))

        ctx.log("Info from database:")
        ctx.log(result)
        ctx.log("-------------------")

        if len(result) > 1:
            return ctx.fail(
                f"The data set name is not unique '{self.__data_set}', returned '{len(result)} rows, aborting")

        if len(result) == 0:
            ctx.put("STORED_FILE_HASH", "-1")
        else:
            row = result[0]
            ctx.put("STORED_FILE_DATA", row)
            ctx.put("STORED_FILE_HASH", row["hash"])

        return True
