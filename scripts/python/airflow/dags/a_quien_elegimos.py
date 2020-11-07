import os
from datetime import timedelta, date

# The DAG object; we'll need this to instantiate a DAG
from airflow import DAG
# Operators; we need this to operate!
from airflow.operators.bash_operator import BashOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago

from batch_insert import batch_insert_csv_file, ColumnMapping

date_tag = date.today().strftime('%Y%m%d')
data_folder = f'{os.environ["AIRFLOW_HOME"]}/data/{date_tag}'
table_name = "a_quien_elegimos"

# These args will get passed on to each operator
# You can override them on a per-task basis during operator initialization
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': days_ago(2),
    'email': ['arturovolpe@gmail.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
    # 'queue': 'bash_queue',
    # 'pool': 'backfill',
    # 'priority_weight': 10,
    # 'end_date': datetime(2016, 1, 1),
    # 'wait_for_downstream': False,
    # 'dag': dag,
    # 'sla': timedelta(hours=2),
    # 'execution_timeout': timedelta(seconds=300),
    # 'on_failure_callback': some_function,
    # 'on_success_callback': some_other_function,
    # 'on_retry_callback': another_function,
    # 'sla_miss_callback': yet_another_function,
    # 'trigger_rule': 'all_success'
}
dag = DAG(
    'a_quien_elegimos',
    default_args=default_args,
    description='ETL for the data of https://www.aquieneselegimos.org.py',
    schedule_interval=timedelta(weeks=1),
)

download_file = BashOperator(
    task_id='download_file',
    bash_command=f"""
    TARGET="{data_folder}/a_quien_elegimos.csv"
    mkdir -pv "{data_folder}"
    if ! [ -f "$TARGET" ]; then
        curl https://datos.aquieneselegimos.org.py/api/export/csv/person/ -o "$TARGET"
    fi
    """,
    retries=10,
    dag=dag,
)

clean_db = PostgresOperator(task_id='clean_table',
                            sql=f'''
                            DROP TABLE IF EXISTS staging.{table_name};
                            CREATE TABLE staging.{table_name}
                            (
                                id                 integer not null constraint {table_name}_pkey primary key,
                                name               text    not null,
                                lastname           text    not null,
                                alternate_name     text,
                                former_name        text,
                                identifier         text,
                                email_address      text,
                                gender             text,
                                date_of_birth      date,
                                date_of_death      text,
                                head_shot          text,
                                one_line_biography text,
                                biography          text,
                                national_identity  integer,
                                phone              text,
                                contact_detail     text,
                                external_links     text,
                                decendents         text,
                                fb                 text,
                                tw                 text,
                                insta              text,
                                estado_civil       integer,
                                city_of_residence  text,
                                status             integer,
                                timestamp_creacion date,
                                organization       integer,
                                valoracion         text,
                                id_cird            text,
                                vistos             integer
                            )
                            ''',
                            dag=dag)

batch_insert = PythonOperator(task_id='batch_insert',
                              python_callable=batch_insert_csv_file,
                              op_kwargs={'file_path': f'{data_folder}/a_quien_elegimos.csv',
                                         'table_name': table_name,
                                         'schema_name': 'staging',
                                         'batch_size': 100,
                                         'columns': [
                                             ColumnMapping('id', 'number'),
                                             ColumnMapping('name'),
                                             ColumnMapping('lastname'),
                                             ColumnMapping("alternate_name", "text"),
                                             ColumnMapping("former_name", "text"),
                                             ColumnMapping("identifier", "text"),
                                             ColumnMapping("email_address", "text"),
                                             ColumnMapping("gender", "text"),
                                             ColumnMapping("date_of_birth", "date"),
                                             ColumnMapping("date_of_death", "text"),
                                             ColumnMapping("head_shot", "text"),
                                             ColumnMapping("one_line_biography", "text"),
                                             ColumnMapping("biography", "text"),
                                             ColumnMapping("national_identity", "integer"),
                                             ColumnMapping("phone", "text"),
                                             ColumnMapping("contact_detail", "text"),
                                             ColumnMapping("external_links", "text"),
                                             ColumnMapping("decendents", "text"),
                                             ColumnMapping("fb", "text"),
                                             ColumnMapping("tw", "text"),
                                             ColumnMapping("insta", "text"),
                                             ColumnMapping("estado_civil", "integer"),
                                             ColumnMapping("city_of_residence", "text"),
                                             ColumnMapping("status", "integer"),
                                             ColumnMapping("timestamp_creacion", "date"),
                                             ColumnMapping("organization", "integer"),
                                             ColumnMapping("valoracion", "text"),
                                             ColumnMapping("id_cird", "text"),
                                             ColumnMapping("vistos", "integer")
                                         ]
                                         },
                              dag=dag)

download_file >> clean_db >> batch_insert
