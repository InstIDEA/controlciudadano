from __future__ import annotations

import csv
from typing import List

from airflow.hooks.postgres_hook import PostgresHook


class ColumnMapping:
    csv_name: str
    column_name: str
    sql_type: str

    def __init__(self, csv_name='', sql_type='text', column_name='SAME_AS_CSV'):
        self.csv_name = csv_name
        self.column_name = column_name
        self.sql_type = sql_type

    def get_column_name(self):
        if self.column_name == 'SAME_AS_CSV':
            return self.csv_name
        return self.column_name

    def get_format(self):
        if self.sql_type == 'integer':
            return "%s"
        return "%s"


def batch_read_csv_file(file_path: str, batch_size=10000, skip_header=True):
    with open(file_path, "r") as csv_file:
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


def batch_insert_csv_file(file_path: str,
                          table_name: str,
                          columns: List[ColumnMapping],
                          con_id="postgres_default",
                          db_name="postgres",
                          batch_size=10000):
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
    # db_cursor.execute(sql, group)
    # get the generated id back
    # vendor_id = db_cursor.fetchone()[0]
    # execute the INSERT statement
    for batch in batch_read_csv_file(file_path, batch_size):
        db_cursor.executemany(sql, batch)
        db_conn.commit()
