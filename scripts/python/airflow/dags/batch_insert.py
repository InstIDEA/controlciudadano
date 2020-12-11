from __future__ import annotations

import csv
import json
from typing import List, Dict, Union

from airflow import AirflowException
from airflow.hooks.postgres_hook import PostgresHook


def fix_name(to_ret: str = ""):
    return to_ret.replace("G�E", "GÜE") \
        .replace('ARGA�A', 'ARGAÑA') \
        .replace('NU�EZ', 'NUÑEZ') \
        .replace('CA�ETE', 'CAÑETE') \
        .replace('IBA�EZ', 'IBAÑEZ') \
        .replace('PE�A', 'PEÑA') \
        .replace('MU�OZ', 'MUÑOZ') \
        .replace('ACU�A', 'ACUÑA') \
        .replace('FARI�A', 'FARIÑA') \
        .replace('QUI�ONEZ', 'QUIÑONEZ')


class ColumnMapping:
    source_name: str
    column_name: str
    sql_type: str
    maps: Dict[Union[str, None], Union[str, None]]
    rules: List[str]

    def __init__(self, source_name='', sql_type='text', column_name='SAME_AS_SOURCE'):
        self.source_name = source_name
        self.column_name = column_name
        self.sql_type = sql_type
        self.maps = {}
        self.rules = []
        self.constant_value = ""

    @staticmethod
    def constant_column(column_name: str, value: str) -> ColumnMapping:
        """
        Currently we only support constant as the last elements
        :param column_name:  the column name
        :param value:  the value
        :return: a column mapping
        """
        return ColumnMapping("__CONSTANT__", "text", column_name).map(None, value)

    def get_column_name(self):
        if self.column_name == 'SAME_AS_SOURCE':
            return self.source_name
        return self.column_name

    def get_format(self):
        return "%s"

    def map(self, f: Union[str, None], to: Union[str, None]) -> ColumnMapping:
        self.maps[f] = to
        return self

    def empty_to_none(self) -> ColumnMapping:
        self.rules.append("EMPTY_TO_NONE")
        return self

    def remove_dots(self) -> ColumnMapping:
        self.rules.append("REMOVE_DOTS")
        return self

    def fix_name(self) -> ColumnMapping:
        self.rules.append("FIX_NAME")
        return self

    def dump_json(self) -> ColumnMapping:
        self.rules.append("DUMP_JSON")
        return self

    def do_map(self, val: Union[str, None]) -> Union[str, None]:
        """
        Maps the val to using the list of mapping
        :param val: the value to map
        :return: the mapped value
        """
        to_ret = val
        if type(val) is str and val in self.maps:
            to_ret = self.maps[val]

        if to_ret is None and None in self.maps:
            to_ret = self.maps[None]

        if "DUMP_JSON" in self.rules and to_ret is not None:
            to_ret = json.dumps(to_ret)

        if isinstance(to_ret, str):

            if "EMPTY_TO_NONE" in self.rules and "" == to_ret.strip():
                to_ret = None

            if "REMOVE_DOTS" in self.rules and to_ret is not None:
                to_ret = to_ret.replace(".", "")

            if "FIX_NAME" in self.rules and to_ret is not None:
                to_ret = fix_name(to_ret)

        return to_ret


def batch_read_csv_file(file_path: str, batch_size=10000, skip_header=True, encoding="UTF-8"):
    print(f"Reading file {file_path} with encoding {encoding} batch_size {batch_size}")
    with open(file_path, "r", encoding=encoding) as csv_file:
        reader = csv.reader(csv_file)

        to_yield = []
        counter = 0
        if skip_header:
            next(reader, None)

        for row in reader:
            # print(f" -> brcf -> read: {','.join(row)}")
            to_yield.append(row)
            counter += 1
            if divmod(counter, batch_size)[1] == 0:
                print(f" -> yielding {len(to_yield)}")
                yield to_yield
                to_yield = []

        if len(to_yield) > 0:
            yield to_yield


def batch_read_json_file(file_path: str, batch_size=10000, encoding="UTF-8", sub_path=""):
    print(f"Reading json file {file_path} with encoding {encoding} batch_size {batch_size}")
    with open(file_path, "r", encoding=encoding) as json_file:
        # TODO make this load in batch
        data = json.load(json_file)

        if sub_path is not None:
            for part in sub_path.split("."):
                if part not in data:
                    raise AirflowException(f"The sub-path {part} (of {sub_path}) does not exists")
                data = data[part]

        to_yield = []
        counter = 0

        for row in data:
            to_yield.append(row)
            counter += 1
            if divmod(counter, batch_size)[1] == 0:
                print(f" -> yielding {len(to_yield)}")
                yield to_yield
                to_yield = []

        if len(to_yield) > 0:
            yield to_yield


def batch_insert_csv_file(file_path: str,
                          table_name: str,
                          columns: List[ColumnMapping],
                          con_id="postgres_default",
                          db_name="postgres",
                          batch_size=10000,
                          file_encoding="UTF-8"):
    return batch_insert_file(file_path, table_name, 'csv', columns, con_id, db_name, batch_size, file_encoding)


def batch_insert_file(file_path: str,
                      table_name: str,
                      file_type: str,
                      columns: List[ColumnMapping],
                      con_id="postgres_default",
                      db_name="postgres",
                      batch_size=10000,
                      file_encoding="UTF-8",
                      json_sub_path=""
                      ):
    db_hook = PostgresHook(postgres_conn_id=con_id, schema=db_name)
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()

    column_names = []
    sql_format = []
    for column in columns:
        column_names.append(column.get_column_name())
        sql_format.append(column.get_format())

    sql = """
            INSERT INTO {} ({}) VALUES ({})
    """.format(table_name, ', '.join(column_names), ', '.join(sql_format))

    print(f" -> bi -> SQL to execute {sql} ")

    if file_type == 'csv':
        for batch in batch_read_csv_file(file_path, batch_size, encoding=file_encoding):
            for row in batch:
                for idx in range(len(columns)):
                    definition = columns[idx]
                    if definition.source_name == '__CONSTANT__':
                        if idx > len(row):
                            raise AirflowException(f"You can only put constants at end of ColumnMapping, error with {definition.constant_value}")
                        row.append(definition.do_map(None))
                    else:
                        row[idx] = definition.do_map(row[idx])

            # END MAPPING
            db_cursor.executemany(sql, batch)
            db_conn.commit()

    if file_type == 'json':
        for batch in batch_read_json_file(file_path, batch_size, encoding=file_encoding, sub_path=json_sub_path):
            batch_to_insert = []
            for row in batch:
                row_to_insert = []
                batch_to_insert.append(row_to_insert)
                for idx in range(len(columns)):
                    definition = columns[idx]
                    if definition.source_name == '__CONSTANT__':
                        row_to_insert.append(definition.do_map(None))
                    else:
                        val = row[definition.source_name]
                        row_to_insert.append(definition.do_map(val))

            db_cursor.executemany(sql, batch_to_insert)
            db_conn.commit()

