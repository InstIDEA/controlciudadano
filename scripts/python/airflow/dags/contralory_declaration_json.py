"""
Descarga el JSON de las declaraciones juradas online (fisico = false) de la API nueva de la Contraloría
y guarda los totales en analysis.djbr_data con source = 'CGR_DJBR_JSON'.

    https://portaldjbr.contraloria.gov.py/portal-djbr/api/consultas/djb-descargarjson/<remote_id_v2>

Solo existe JSON para las online; para las físicas la API responde 404
("Archivo en formato físico, no se puede generar el Json"). Las físicas siguen con PDF + parser
(contralory_declaration_download_pdfs y contralory_declaration_data_extraction).

Necesita remote_id_v2, que lo completa contralory_declaration_link_fetcher.

Qué declaraciones toma, en este orden:
 1. las que el parser rechazó (staging.djbr_invalid_files), casi todas por la regla del año;
 2. las que tienen PDF pero nunca se parsearon;
 3. el resto de las que no tienen datos (las nuevas).
Con CGR_JSON_REPROCESS_PARSED = true también toma las que ya procesó el parser (source = 'MS_DJBR_PARSER')
y las reemplaza con los datos del JSON.

Mapeo JSON -> analysis.djbr_data:
 * active / passive: totalActivo / totalPasivo; net_worth = activo - pasivo (el JSON no trae patrimonio)
 * monthly_income, anual_income, monthly_expenses, anual_expenses: suma de los importe de cada lista
 * charge: primer cargo de detalleFuncionarios (el principal si lo hay), "CARGO (INSTITUCION)" como el parser
 * declaration_date: fechaCorte (la misma fecha que leía el parser), en hora de Paraguay
 * parsed: el JSON completo (incluye todos los cargos y el detalle de bienes y deudas)
No se aplica la regla del año del parser.

Los errores se guardan en staging.djbr_json_errors (uno por intento) y se reintentan hasta
CGR_JSON_MAX_ATTEMPTS veces.

Variables de Airflow (todas opcionales):
 * CGR_JSON_SUB_JOBS_COUNT: tareas en paralelo, por defecto 4
 * CGR_JSON_BATCH_SIZE: declaraciones por tanda, por defecto 50
 * CGR_JSON_MAX_ITER: tandas por tarea en cada corrida, por defecto 200
 * CGR_JSON_SLEEP: segundos de pausa entre llamadas de cada tarea, por defecto 1
 * CGR_JSON_MAX_ATTEMPTS: intentos por declaración antes de dejarla, por defecto 3
 * CGR_JSON_REPROCESS_PARSED: "true" para reemplazar también lo que ya procesó el parser, por defecto "false"
"""
import json
import time
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation
from typing import Dict, List, Optional

import pytz
import requests
from airflow import AirflowException
from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import DAG, Variable
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago

from contralory_declaration_link_fetcher import CGR_API_BASE, RAW_DATA_SCHEMA_SQL

JSON_URL = CGR_API_BASE + "djb-descargarjson/"
SOURCE = "CGR_DJBR_JSON"
PARSER_SOURCE = "MS_DJBR_PARSER"
PY_TZ = pytz.timezone("America/Asuncion")

# numeric(20, 2) admite hasta 18 dígitos enteros
MAX_AMOUNT = Decimal(10) ** 18

# si fallan tantas llamadas seguidas por red, se corta la tarea (posible bloqueo de la Contraloría)
MAX_CONSECUTIVE_NETWORK_ERRORS = 10

dag_sub_jobs_count = int(Variable.get("CGR_JSON_SUB_JOBS_COUNT", 4))

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email": ["arturovolpe@gmail.com"],
    "email_on_failure": False,
    "email_on_retry": False,
    "retry_delay": timedelta(hours=1),
}

dag = DAG(
    dag_id="contralory_declaration_json",
    default_args=default_args,
    description="Downloads the JSON of the online declarations from " + JSON_URL + " into analysis.djbr_data",
    start_date=days_ago(1),
    schedule_interval=timedelta(weeks=1),
)

SCHEMA_SQL = RAW_DATA_SCHEMA_SQL + """
    CREATE TABLE IF NOT EXISTS analysis.djbr_data (
        id bigserial primary key,
        raw_data_id bigint,
        charge text,
        active numeric(20,2),
        passive numeric(20,2),
        net_worth numeric(20,2),
        monthly_income numeric(20, 2),
        anual_income numeric(20, 2),
        monthly_expenses numeric(20, 2),
        anual_expenses numeric(20, 2),
        declaration_date timestamp,
        source text NULL,
        parsed jsonb,
        UNIQUE(raw_data_id),
        FOREIGN KEY(raw_data_id) REFERENCES staging.djbr_raw_data(id)
    );

    -- cuándo se procesó la fila (parser o JSON); las filas anteriores a este cambio quedan en NULL
    ALTER TABLE analysis.djbr_data ADD COLUMN IF NOT EXISTS processed_at timestamp;
    ALTER TABLE analysis.djbr_data ALTER COLUMN processed_at SET DEFAULT now();

    CREATE TABLE IF NOT EXISTS staging.djbr_json_errors (
        id bigserial primary key,
        raw_data_id bigint references staging.djbr_raw_data(id),
        date timestamp default now(),
        http_status int,
        message text
    );
    CREATE INDEX IF NOT EXISTS djbr_json_errors_raw_data_id_idx ON staging.djbr_json_errors (raw_data_id);

    -- para ordenar rápido las pendientes (rechazadas y con PDF primero)
    CREATE INDEX IF NOT EXISTS djbr_invalid_files_raw_data_id_idx ON staging.djbr_invalid_files (raw_data_id);
    CREATE INDEX IF NOT EXISTS djbr_downloaded_files_raw_data_id_idx ON staging.djbr_downloaded_files (raw_data_id);
"""

PENDING_QUERY = """
    SELECT raw.id AS raw_id, raw.remote_id_v2
    FROM staging.djbr_raw_data raw
    LEFT JOIN analysis.djbr_data data ON data.raw_data_id = raw.id
    WHERE raw.fisico = false
      AND raw.remote_id_v2 IS NOT NULL
      AND mod(raw.id, %(mod_of)s) = %(idx)s
      AND (data.id IS NULL OR (%(reprocess)s AND data.source = %(parser_source)s))
      AND (SELECT count(*) FROM staging.djbr_json_errors e WHERE e.raw_data_id = raw.id) < %(max_attempts)s
    ORDER BY
      data.id IS NOT NULL,
      NOT EXISTS (SELECT 1 FROM staging.djbr_invalid_files i WHERE i.raw_data_id = raw.id),
      NOT EXISTS (SELECT 1 FROM staging.djbr_downloaded_files f WHERE f.raw_data_id = raw.id),
      raw.id
    LIMIT %(batch_size)s
"""

UPSERT_QUERY = """
    INSERT INTO analysis.djbr_data (
        raw_data_id, active, passive, net_worth, declaration_date,
        monthly_income, anual_income, monthly_expenses, anual_expenses,
        charge, source, parsed, processed_at
    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, now())
    ON CONFLICT (raw_data_id) DO UPDATE SET
        active = EXCLUDED.active,
        passive = EXCLUDED.passive,
        net_worth = EXCLUDED.net_worth,
        declaration_date = EXCLUDED.declaration_date,
        monthly_income = EXCLUDED.monthly_income,
        anual_income = EXCLUDED.anual_income,
        monthly_expenses = EXCLUDED.monthly_expenses,
        anual_expenses = EXCLUDED.anual_expenses,
        charge = EXCLUDED.charge,
        source = EXCLUDED.source,
        parsed = EXCLUDED.parsed,
        processed_at = EXCLUDED.processed_at;
"""

ERROR_QUERY = """INSERT INTO staging.djbr_json_errors (raw_data_id, http_status, message) VALUES (%s, %s, %s)"""


class JsonDataError(AirflowException):
    """El JSON llegó pero no se puede guardar (montos fuera de rango, formato inesperado)."""
    pass


def to_decimal(value) -> Decimal:
    if value is None or value == "":
        return Decimal(0)
    try:
        return Decimal(str(value))
    except InvalidOperation:
        raise JsonDataError(f"Invalid amount '{value}'")


def sum_importes(items: Optional[List[Dict]]) -> Decimal:
    return sum((to_decimal(i.get("importe")) for i in (items or [])), Decimal(0))


def get_charge(data: Dict) -> Optional[str]:
    cargos = data.get("detalleFuncionarios") or []
    if len(cargos) == 0:
        return None
    principal = [c for c in cargos if c.get("tipoInstitucion") == "PRINCIPAL"]
    first = (principal or cargos)[0]
    cargo = first.get("cargo") or ""
    inst = f"({first['institucionActual']})" if first.get("institucionActual") else ""
    return f"{cargo} {inst}".strip() or None


def utc_to_py_local(value: Optional[str]) -> Optional[datetime]:
    """Las fechas del JSON vienen en UTC ('2015-12-20 03:00:00' es la medianoche en Paraguay)."""
    if not value:
        return None
    utc = pytz.utc.localize(datetime.strptime(value[:19], "%Y-%m-%d %H:%M:%S"))
    return utc.astimezone(PY_TZ).replace(tzinfo=None)


def to_row(raw_id: int, data: Dict) -> list:
    active = to_decimal(data.get("totalActivo"))
    passive = to_decimal(data.get("totalPasivo"))
    amounts = {
        "active": active,
        "passive": passive,
        "net_worth": active - passive,
        "monthly_income": sum_importes(data.get("ingresosMensuales")),
        "anual_income": sum_importes(data.get("ingresosAnuales")),
        "monthly_expenses": sum_importes(data.get("egresosMensuales")),
        "anual_expenses": sum_importes(data.get("egresosAnuales")),
    }
    too_big = {k: str(v) for k, v in amounts.items() if abs(v) >= MAX_AMOUNT}
    if too_big:
        raise JsonDataError(f"Amounts out of range for numeric(20,2): {too_big}")

    return [raw_id,
            amounts["active"], amounts["passive"], amounts["net_worth"],
            utc_to_py_local(data.get("fechaCorte")),
            amounts["monthly_income"], amounts["anual_income"],
            amounts["monthly_expenses"], amounts["anual_expenses"],
            get_charge(data),
            SOURCE,
            json.dumps(data, ensure_ascii=False)]


def fetch_json(remote_id_v2: int) -> requests.Response:
    return requests.get(f"{JSON_URL}{remote_id_v2}", timeout=120)


def list_navigator(cursor, idx: int, batch_size: int, max_iterations: int, max_attempts: int, reprocess: bool):
    for current_iter in range(1, max_iterations + 1):
        cursor.execute(PENDING_QUERY, {
            "mod_of": dag_sub_jobs_count, "idx": idx, "reprocess": reprocess, "parser_source": PARSER_SOURCE,
            "max_attempts": max_attempts, "batch_size": batch_size,
        })
        column_names = [col[0] for col in cursor.description]
        rows = [dict(zip(column_names, row)) for row in cursor.fetchall()]
        print(f"Job {idx}: iter {current_iter}/{max_iterations}, {len(rows)} declarations")
        if len(rows) == 0:
            return
        yield rows


def do_work(idx: int):
    batch_size = int(Variable.get("CGR_JSON_BATCH_SIZE", 50))
    max_iterations = int(Variable.get("CGR_JSON_MAX_ITER", 200))
    sleep_seconds = float(Variable.get("CGR_JSON_SLEEP", 1))
    max_attempts = int(Variable.get("CGR_JSON_MAX_ATTEMPTS", 3))
    reprocess = str(Variable.get("CGR_JSON_REPROCESS_PARSED", "false")).lower() == "true"

    print(f"""
    Starting job idx={idx} of {dag_sub_jobs_count}, batch_size={batch_size}, max_iterations={max_iterations}
    sleep={sleep_seconds}s, max_attempts={max_attempts}, reprocess_parsed={reprocess}
    """)

    db_hook = PostgresHook(postgres_conn_id="postgres_default", schema="db")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()

    totals = {"ok": 0, "errors": 0}
    consecutive_network_errors = 0

    for rows in list_navigator(db_cursor, idx, batch_size, max_iterations, max_attempts, reprocess):
        to_upsert = []
        to_errors = []

        for row in rows:
            raw_id = row["raw_id"]
            try:
                r = fetch_json(row["remote_id_v2"])
                consecutive_network_errors = 0
                if r.status_code != 200:
                    to_errors.append([raw_id, r.status_code, r.text[:1000]])
                else:
                    to_upsert.append(to_row(raw_id, r.json()))
            except JsonDataError as e:
                to_errors.append([raw_id, 200, str(e)[:1000]])
            except ValueError as e:
                to_errors.append([raw_id, 200, f"Invalid JSON: {e}"[:1000]])
            except requests.exceptions.RequestException as e:
                consecutive_network_errors += 1
                to_errors.append([raw_id, None, f"Network error: {e}"[:1000]])
                print(f"{raw_id} - network error {e}, sleeping 30s")
                time.sleep(30)
                if consecutive_network_errors >= MAX_CONSECUTIVE_NETWORK_ERRORS:
                    db_cursor.executemany(ERROR_QUERY, to_errors)
                    db_conn.commit()
                    raise AirflowException(
                        f"{consecutive_network_errors} network errors in a row, stopping (possible block)")

            time.sleep(sleep_seconds)

        if to_upsert:
            db_cursor.executemany(UPSERT_QUERY, to_upsert)
        if to_errors:
            db_cursor.executemany(ERROR_QUERY, to_errors)
        db_conn.commit()

        totals["ok"] += len(to_upsert)
        totals["errors"] += len(to_errors)
        print(f"Job {idx}: batch saved {len(to_upsert)} ok, {len(to_errors)} errors. Totals {totals}")

    print(f"Job {idx} done. Totals {totals}")


with dag:
    launch = DummyOperator(task_id="start")
    done = DummyOperator(task_id="done")

    ensure_schema = PostgresOperator(task_id="ensure_schema", sql=SCHEMA_SQL)

    # se refresca aunque alguna tarea falle, para publicar lo que sí se cargó
    refresh_view = PostgresOperator(task_id="refresh_djbr_view",
                                    sql="REFRESH MATERIALIZED VIEW analysis.djbr;",
                                    trigger_rule="all_done")

    for digit in range(0, dag_sub_jobs_count):
        json_number = PythonOperator(
            task_id=f"json_number_{digit}",
            python_callable=do_work,
            op_kwargs={"idx": digit},
        )
        ensure_schema >> json_number >> refresh_view

    launch >> ensure_schema
    refresh_view >> done

if __name__ == "__main__":
    # prueba sin base de datos: python contralory_declaration_json.py <remote_id_v2>
    import sys

    response = fetch_json(int(sys.argv[1]))
    print(response.status_code)
    print(to_row(0, response.json()) if response.status_code == 200 else response.text)
