from datetime import timedelta
import time


import math
import requests
from re import findall as re_findall

from airflow import AirflowException
from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import DAG
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email": ["arturovolpe@gmail.com"],
    "email_on_failure": False,
    "email_on_retry": False,
    "retry_delay": timedelta(hours=1),
    "params": {
        "url": "https://portaldjbr.contraloria.gov.py/portal-djbr/api/consulta/declaraciones/paginadas",
    },
}

dag = DAG(
    dag_id="contralory_declaration_link_fetcher",
    default_args=default_args,
    description="Fetchs links from https://portaldjbr.contraloria.gov.py/ and stores it in a table",
    start_date=days_ago(2),
    schedule_interval=timedelta(weeks=1),
)


def keep_num_data(data: str):
    try:
        pattern = '[0-9]'
        re = re_findall(pattern, data)

        # retrieve all numbers
        return ''.join(re)
    except Exception as e:
        print(f"Invalid data returned '{data}'")
        raise AirflowException("Error trying to parse", e)


def is_valid_ci(cedula):
    if not isinstance(cedula, str):
        print("Invalid data type for CI validation")
        return False

    if not cedula.isnumeric():
        print("CI is not numeric or is null")
        return False

    if len(cedula) < 5:
        print(f"This value {cedula} is not valid for CI range")
        return False

    return True


def fetch_data(url: str, page_size: int, page: int, query: str, retries: int):
    payload = {'pagNum': page, 'pagSize': page_size, 'nombres': query, 'cedula': ''}
    try:
        r = requests.get(url, params=payload, verify=False)
        if r.status_code == 200:
            return r.json()

        if retries > 0:
            print(f"Error fetching data from ${url}, retrying, retries available: ${retries}")
            fetch_data(url, page_size, page, query, retries - 1)

        raise AirflowException(f"Can't fetch ${url} with params ${payload} after 3 retries.")
    except requests.exceptions.RequestException as ne:
        print(f"Error {ne} fetching {payload}, skipping")
        print("Sleeping 5 sec in case we hit a rate limit")
        time.sleep(5)





def list_navigator(base_query: str, url: str):
    """

    :param base_query: the base query, a letter for example
    :param url: the url to pass query params
    :return: yields a page, ends when the list is an empty array
    """
    page = 1
    page_size = 100  # the limit is 100
    should_continue = True

    while should_continue:

        data = fetch_data(url, page, page_size, base_query, 3)
        total_records = data["totalDatos"]
        records = data["lista"]

        estimated_pages = math.ceil(total_records / page_size)
        estimated_position = math.floor(page / estimated_pages * 100)

        print(f"Page {page} returned {len(records)}, total records {total_records}, estimated size: {estimated_pages}")
        print(f"Estimated progress {estimated_position}%")

        yield records
        should_continue = len(records) != 0
        page += 1


def get_upsert_query() -> str:
    return """
        INSERT INTO staging.djbr_raw_data (remote_id, id_cabecera_djb, nombres, cedula, fecha, nombre_archivo, path, fisico, periodo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT DO NOTHING;
    """


def to_upsert_values(data: dict) -> [any]:
    return [data["id"], data["idCabeceraDjb"], data["nombres"], data["cedula"], data["fecha"], data["nombreArchivo"],
            data["path"], data["fisico"], data["periodo"]]


def process_list(records: [dict]):
    to_insert = []

    for record in records:
        numdata = record["cedula"]
        if numdata is None or not is_valid_ci(keep_num_data(numdata)):
            print(f"Skip insertion of (CI={record['cedula']}, nombres={record['nombres']}, periodo={record['periodo']}) because CI is not valid")
            continue

        record["cedula"] = keep_num_data(numdata)
        to_insert.append(to_upsert_values(record))

    print(f"Sending {len(to_insert)} for upsert")


def fetch_list(letter: str, url: str, **kwargs):
    print(f"{letter} from {url}")

    db_hook = PostgresHook(postgres_conn_id="postgres_default", schema="db")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()

    sql = get_upsert_query()

    for records in list_navigator(letter, url):
        to_insert = process_list(records)
        db_cursor.executemany(sql, to_insert)
        db_conn.commit()


with dag:
    launch = DummyOperator(task_id="start")
    done = DummyOperator(task_id="done")

    clean_db = PostgresOperator(task_id='clean_table',
                                sql='''CREATE TABLE IF NOT EXISTS staging.djbr_raw_data
                                        (
                                            id              bigserial primary key,
                                            remote_id       bigint,
                                            id_cabecera_djb bigint,
                                            nombres         text,
                                            cedula          text,
                                            fecha           timestamp,
                                            nombre_archivo  text,
                                            path            text,
                                            fisico          boolean,
                                            periodo         int,
                                            UNIQUE(remote_id)
                                        )
                                        ''')

    for letter in ['a', 'e', 'i', 'o', 'u']:
        # Get list from webpage
        get_pdf_list = PythonOperator(
            task_id=f"""get_pdf_list_{letter}""",
            provide_context=True,
            python_callable=fetch_list,
            op_kwargs={
                "letter": letter,
                "url": "{{ params.url }}",
            },
        )

        clean_db >> get_pdf_list >> done

    launch >> clean_db

if __name__ == "__main__":
    records = fetch_data("https://portaldjbr.contraloria.gov.py/portal-djbr/api/consulta/declaraciones/paginadas", 100, 8253, 'o', 3)["lista"]
    print(records)
    print(process_list(records))
    # dag.clear(reset_dag_runs=True)
    # dag.run()
