from datetime import datetime, timedelta
from json import dumps
from json import loads
from random import randint
from string import Template
from time import sleep
from typing import Dict, Union, Optional

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

# To ignore declarations before this date. Before this year, all declarations were handwritten
dag_year_filter = int(Variable.get("CGR_PARSER_MIN_YEAR", 2015))

# Number of parallel jobs
dag_sub_jobs_count = int(Variable.get("CGR_PARSER_SUB_JOBS_COUNT", 16))

# Batch size of each job, the number of rows that we retrieve per iteration
dag_sub_jobs_batch_size = int(Variable.get("CGR_PARSER_PDF_SUB_JOBS_BATCH_SIZE", 10))

# Max iterations of each job, to prevent the case when we don't remove a declaration and the system keeps retrying
max_iterations = int(Variable.get("CGR_PARSER_MAX_ITER", 100))

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


def is_valid_data(year: int, data: Dict[str, any], row: Dict[str, any]) -> Optional[str]:
    """
    Check if the data returned by the parsed is valid
    :param year: minimum year for the parsed declaration
    :param data:  the returned data
    :param row: current row data
    :return: None if is valid, a msg otherwise
    """

    raw_id = row['raw_id']  # for debugging

    if data is None:
        return f"{raw_id} - Returning false because data is null"

    periodo = datetime.strptime(data['fecha'].split('T')[0], '%Y-%m-%d').year
    if periodo != row['raw_periodo']:
        return f"{raw_id} - Mismatch between parsed year {periodo} and fetched year {row['raw_periodo']}"

    if periodo < year:
        return f"{raw_id} - The parsed year {periodo} is less than the required minimum year {year}"

    calc_active = data['activos']
    calc_passives = data['pasivos']
    calc_nw = data['patrimonioNeto']

    if 'resumen' not in data.keys():
        return f"{raw_id} - Returning false because resumen is not present"

    summary = data['resumen']

    if summary is None:
        return f"{raw_id} - Returning false because resumen is not present"

    items = list(summary.values())

    if len(items) != 3:
        return f"{raw_id} - Returning false because resumen doesn't have 3 keys"

    # numeric(20, 2) overflow control
    overflow = [bool(len(str(value)) >= 19) for value in items]

    if True in overflow:
        return f"{raw_id} - Returning false because al least one value has more that 19 digits {items}"

    base_active = summary['totalActivo']
    base_passives = summary['totalPasivo']
    base_nw = summary['patrimonioNeto']

    to_ret = calc_active == base_active and calc_passives == base_passives and calc_nw == base_nw

    if not to_ret:
        print(f"{raw_id} - {calc_active} == { base_active } and {calc_passives} == {base_passives} and {calc_nw} == {base_nw}")
        print(f"{raw_id} - Returning true. The calculations were wrong, but we are not confident in our parser")
        return None

    print(f"{raw_id} contains valid data")
    return None


def get_random_url() -> str:
    """
    Balance all available apis
    """
    return dag_services[randint(0, len(dag_services) - 1)]


def list_navigator(cursor: any, idx: int, year: int, batch_size: int):
    should_continue = True
    current_iter = 1

    while should_continue:
        cursor.execute("""
            SELECT 
                 drd.id as raw_id, 
                 ddf.file_name,
                 drd.periodo as raw_periodo
            FROM staging.djbr_downloaded_files ddf
                 JOIN staging.djbr_raw_data drd on ddf.raw_data_id = drd.id
            LEFT JOIN analysis.djbr_data parsed ON parsed.raw_data_id = drd.id
            LEFT JOIN staging.djbr_invalid_files div ON div.raw_data_id = drd.id
            WHERE drd.periodo BETWEEN %s AND date_part('year', current_date)
              AND mod(drd.id, %s) = %s
              AND parsed IS NULL
              AND div IS NULL
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
    payload = t.substitute(resource=f"{file_name}")

    print(payload)
    result = post(get_random_url(), data=payload)
    print(result.json())

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

    print(f"""
    Staring job with idx={idx}, base_year={year}, batch_size={batch_size}
    Max iterations: {max_iterations}
    Available URLS: {dag_services}
    """)

    parsed_rows_query = """
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

    invalid_rows_query = """INSERT INTO staging.djbr_invalid_files(raw_data_id, error) VALUES ( %s, %s )"""

    for rows in list_navigator(db_cursor, idx, year, batch_size):
        to_valid = []
        to_invalid = []

        for row in rows:

            data = None
            raw_id = row['raw_id']
            try:
                print(f"{raw_id} - Parsing {row}")
                data = parse(row['file_name'])
                is_valid = is_valid_data(year, data, row)

                if is_valid is None:
                    charge = get_charge(data)
                    to_valid.append([row['raw_id'],
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
                    print(f"{raw_id} - Marking as no valid")
                    print(data)
                    print('----------------')
                    to_invalid.append([row['raw_id'], is_valid])

            except Exception as e:
                print(f"{raw_id} - Error parsing, error:")
                print(e)
                print('-----------------')
                if data is not None:
                    print(data)
                    print('-----------------')
                print(f"{raw_id} - SKIPPING")
                raise e

            if dag_timer > 0:
                sleep(dag_timer)

        try:
            if len(to_invalid) > 0:
                print(f"Sending {len(to_invalid)} to invalid")
                db_cursor.executemany(invalid_rows_query, to_invalid)
                db_conn.commit()

            if len(to_valid) > 0:
                print(f"Sending {len(to_valid)} to valid")
                db_cursor.executemany(parsed_rows_query, to_valid)
                db_conn.commit()
        except Exception as e:
            print("Error inserting/deleting:")
            print(to_invalid)
            print('-------')
            print(to_valid)
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
                                    
                                    CREATE TABLE IF NOT EXISTS staging.djbr_invalid_files (
                                        id bigserial primary key ,
                                        raw_data_id bigint references staging.djbr_raw_data(id),
                                        date timestamp default now(),
                                        error text
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
    data = parse('1851558_adb0baab6e901d500cc16584ad056fcf.pdf')
    print(data)
    print(is_valid_data(2015, data, {'raw_id': 9331537, 'raw_periodo': 2015}))
    # dag.clear(reset_dag_runs=True)
    # dag.run()
