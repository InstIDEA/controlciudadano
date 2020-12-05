from __future__ import annotations
from typing import List

import hashlib
import os.path
import zipfile

from airflow import AirflowException
from airflow.contrib.hooks.ftp_hook import FTPHook
from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import BaseOperator
from airflow.utils.decorators import apply_defaults


class UnzipFile(BaseOperator):

    template_fields = ['path', 'target']

    @apply_defaults
    def __init__(
            self,
            path: str,
            target: str,
            is_single_file: bool,
            *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.path = path
        self.target = target
        self.is_single_file = is_single_file

    def execute(self, context):
        zip_file = self.path
        target = self.target
        single_file = self.is_single_file

        self.log.info(f"Unzipping file {zip_file} to {self.target} (is single: {self.is_single_file})")

        with zipfile.ZipFile(zip_file, "r") as zip_ref:
            if not single_file:
                zip_ref.extractall(target)
                return

            if len(zip_ref.namelist()) != 1:
                raise AirflowException(f"The zip file {zip_file} has {len(zip_ref.filelist)} files, can't proceed")

            first = zip_ref.namelist()[0]
            zip_ref.extract(first, "/tmp")
            unzipped_path = os.path.join("/tmp", first)
            if os.path.isfile(unzipped_path):
                os.rename(unzipped_path, target)
            else:
                raise AirflowException(
                    f"We unzipped the file {unzipped_path} from the zip {zip_file} but the file does not exist")


class CalculateHash(BaseOperator):

    template_fields = ['path']

    @apply_defaults
    def __init__(
            self,
            path: str,
            *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.path = path

    def execute(self, context):
        return self.__do_hash(self.path)

    def __do_hash(self, path: str) -> str:
        BUF_SIZE = 65536  # lets read stuff in 64kb chunks!

        md5 = hashlib.md5()
        sha1 = hashlib.sha1()

        with open(path, 'rb') as f:
            while True:
                data = f.read(BUF_SIZE)
                if not data:
                    break
                md5.update(data)
                sha1.update(data)

        return md5.hexdigest()


def check_if_is_already_processed(pull_hash_from: str,
                                  data_set: str,
                                  con_id="postgres_default",
                                  db_name="postgres",
                                  proceed_path="proceed",
                                  already_processed_path="already_processed",
                                  **context):

    file_hash = context['ti'].xcom_pull(task_ids=pull_hash_from)

    if not file_hash:
        raise AirflowException(f"Invalid hash {file_hash} for data_set {data_set}")

    fetch_sql = """SELECT id FROM "staging"."data_set" WHERE name = %s"""
    files_sql = """SELECT id FROM "staging"."data_set_file" WHERE data_set_id = %s and hash = %s"""
    db_hook = PostgresHook(postgres_conn_id=con_id, schema=db_name)

    data_sets = db_hook.get_records(fetch_sql, [data_set])

    if len(data_sets) != 1:
        raise AirflowException(f"The data_set {data_set} was not found, we found: {len(data_sets)} in the db, we need 1")

    data_set_id = data_sets[0][0]

    records = db_hook.get_records(files_sql, [data_set_id, file_hash])

    if len(records) == 0:
        return proceed_path

    if len(records) > 1:
        raise AirflowException(f"The hash {file_hash} for the ds {data_set} was processed {len(records)} times, failing")

    return already_processed_path


def upload_to_ftp(
        con_id: str,
        remote_path: str,
        local_path: str
):
    hook = FTPHook(con_id)

    hook.store_file(remote_path, local_path)
