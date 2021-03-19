from datetime import timedelta
from json import dumps
from json import loads
from random import randint
from string import Template
from time import sleep
from typing import Dict

from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import DAG
from airflow.models import Variable
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago
from requests import post

dag_timer = int(Variable.get("CGR_PARSER_TIMER", 0))
dag_services = str(Variable.get("CGR_PARSER_SERVICES", "http://data.controlciudadanopy.org:8081/parser/send")).split(",")
dag_year_filter = int(Variable.get("CGR_PARSER_MIN_YEAR", 2015))
dag_sub_jobs_count = int(Variable.get("CGR_PARSER_SUB_JOBS_COUNT", 16))
dag_sub_jobs_batch_size = int(Variable.get("CGR_PARSER_PDF_SUB_JOBS_BATCH_SIZE", 10))
dag_remove_invalid_djbr = Variable.get("CGR_PARSER_REMOVE_INVALID", 'FALSE') in ['true', 'TRUE']

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email": ["arturovolpe@gmail.com"],
    "email_on_failure": False,
    "email_on_retry": False,
    "retry_delay": timedelta(hours=1)
}

# parser request template
parser_request = {
    "file": {
        "path": "$resource"
    }
}

dag = DAG(
    dag_id="contralory_declaration_data_extraction",
    default_args=default_args,
    description="CGR data extraction with concurrent calls to ms_djbr_parser API",
    start_date=days_ago(1),
    schedule_interval=timedelta(weeks=1),
)


def is_valid_data(data: Dict[str, any]) -> bool:
    """
    Check if the data returned by the parsed is valid
    :param data:  the returned data
    :return: True if is valid, False otherwise
    """
    if data is None:
        return False

    if 'resumen' not in data.keys():
        return False

    items = list(data['resumen'].values())

    if len(items) != 3:
        return False

    if sum(map(abs, items)) == 0:
        return False

    return True


def get_random_url() -> str:
    """
    Balance all available apis
    """
    return dag_services[randint(0, len(dag_services) - 1)]


def list_navigator(cursor: any, idx: int, year: int, batch_size: int):
    should_continue = True
    current_iter = 1
    max_iterations = int(Variable.get("CGR_PARSER_MAX_ITER", 100))  # to prevent a infinite loop

    while should_continue:
        cursor.execute("""
            SELECT 
                 drd.id as raw_id, 
                 ddf.file_name 
            FROM staging.djbr_downloaded_files ddf
            INNER JOIN staging.djbr_raw_data drd on ddf.raw_data_id = drd.id
            LEFT JOIN analysis.djbr_readable_data parsed ON parsed.raw_data_id = drd.id
            WHERE drd.periodo >= %s
              AND mod(drd.id, %s) = %s
              AND parsed IS NULL
            ORDER BY RANDOM()
            LIMIT %s
        """, [year, dag_sub_jobs_count, idx, batch_size])

        # fetchall to dictionary
        desc = cursor.description
        column_names = [col[0] for col in desc]
        to_yield = [dict(zip(column_names, row)) for row in cursor.fetchall()]
        yield to_yield

        current_iter = current_iter + 1
        should_continue = len(to_yield) != 0 and current_iter <= max_iterations


def parse(file_name: str):
    t = Template(dumps(parser_request))
    payload = t.substitute(resource=file_name)

    result = post(get_random_url(), data=payload)

    if result.text is not None:
        data = loads(result.text)
        if 'data' in data.keys():
            return data['data']

    return None


def do_work(idx: int, year: int, batch_size: int):
    db_hook = PostgresHook(postgres_conn_id="postgres_default", schema="db")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()

    insert_query = """
    INSERT INTO analysis.djbr_readable_data (
        raw_data_id,
        active,
        passive,
        net_worth,
        source,
        parsed
    ) VALUES (%s, %s, %s, %s, %s, %s)
    ON CONFLICT DO NOTHING;
    """

    delete_query = """DELETE FROM staging.djbr_downloaded_files WHERE raw_data_id = %s"""

    for rows in list_navigator(db_cursor, idx, year, batch_size):
        to_insert = []
        to_delete = []

        for row in rows:

            data = parse(row['file_name'])

            if is_valid_data(data):
                to_insert.append([row['raw_id'],
                                  data['resumen']['totalActivo'],
                                  data['resumen']['totalPasivo'],
                                  data['resumen']['patrimonioNeto'],
                                  "MS_DJBR_PARSER",
                                  dumps(data)])
            else:
                to_delete.append([row['raw_id']])

            if dag_timer > 0:
                sleep(dag_timer)

        if len(to_delete) > 0:
            print(f"Sending {len(to_delete)} to delete")
            db_cursor.executemany(delete_query, to_delete)
            db_conn.commit()

        if len(to_insert) > 0 and dag_remove_invalid_djbr:
            print(f"Sending {len(to_insert)} to insert")
            db_cursor.executemany(insert_query, to_insert)
            db_conn.commit()


with dag:
    launch = DummyOperator(task_id="start")
    done = DummyOperator(task_id="done")

    ensure_table_created = PostgresOperator(task_id='ensure_table_exists',
                                            sql="""
                                    CREATE TABLE IF NOT EXISTS analysis.djbr_readable_data (
                                        id bigserial primary key,
                                        raw_data_id bigint,
                                        active numeric(20,2),
                                        passive numeric(20,2),
                                        net_worth numeric(20,2),
                                        declaration_date timestamp,
                                        source text NULL,
                                        parsed jsonb,
                                        UNIQUE(raw_data_id),
                                        FOREIGN KEY(raw_data_id) REFERENCES staging.djbr_raw_data(id)
                                    );
                                    """)

    for digit in range(0, dag_sub_jobs_count):
        parser_number = PythonOperator(
            task_id=f"""parser_number_{digit}""",
            python_callable=do_work,
            op_kwargs={
                "idx": digit,
                "batch_size": dag_sub_jobs_batch_size,
                "year": dag_year_filter,
            },
        )

        ensure_table_created >> parser_number >> done

    launch >> ensure_table_created

if __name__ == "__main__":
    dag.clear(reset_dag_runs=True)
    dag.run()
