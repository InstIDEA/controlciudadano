from datetime import timedelta
from airflow.models import DAG
from airflow.models import Variable
from airflow.utils.dates import days_ago
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator
import os

from contralory.parse_pdf_name import extract_data_from_names
from contralory.name_to_database import push_to_postgre

try:
    target_dir = os.path.join(Variable.get("CGR_PDF_FOLDER"))
except KeyError:
    target_dir = os.path.join(os.sep, "tmp", "contralory", "raw")

try:
    error__dir = os.path.join(Variable.get("CGR_LOG_FOLDER"))
except KeyError:
    error__dir = os.path.join(os.sep, "tmp", "contralory", "errors")

try:
    manually_added = Variable.get('CGR_MANUALLY_ADDED_PDF')
except KeyError:
    manually_added = False

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email": ["arturovolpe@gmail.com"],
    "email_on_failure": False,
    "email_on_retry": False,
    "retry_delay": timedelta(hours=1),
    "params": {
        "target_dir": target_dir,
        "error__dir": error__dir,
        "manually_added": manually_added,
        "contraloria_py": "https://djbpublico.contraloria.gov.py/",
    },
}

dag = DAG(
    dag_id="contralory_manually_process_all_pdf_on_store",
    default_args=default_args,
    description="Process files from https://djbpublico.contraloria.gov.py/",
    start_date=days_ago(2),
    schedule_interval=None,
)

with dag:
    launch = DummyOperator(task_id="start")

    # Parse the names from the downloaded pdf
    parse_pdf_names = PythonOperator(
        task_id="extract_data_from_names",
        provide_context=True,
        python_callable=extract_data_from_names,
        op_kwargs={
            "error_folder": f"{{{{ params.error__dir }}}}",
            "sourceDir": f"{{{{ params.target_dir }}}}",
            "manual": f"{{{{ params.manually_added }}}}",
        },
    )

    # Push parsed information to postgresql
    push_to_server = PythonOperator(
        task_id="push_to_db",
        provide_context=True,
        python_callable=push_to_postgre,
    )

    launch >> parse_pdf_names >> push_to_server

if __name__ == "__main__":
    dag.clear(reset_dag_runs=True)
    dag.run()
