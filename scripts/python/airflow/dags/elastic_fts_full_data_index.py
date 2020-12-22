from datetime import timedelta, datetime

from airflow import DAG
from airflow.operators.bash_operator import BashOperator
from airflow.operators.postgres_operator import PostgresOperator


default_args = {
    'owner': 'airflow',
    'depends_on_past': False,
    'email': ['arturovolpe@gmail.com'],
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(seconds=5),
    'params': {
    }
}
dag = DAG(
    'elastic_fts_full_data_index',
    default_args=default_args,
    description='ETL that creates the table with all people data',
    start_date=datetime(2020, 12, 21),
    schedule_interval=timedelta(weeks=1),
)

with dag:
    do_curl = BashOperator(
        task_id=f'call_webhook',
        bash_command=f"""
            curl {{ var.value.ELASTIC_IDX_FULL_DATA_HOOK }}
            """,
        retries=10
    )

    do_query = PostgresOperator(task_id='do_query',
                                sql="sql/elastic_index_full_data.sql")

    do_query >> do_curl

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
