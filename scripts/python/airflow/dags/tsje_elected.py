from datetime import timedelta

from airflow import DAG

from airflow.utils.dates import days_ago
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.python_operator import PythonOperator

from tsje_elected import SQL_QUERY_CREATE_VIEW_NOT_NULL
from tsje_elected import SQL_QUERT_CREATE_VIEW_NULL

default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email': ['arturovolpe@gmail.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 5,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    dag_id='consolidata_data_on_tsje_elected',
    default_args=default_args,
    description='Consolidates other data on tsje_elected tables',
    start_date=days_ago(2),
    schedule_interval=timedelta(weeks=1),
)

start = DummyOperator(task_id='start', dag=dag)

primary_view = PythonOperator(
    task_id="create_view",
    python_callable=SQL_QUERY_CREATE_VIEW_NOT_NULL,
    dag=dag,
)

secondary_view = PythonOperator(
    task_id="create_missing_view",
    python_callable=SQL_QUERT_CREATE_VIEW_NULL,
    dag=dag,
)

start >> primary_view >> secondary_view

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
