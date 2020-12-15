from airflow.hooks.postgres_hook import PostgresHook
from datetime import datetime as dt

SQL_QUERY_GEN_ROWS = str(
    " ".join(
        [
            i
            for i in (
                "INSERT INTO analysis.declarations (document, name, year, link, \
                    version, origin, download_date) \
    VALUES ( %s, %s, %s, %s, %s, %s, %s) \
    ON CONFLICT ON CONSTRAINT uq_declarations_link \
    DO UPDATE SET \
        document = %s, name = %s, year = %s, version = %s;"
            ).split(" ")
            if i
        ]
    )
)


def push_to_postgre(ti, **kwargs) -> None:
    db_hook = PostgresHook(postgres_conn_id="postgres_default")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()
    batch = list()
    querys = ti.xcom_pull(task_ids="extract_data_from_names")
    for query in querys:
        # Prepare data in the same order as sql template
        batch.append(
            (
                query["document"],
                query["name"],
                query["year"],
                "https://data.controlciudadanopy.org/contraloria/\
                declaraciones/"
                + query["file_name"],
                query["version"],
                "https://djbpublico.contraloria.gov.py/index.php/\
                component/search/?searchword="
                + query["document"],
                dt.now(),
                query["document"],
                query["name"],
                query["year"],
                query["version"],
            )
        )
    db_cursor.executemany(SQL_QUERY_GEN_ROWS, batch)
    db_conn.commit()
    print(f'Inserted {str(len(querys))} entries')
