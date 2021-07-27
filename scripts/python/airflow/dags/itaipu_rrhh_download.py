import os
from datetime import timedelta, datetime

# The DAG object; we'll need this to instantiate a DAG
from airflow import DAG
# Operators; we need this to operate!
from airflow.operators.bash_operator import BashOperator
from airflow.operators.python_operator import PythonOperator

from _muni_operators import get_target_path
from _policia_operators import _get_links
from ds_table_operations import upload_to_ftp, create_dir_in_ftp
# These args will get passed on to each operator
# You can override them on a per-task basis during operator initialization
from network_operators import download_links

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email': ['arturovolpe@gmail.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(seconds=5),
    'params': {
        'data_folder': f'/tmp/itaipu/',
        'url': 'https://www.itaipu.gov.py/es/recursos-humanos/datos-de-empleados-y-estructura-salarial'

    }
}
dag = DAG(
    'itaipu_rrhh_downloader',
    default_args=default_args,
    description='ETL that downloads reports from https://www.itaipu.gov.py/es/recursos-humanos/datos-de-empleados-y-estructura-salarial',
    start_date=datetime(2021, 2, 20),
    schedule_interval=timedelta(weeks=1),
)


def retrieve_links_and_download(target: str, **context):
    links = context['ti'].xcom_pull(task_ids="fetch_links")
    return download_links(links, target, verify=False)


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
            echo "AAAAAAAAAAAAA"
            mkdir -pv "{target_folder_exp}"
            """,
        retries=10
    )

    fetch_links = PythonOperator(task_id='fetch_links',
                                 python_callable=_get_links,
                                 op_kwargs={
                                     "base_link": "https://www.itaipu.gov.py/es/recursos-humanos/datos-de-empleados-y-estructura-salarial/",
                                     "css_selector": "#corpo p a",
                                     "verify": True,
                                 }, )

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
                                            "prefix": "/data/itaipu/rrhh/",
                                        })

    create_folder >> fetch_links >> download_links_op >> upload_file_to_ftp

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
