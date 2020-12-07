from datetime import timedelta

# The DAG object; we'll need this to instantiate a DAG
from airflow import DAG
# Operators; we need this to operate!
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator, BranchPythonOperator
from airflow.utils.dates import days_ago

from batch_insert import ColumnMapping, batch_insert_file
from ds_table_operations import CalculateHash, upload_to_ftp, check_if_is_already_processed
from network_operators import download_file_if_changed

URL_BASE = "https://contrataciones.gov.py/datos/api/v3/doc/search"
URL_MONETARY = f"https://contrataciones.gov.py/datos/api/v3/doc/search/suppliers?details.sanctions.type=AMONESTACION&items_per_page=1000"
URL_INABILITY = f"https://contrataciones.gov.py/datos/api/v3/doc/search/suppliers?details.sanctions.type=INHABILITACION&items_per_page=1000"

# These args will get passed on to each operator
# You can override them on a per-task basis during operator initialization
default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
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
        'data_folder': '/tmp',
        'data_set': 'ocds_sanctioned_suppliers',
        'table_name': 'staging.dncp_sanctioned_suppliers'
    }
}
dag = DAG(
    'ocds_sanctioned_suppliers',
    default_args=default_args,
    description='ETL for the data of https://www.aquieneselegimos.org.py',
    start_date=days_ago(2),
    schedule_interval=timedelta(weeks=1),
)

with dag:
    start = DummyOperator(task_id='start')
    success = DummyOperator(task_id='success')

    for in_type in ['AMONESTACION', 'INHABILITACION']:

        url = URL_MONETARY
        if in_type == 'INHABILITACION':
            url = URL_INABILITY

        target_folder_exp = "{{ params.data_folder }}/{{ ds }}"
        target_file_exp = f"{target_folder_exp}/{in_type}.json"

        hash_exp = f"{{{{ task_instance.xcom_pull(task_ids='calc_hash_{in_type}') }}}}"

        ftp_target_filename_without_hash_exp = f"ocds_sanctioned_suppliers_{in_type}.json"
        ftp_target_filename_exp = f"{hash_exp}_{ftp_target_filename_without_hash_exp}"
        ftp_target_path = f"./data/{{{{ params.data_set }}}}/{ftp_target_filename_exp}"

        download_file = PythonOperator(task_id=f"download_file_if_changed_{in_type}",
                                       python_callable=download_file_if_changed,
                                       op_kwargs={
                                           "url": url,
                                           "target": target_file_exp
                                       })

        calc_hash = CalculateHash(
            task_id=f'calc_hash_{in_type}',
            path=target_file_exp
        )

        clean_db = PostgresOperator(task_id=f"clean_table_{in_type}",
                                    sql=f"DELETE FROM staging.dncp_sanctioned_suppliers WHERE type = '{in_type}'",
                                    database="db",
                                    autocommit=True
                                    )

        insert_into_ds = PostgresOperator(task_id=f"insert_into_ds_{in_type}",
                                          sql=f"""
                                      INSERT INTO staging.data_set_file 
                                      (file_name, data_set_id, loaded_date, file_date, original_url, local_suffix, hash)
                                      VALUES 
                                      (
                                        '{target_file_exp}',
                                        (SELECT id FROM staging.data_set WHERE name = '{{{{ params.data_set }}}}' LIMIT 1),
                                        '{{{{ ts }}}}',
                                        '{{{{ ds }}}}',
                                        '{url}',
                                        NULL,
                                        '{hash_exp}'
                                      )
                                      """,
                                          database="db",
                                          autocommit=True
                                          )

        check_if_is_already_up = BranchPythonOperator(
            task_id=f"branching_{in_type}",
            provide_context=True,
            python_callable=check_if_is_already_processed,
            op_kwargs={'pull_hash_from': f'calc_hash_{in_type}',
                       'data_set': '{{ params.data_set }}',
                       'proceed_path': f"proceed_to_insert_{in_type}",
                       'db_name': 'db',
                       'already_processed_path': "success",
                       }
        )

        upload_to_ftp_step = PythonOperator(task_id=f"upload_to_ftp_{in_type}",
                                            python_callable=upload_to_ftp,
                                            op_kwargs={
                                                'con_id': 'ftp_data.controlciudadano.org.py',
                                                'remote_path': ftp_target_path,
                                                'local_path': target_file_exp
                                            })

        batch_insert = PythonOperator(task_id=f'batch_insert_{in_type}',
                                      python_callable=batch_insert_file,
                                      op_kwargs={
                                          'file_path': target_file_exp,
                                          'table_name': '{{ params.table_name }}',
                                          'file_type': 'json',
                                          'db_name': 'db',
                                          'batch_size': 100,
                                          'columns': [
                                              ColumnMapping("name", "text", "supplier_name"),
                                              ColumnMapping("id", "text", "supplier_id"),
                                              ColumnMapping("identifier", "jsonb").dump_json(),
                                              ColumnMapping("contact_point", "jsonb", "contactPoint").dump_json(),
                                              ColumnMapping("details", "jsonb", "details").dump_json(),
                                              ColumnMapping("address", "jsonb", "details").dump_json(),
                                              ColumnMapping("date"),
                                              ColumnMapping("awarded_tenders", "integer", "cantidad_adjudicaciones"),
                                              ColumnMapping.constant_column("type", in_type)
                                          ]
                                      })

        proceed = DummyOperator(task_id=f"proceed_to_insert_{in_type}")

        proceed >> clean_db >> batch_insert
        proceed >> upload_to_ftp_step
        proceed >> insert_into_ds

        check_if_is_already_up >> proceed
        check_if_is_already_up >> success

        start >> download_file >> calc_hash >> check_if_is_already_up

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
