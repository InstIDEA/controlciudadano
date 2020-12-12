import os
from datetime import timedelta, datetime

# The DAG object; we'll need this to instantiate a DAG
from airflow import DAG
# Operators; we need this to operate!
from airflow.operators.bash_operator import BashOperator
from airflow.operators.python_operator import PythonOperator

from _muni_operators import get_links, download_links, get_target_path
from ds_table_operations import upload_to_ftp, create_dir_in_ftp

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
        'data_folder': f'/tmp/muni/',
        'data_set': 'asu_muni',
        'url': 'https://www.asuncion.gov.py/'

    }
}
dag = DAG(
    'muni_main_page_downloader',
    default_args=default_args,
    description='ETL that downloads all links from www.asuncion.gov.py',
    start_date=datetime(2020, 12, 12),
    schedule_interval=timedelta(weeks=1),
)


def retrieve_links_and_download(target: str, **context):
    links = context['ti'].xcom_pull(task_ids="fetch_links")
    return download_links(links, target)


def upload_files_to_ftp(prefix: str, **context):
    downloaded = context['ti'].xcom_pull(task_ids="download_links")
    con_id = "ftp_data.controlciudadano.org.py"
    create_dir_in_ftp(con_id, os.path.dirname(prefix))
    for download in downloaded:
        target_path = get_target_path(download, prefix)
        upload_to_ftp(
            con_id,
            target_path,
            download
        )


with dag:
    target_folder_exp = "{{ params.data_folder }}"

    create_folder = BashOperator(
        task_id=f'create_folder',
        bash_command=f"""
            mkdir -pv "{target_folder_exp}"
            """,
        retries=10
    )

    fetch_links = PythonOperator(task_id='fetch_links',
                                 python_callable=get_links)

    download_links_op = PythonOperator(task_id='download_links',
                                       python_callable=retrieve_links_and_download,
                                       provide_context=True,
                                       op_kwargs={
                                           "target": target_folder_exp,
                                       })

    upload_file_to_ftp = PythonOperator(task_id='upload_files_to_ftp',
                                        python_callable=upload_files_to_ftp,
                                        provide_context=True,
                                        op_kwargs={
                                            "prefix": "/data/municipalidad/{{ ds }}",
                                        })

    fetch_links >> download_links_op >> upload_file_to_ftp

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
