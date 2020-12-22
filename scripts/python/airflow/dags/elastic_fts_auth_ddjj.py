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
    'elastic_fts_auth_ddjj',
    default_args=default_args,
    description='ETL that creates the table for search authorities with ddjj and then indexes the table in a elastic',
    start_date=datetime(2020, 12, 21),
    schedule_interval=timedelta(weeks=1),
)

with dag:
    do_curl = BashOperator(
        task_id=f'call_webhook',
        bash_command=f"""
            curl {{ var.value.ELASTIC_IDX_AUTH_DDJJ }}
            """,
        retries=10
    )

    do_query = PostgresOperator(task_id='do_query',
                                sql="sql/elastic_index_fts_auth_ddjj.sql")

    do_query >> do_curl

if __name__ == '__main__':
    dag.clear(reset_dag_runs=True)
    dag.run()
