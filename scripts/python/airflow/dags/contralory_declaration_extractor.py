from datetime import timedelta
from json import dumps
from json import loads
from random import randint
from string import Template
from time import sleep
from typing import Dict, Union

from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import DAG
from airflow.models import Variable
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago
from requests import post

dag_timer = int(Variable.get("CGR_PARSER_TIMER", 0))
DEF_API_URLS = "http://data.controlciudadanopy.org:8081/parser/send"
dag_services = str(Variable.get("CGR_PARSER_SERVICES", DEF_API_URLS)).split(",")
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


# https://data.controlciudadanopy.org/contraloria/declaraciones/492599_e2995154cf9ceda88e3b9556731a6f38.pdf
max_expected_values = {
    "resumen": {
        "totalActivo": 3017299467736,
        "totalPasivo": 2256141600,
        "patrimonioNeto": 3015043326136
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

    calc_active = data['activos']
    calc_passives = data['pasivos']
    calc_nw = data['patrimonioNeto']

    if 'resumen' not in data.keys():
        return False

    summary = data['resumen']

    if summary is None:
        return False

    items = list(summary.values())

    if len(items) != 3:
        return False

    # numeric(20, 2) overflow control
    overflow = [bool(len(str(value)) >= 19) for value in items]

    if True in overflow:
        return False

    # max expected values control
    if max_expected_values is not None:
        for item in data:
            if item in max_expected_values.keys():
                if hasattr(data[item], "keys") and hasattr(max_expected_values[item], "keys"):
                    for sub in data[item].keys():
                        if sub in max_expected_values[item]:
                            if data[item][sub] > max_expected_values[item][sub]:
                                return False					
                else:
                    if data[item] > max_expected_values[item]:
                        return False

    if sum(map(abs, items)) != 0:
        return True

    base_active = summary['totalActivo']
    base_passives = summary['totalPasivo']
    base_nw = summary['patrimonioNeto']

    return calc_active == base_active and calc_passives == base_passives and calc_nw == base_nw


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
                 JOIN staging.djbr_raw_data drd on ddf.raw_data_id = drd.id
            LEFT JOIN analysis.djbr_data parsed ON parsed.raw_data_id = drd.id
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
    payload = t.substitute(resource=f"https://data.controlciudadanopy.org/contraloria/declaraciones/{file_name}")

    result = post(get_random_url(), data=payload)

    if result.text is not None:
        data = loads(result.text)
        if 'data' in data.keys():
            return data['data']

    return None


def get_charge(data: Dict) -> Union[str, None]:
    if 'instituciones' in data and data['instituciones'] is not None and len(data['instituciones']) > 0:
        first = data['instituciones'][0]
        cargo = ''
        inst = ''
        if 'cargo' in first:
            cargo = first['cargo']
        if 'institucion' in first:
            inst = f"({first['institucion']})"
        return f"{cargo} {inst}".rstrip()

    return None


def do_work(idx: int, year: int, batch_size: int):
    db_hook = PostgresHook(postgres_conn_id="postgres_default", schema="db")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()

    insert_query = """
    INSERT INTO analysis.djbr_data (
        raw_data_id,
        active,
        passive,
        net_worth,
        declaration_date,
        monthly_income,
        anual_income,
        monthly_expenses,
        anual_expenses,
        charge,
        source,
        parsed
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT DO NOTHING;
    """

    delete_query = """DELETE FROM staging.djbr_downloaded_files WHERE raw_data_id = %s"""

    for rows in list_navigator(db_cursor, idx, year, batch_size):
        to_insert = []
        to_delete = []

        for row in rows:

            data = None
            try:
                data = parse(row['file_name'])

                if is_valid_data(data):
                    charge = get_charge(data)
                    to_insert.append([row['raw_id'],
                                      data['resumen']['totalActivo'],
                                      data['resumen']['totalPasivo'],
                                      data['resumen']['patrimonioNeto'],
                                      data['fecha'],
                                      data['ingresosMensual'],
                                      data['ingresosAnual'],
                                      data['egresosMensual'],
                                      data['egresosAnual'],
                                      charge,
                                      "MS_DJBR_PARSER",
                                      dumps(data)])
                else:
                    to_delete.append([row['raw_id']])

            except Exception as e:
                print(f"Error parsing {row['raw_id']}, error:")
                print(e)
                print('-----------------')
                if data is not None:
                    print(data)
                    print('-----------------')
                print('SKIPING')
                raise e

            if dag_timer > 0:
                sleep(dag_timer)

        try:
            if len(to_delete) > 0 and dag_remove_invalid_djbr:
                print(f"Sending {len(to_delete)} to delete")
                db_cursor.executemany(delete_query, to_delete)
                db_conn.commit()

            if len(to_insert) > 0:
                print(f"Sending {len(to_insert)} to insert")
                db_cursor.executemany(insert_query, to_insert)
                db_conn.commit()
        except Exception as e:
            print("Error inserting/deleting:")
            print(to_delete)
            print('-------')
            print(to_insert)
            print('-------')
            raise e



with dag:
    launch = DummyOperator(task_id="start")
    done = DummyOperator(task_id="done")

    ensure_table_created = PostgresOperator(task_id='ensure_table_exists',
                                            sql="""
                                    CREATE TABLE IF NOT EXISTS analysis.djbr_data (
                                        id bigserial primary key,
                                        raw_data_id bigint,
                                        charge text,
                                        active numeric(20,2),
                                        passive numeric(20,2),
                                        net_worth numeric(20,2),
                                        monthly_income numeric(20, 2),
                                        anual_income numeric(20, 2),
                                        monthly_expenses numeric(20, 2),
                                        anual_expenses numeric(20, 2),
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
