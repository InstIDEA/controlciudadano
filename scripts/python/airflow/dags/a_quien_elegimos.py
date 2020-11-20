import os
from datetime import timedelta

# The DAG object; we'll need this to instantiate a DAG
from airflow import DAG
# Operators; we need this to operate!
from airflow.operators.bash_operator import BashOperator
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator, BranchPythonOperator
from airflow.utils.dates import days_ago

from batch_insert import batch_insert_csv_file, ColumnMapping
from ds_table_operations import CalculateHash, check_if_is_already_processed, upload_to_ftp

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
    'retry_delay': timedelta(seconds=5),
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
    # 'trigger_rule': 'all_success',
    'params': {
        'data_folder': f'/tmp/',
        'table_name': 'staging.a_quien_elegimos',
        'file_name': 'a_quien_elegimos.csv',
        'data_set': 'a_quien_elegimos',
        'url': 'https://datos.aquieneselegimos.org.py/api/export/csv/person/'

    }
}
dag = DAG(
    'a_quien_elegimos',
    default_args=default_args,
    description='ETL for the data of https://www.aquieneselegimos.org.py',
    schedule_interval=timedelta(weeks=1),
)

with dag:
    download_file = BashOperator(
        task_id='download_file',
        bash_command="""
        TARGET="{{ params.data_folder }}/{{ ds }}/{{ params.file_name }}"
        mkdir -pv "{{ params.data_folder }}/{{ ds }}"
        if ! [ -f "$TARGET" ]; then
            curl {{ params.url }} -o "$TARGET"
        fi
        """,
        retries=10
    )

    calc_hash = CalculateHash(
        task_id='calc_hash',
        path="{{ params.data_folder }}/{{ ds }}/{{ params.file_name }}"
    )

    check_if_is_already_up = BranchPythonOperator(
        task_id='branching',
        provide_context=True,
        python_callable=check_if_is_already_processed,
        op_kwargs={'pull_hash_from': 'calc_hash',
                   'data_set': '{{ params.data_set }}',
                   'proceed_path': "proceed_to_insert",
                   'db_name': 'db',
                   'already_processed_path': "already_processed",
                   }
    )

    clean_db = PostgresOperator(task_id='clean_table',
                                sql=''' DROP TABLE IF EXISTS {{ params.table_name }};
                                        CREATE TABLE {{ params.table_name }}
                                        (
                                        id                 integer not null constraint a_quien_elegimos_pkey primary key,
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
                                        estado_civil       text,
                                        city_of_residence  text,
                                        status             text,
                                        timestamp_creacion date,
                                        organization       text,
                                        valoracion         text,
                                        id_cird            text,
                                        vistos             integer
                                        )
                                        ''')

    batch_insert = PythonOperator(task_id='batch_insert',
                                  python_callable=batch_insert_csv_file,
                                  op_kwargs={'file_path': '{{ params.data_folder }}/{{ ds }}/{{ params.file_name }}',
                                             'table_name': '{{ params.table_name }}',
                                             'db_name': 'db',
                                             'batch_size': 100,
                                             'columns': [
                                                 ColumnMapping('id', 'number'),
                                                 ColumnMapping('name'),
                                                 ColumnMapping('lastname'),
                                                 ColumnMapping("alternate_name", "text"),
                                                 ColumnMapping("former_name", "text"),
                                                 ColumnMapping("identifier", "text").map("NULL", None).empty_to_none().remove_dots(),
                                                 ColumnMapping("email_address", "text").map("NULL", None).empty_to_none(),
                                                 ColumnMapping("gender", "text"),
                                                 ColumnMapping("date_of_birth", "date").map('0001-01-01', None).empty_to_none(),
                                                 ColumnMapping("date_of_death", "text"),
                                                 ColumnMapping("head_shot", "text"),
                                                 ColumnMapping("one_line_biography", "text"),
                                                 ColumnMapping("biography", "text"),
                                                 ColumnMapping("national_identity", "integer"),
                                                 ColumnMapping("phone", "text"),
                                                 ColumnMapping("contact_detail", "text").map("NULL", None).empty_to_none(),
                                                 ColumnMapping("external_links", "text"),
                                                 ColumnMapping("decendents", "text"),
                                                 ColumnMapping("fb", "text").map("NULL", None).empty_to_none(),
                                                 ColumnMapping("tw", "text").map("NULL", None).empty_to_none(),
                                                 ColumnMapping("insta", "text").map("NULL", None).empty_to_none(),
                                                 ColumnMapping("estado_civil", "text"),
                                                 ColumnMapping("city_of_residence", "text"),
                                                 ColumnMapping("status", "text"),
                                                 ColumnMapping("timestamp_creacion", "date"),
                                                 ColumnMapping("organization", "text"),
                                                 ColumnMapping("valoracion", "text"),
                                                 ColumnMapping("id_cird", "text"),
                                                 ColumnMapping("vistos", "integer")
                                             ]
                                             })

    proceed = DummyOperator(task_id='proceed_to_insert')
    already_processed = DummyOperator(task_id='already_processed')

    insert_into_ds = PostgresOperator(task_id="insert_into_ds",
                                      sql="""
                                      INSERT INTO staging.data_set_file 
                                      (file_name, data_set_id, loaded_date, file_date, original_url, local_suffix, hash)
                                      VALUES 
                                      (
                                        '{{ params.file_name }}',
                                        (SELECT id FROM staging.data_set WHERE name = '{{ params.data_set }}' LIMIT 1),
                                        '{{ ts }}',
                                        '{{ ds }}',
                                        '{{ params.url }}',
                                        NULL,
                                        '{{ task_instance.xcom_pull(task_ids="calc_hash") }}'
                                      )
                                      """,
                                      database="db",
                                      autocommit=True
                                      )

    upload_to_ftp = PythonOperator(task_id="upload_to_ftp",
                                   python_callable=upload_to_ftp,
                                   op_kwargs={
                                       'con_id': 'ftp_data.controlciudadano.org.py',
                                       'remote_path': "./data/{{ params.data_set }}/{{ task_instance.xcom_pull(task_ids='calc_hash') }}_{{ params.file_name }}",
                                       'local_path': "{{ params.data_folder }}/{{ ds }}/{{ params.file_name }}"
                                   })

    proceed >> clean_db >> batch_insert
    proceed >> upload_to_ftp
    proceed >> insert_into_ds

    check_if_is_already_up >> proceed
    check_if_is_already_up >> already_processed

    download_file >> calc_hash >> check_if_is_already_up

if __name__ == "__main__":
    dag.cli()
