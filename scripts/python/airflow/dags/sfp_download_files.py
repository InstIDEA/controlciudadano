from datetime import timedelta

# The DAG object; we'll need this to instantiate a DAG
from airflow import DAG
# Operators; we need this to operate!
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator, BranchPythonOperator
from airflow.utils.dates import days_ago

from batch_insert import batch_insert_csv_file, ColumnMapping
from ds_table_operations import CalculateHash, check_if_is_already_processed, UnzipFile, upload_to_ftp
# These args will get passed on to each operator
# You can override them on a per-task basis during operator initialization
from network_operators import download_file_if_changed

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
        'data_folder': f'/tmp',
        'url': 'https://datos.sfp.gov.py/data',
        'data_set': 'sfp',

    }
}
dag = DAG(
    'sfp_download_employee_files',
    default_args=default_args,
    description='Downloads files from https://datos.sfp.gov.py/data/funcionarios/download',
    schedule_interval=timedelta(weeks=1),
)

months_to_download = 4

with dag:
    start = DummyOperator(task_id='start')
    success = DummyOperator(task_id='success')

    for i in range(months_to_download):
        identifier = months_to_download - i

        file_date_exp = f"{{{{ macros.ds_add(ds, {30 * identifier * -1}) }}}}"

        month_exp = f"{{{{ macros.ds_format(macros.ds_add(ds, {30 * identifier * -1}), '%Y-%m-%d', '%m') | int }}}}"
        year_exp = f"{{{{ macros.ds_format(macros.ds_add(ds, {30 * identifier * -1}), '%Y-%m-%d', '%Y') | int }}}}"

        zip_path_exp = f"{{{{ params.data_folder }}}}/sfp_employees_{year_exp}_{month_exp}.csv.zip"
        csv_path_exp = f"{{{{ params.data_folder }}}}/sfp_employees_{year_exp}_{month_exp}.csv"

        original_url_exp = f"{{{{ params.url }}}}/funcionarios_{year_exp}_{month_exp}.csv.zip"

        hash_exp = f"{{{{ task_instance.xcom_pull(task_ids='calc_hash_{identifier}') }}}}"
        ftp_target_filename_without_hash_exp = f"funcionarios_{year_exp}_{month_exp}.zip"
        ftp_target_filename_exp = f"{hash_exp}_{ftp_target_filename_without_hash_exp}"
        ftp_target_path = f"./data/{{{{ params.data_set }}}}/{ftp_target_filename_exp}"

        download_file = PythonOperator(task_id=f"download_file_if_changed_{identifier}",
                                       python_callable=download_file_if_changed,
                                       op_kwargs={
                                           "url": original_url_exp,
                                           "target": zip_path_exp
                                       })

        calc_hash = CalculateHash(
            task_id=f'calc_hash_{identifier}',
            path=zip_path_exp
        )

        check_if_is_already_up = BranchPythonOperator(
            task_id=f"branching_{identifier}",
            provide_context=True,
            python_callable=check_if_is_already_processed,
            op_kwargs={'pull_hash_from': f'calc_hash_{identifier}',
                       'data_set': '{{ params.data_set }}',
                       'proceed_path': f"proceed_to_insert_{identifier}",
                       'db_name': 'db',
                       'already_processed_path': "success",
                       }
        )

        upload_to_ftp_step = PythonOperator(task_id=f"upload_to_ftp_{identifier}",
                                            python_callable=upload_to_ftp,
                                            op_kwargs={
                                                'con_id': 'ftp_data.controlciudadano.org.py',
                                                'remote_path': ftp_target_path,
                                                'local_path': zip_path_exp
                                            })

        insert_into_ds = PostgresOperator(task_id=f"insert_into_ds_{identifier}",
                                          sql=f"""
                                      INSERT INTO staging.data_set_file 
                                      (file_name, data_set_id, loaded_date, file_date, original_url, local_suffix, hash)
                                      VALUES 
                                      (
                                        '{ftp_target_filename_without_hash_exp}',
                                        (SELECT id FROM staging.data_set WHERE name = '{{{{ params.data_set }}}}' LIMIT 1),
                                        '{{{{ ts }}}}',
                                        '{file_date_exp}',
                                        '{original_url_exp}',
                                        NULL,
                                        '{hash_exp}'
                                      )
                                      """,
                                          database="db",
                                          autocommit=True
                                          )

        clean_db = PostgresOperator(task_id=f"clean_table_{identifier}",
                                    sql=f"DELETE FROM staging.sfp WHERE mes = {month_exp} AND anho = {year_exp}",
                                    database="db",
                                    autocommit=True
                                    )

        batch_insert = PythonOperator(task_id=f'batch_insert_{identifier}',
                                      python_callable=batch_insert_csv_file,
                                      op_kwargs={
                                          'file_path': csv_path_exp,
                                          'table_name': 'staging.sfp',
                                          'db_name': 'db',
                                          'batch_size': 100,
                                          'file_encoding': 'iso-8859-1',
                                          'columns': [
                                              ColumnMapping('anho'),
                                              ColumnMapping('mes'),
                                              ColumnMapping('nivel'),
                                              ColumnMapping('descripcion_nivel'),
                                              ColumnMapping('entidad'),
                                              ColumnMapping('descripcion_entidad'),
                                              ColumnMapping('oee'),
                                              ColumnMapping('descripcion_oee'),
                                              ColumnMapping('documento'),
                                              ColumnMapping('nombres').fix_name(),
                                              ColumnMapping('apellidos').fix_name(),
                                              ColumnMapping('funcion'),
                                              ColumnMapping('estado'),
                                              ColumnMapping('carga_horaria'),
                                              ColumnMapping('anho_ingreso'),
                                              ColumnMapping('sexo'),
                                              ColumnMapping('discapacidad'),
                                              ColumnMapping('tipo_discapacidad'),
                                              ColumnMapping('fuente_financiamiento'),
                                              ColumnMapping('objeto_gasto'),
                                              ColumnMapping('concepto'),
                                              ColumnMapping('linea'),
                                              ColumnMapping('categoria'),
                                              ColumnMapping('cargo'),
                                              ColumnMapping('presupuestado'),
                                              ColumnMapping('devengado'),
                                              ColumnMapping('movimiento'),
                                              ColumnMapping('lugar'),
                                              ColumnMapping('fecha_nacimiento'),
                                              ColumnMapping('fec_ult_modif'),
                                              ColumnMapping('uri'),
                                              ColumnMapping('fecha_acto'),
                                              ColumnMapping('correo'),
                                              ColumnMapping('profesion'),
                                              ColumnMapping('motivo_movimiento')
                                          ]
                                      })

        unzip_file = UnzipFile(
            task_id=f"unzip_file_{identifier}",
            path=zip_path_exp,
            target=csv_path_exp,
            is_single_file=True
        )

        proceed = DummyOperator(task_id=f"proceed_to_insert_{identifier}")

        proceed >> unzip_file >> clean_db >> batch_insert
        proceed >> upload_to_ftp_step
        proceed >> insert_into_ds

        check_if_is_already_up >> proceed
        check_if_is_already_up >> success

        start >> download_file >> calc_hash >> check_if_is_already_up

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
