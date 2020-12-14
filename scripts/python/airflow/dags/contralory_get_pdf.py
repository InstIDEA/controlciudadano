from datetime import timedelta
from airflow.models import DAG
from airflow.models import Variable
from airflow.utils.dates import days_ago
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
import os

from contralory.contralory_page import contraloria_get_urls, contraloria_download_pdfs
from contralory.parse_pdf_name import extract_data_from_names
from contralory.name_to_database import push_to_postgre
from contralory import if_all_done

try:
    target_dir = os.path.join(Variable.get('CGR_PDF_FOLDER'))
except KeyError:
    target_dir = os.path.join(os.sep, 'tmp', 'contralory', 'raw')

try:
    error__dir = os.path.join(Variable.get('CGR_PDF_FOLDER'))
except KeyError:
    error__dir = os.path.join(os.sep, 'tmp', 'contralory', 'errors')


default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'start_date': days_ago(2),
    'email': ['arturovolpe@gmail.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retry_delay': timedelta(hours=1),
    'params': {
        'target_dir': target_dir,
        'error__dir': error__dir,
        'contraloria_py': 'https://djbpublico.contraloria.gov.py/',},
}

dag = DAG(
    dag_id='contralory_process_pdf', default_args=default_args,
    description='Downloads and process files from https://djbpublico.contraloria.gov.py/',
    schedule_interval=timedelta(weeks=1)
)

with dag:
    lauch = DummyOperator(task_id='start')

    # Get list from webpage
    get_pdf_list = PythonOperator(
        task_id='get_directory_listing_from_contralory_page',
        provide_context=True,
        python_callable=contraloria_get_urls,
        op_kwargs={
            'contraloria_url': f"{{{{ params.contraloria_py }}}}",
        },
    )

    # Download the pdfs
    get_pdfs = PythonOperator(
        task_id="download_new_PDFs_from_list",
        provide_context=True,
        python_callable=contraloria_download_pdfs,
        op_kwargs={
            'targetDir':    f"{{{{ params.target_dir }}}}",
            'error_folder': f"{{{{ params.error__dir }}}}",
            },
    )

    # Parse the names from the downloaded pdf
    parse_pdf_names = PythonOperator(
        task_id="extract_data_from_names",
        provide_context=True,
        python_callable=extract_data_from_names,
        op_kwargs={
            'error_folder': f"{{{{ params.error__dir }}}}",
        }
    )

    # Push parsed information to postgresql
    push_to_server = PythonOperator(
        task_id="push_to_db",
        provide_context=True,
        python_callable=push_to_postgre,
    )

    all_done = PythonOperator(
        task_id="all_done",
        provide_context=True,
        python_callable=if_all_done,
    )

    lauch >> get_pdf_list >> get_pdfs >> parse_pdf_names >> push_to_server >> all_done

if __name__=='__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
