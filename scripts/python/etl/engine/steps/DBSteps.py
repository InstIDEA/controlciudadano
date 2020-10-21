from typing import Union, Callable, Dict

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Connection, Transaction, RootTransaction, ResultProxy, Engine

from etl.engine.Runner import Context
from etl.engine.core.BaseStep import BaseStep


def to_arr_dict(proxy: ResultProxy):
    d, a = {}, []
    for row in proxy:
        for column, value in row.items():
            # build up the dictionary
            d = {**d, **{column: value}}
        a.append(d)

    return a


def get_con(ctx: Context) -> Connection:
    return ctx.get("CONNECTION")


def get_txn(ctx: Context) -> Union[RootTransaction, Transaction]:
    return ctx.get("TRANSACTION")


class GetDB(BaseStep):

    def __init__(self, conn_name: str):
        super().__init__("GetDB")
        self.conn_name = conn_name.upper()

    def prepare(self, ctx: Context):
        super().prepare(ctx)

        env_name = self.conn_name + "_CONN"

        if ctx.env(env_name) is None:
            return ctx.fail(f"Please add a env variable called '{env_name}' with a valid sqlalchemy connection string")

        cnx = create_engine(ctx.env(env_name))
        engine = cnx.connect()
        ctx.put("CONNECTION", engine)
        ctx.logger.info(f"Created connection for '{self.conn_name}' and stored under 'CONNECTION' ctx")

    def clean_up(self, ctx: Context):
        try:
            ctx.get("CONNECTION").close()
            ctx.remove("CONNECTION")
            ctx.logger.info(f"Closed connection for '{self.conn_name}'")
        except KeyError:
            # the connection wasn't created
            pass


class BeginTransaction(BaseStep):

    def __init__(self):
        super().__init__("BeginTransaction")

    def prepare(self, ctx: Context) -> bool:
        conn = get_con(ctx)

        txn = conn.begin()
        ctx.put("TRANSACTION", txn)
        ctx.log(f"Transaction started")
        return True

    def commit(self, ctx: Context) -> bool:
        get_txn(ctx).commit()
        ctx.remove("TRANSACTION")
        ctx.logger.info(f"Transaction committed")
        return True

    def on_abort(self, ctx: Context) -> bool:
        get_txn(ctx).rollback()
        ctx.remove("TRANSACTION")
        ctx.logger.info(f"Transaction removed")
        return True


class QueryDB(BaseStep):
    __query: str
    __params: Dict[str, any]
    __handler: Callable[[Context], bool]

    def __init__(self):
        super().__init__("QueryDB")
        self.__query = ""
        self.__params = {}

    def query(self, query: str):
        self.__query = query
        return self

    def params(self, params: Dict[str, any]):
        self.__params = params
        return self

    def with_result(self, param: Callable[[Context], bool]):
        self.__handler = param
        return self

    def prepare(self, ctx: Context) -> bool:
        result = get_con(ctx).execute(text(self.__query), **self.__params)
        ctx.put("QUERY_RESULT", to_arr_dict(result))
        self.__handler(ctx)
        return True


class BatchInsert(BaseStep):
    """
    This step reads a CSV file and perform a batch insert into a table
    """

    def __init__(self, table: str, commit_size = 10000):
        super().__init__(f"BatchInsert on '{table}'")
        self.table = table

    def prepare(self, ctx: Context) -> bool:
        return True
