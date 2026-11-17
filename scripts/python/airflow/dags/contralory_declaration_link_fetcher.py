"""
Trae el listado de declaraciones juradas (DJBR) de la API nueva de la Contraloría y lo guarda en
staging.djbr_raw_data.

API nueva (la vieja /api/consulta/declaraciones/paginadas responde 404):
    https://portaldjbr.contraloria.gov.py/portal-djbr/api/consultas/declaraciones-djb
    ?inicio=<offset>&cantidad=<máx 50>&orderBy=<posición de columna>&orderDir=desc&filtros={}

Cómo se guarda cada declaración:
 * Físicas (escaneadas, fisico = true): el id de la API nueva es el mismo que el de la vieja,
   se guarda en remote_id y se deduplica por remote_id (como antes).
 * Online (fisico = false): la API nueva les cambió el id, pero idCabeceraDjb se mantuvo.
   Se deduplica por id_cabecera_djb y el id nuevo se guarda en remote_id_v2 (el remote_id viejo
   da 404 en la API nueva). En las online que ya estaban, solo se completa remote_id_v2.
   Las online nuevas quedan con remote_id NULL.

Delta:
 * El listado se ordena por `fecha` descendente. `fecha` es la fecha de creación de la declaración
   (online) o de carga del escaneo (físicas), en hora de Paraguay. En la base se guarda en UTC.
 * Se recorre desde la más nueva hasta max(fecha) de la base menos CGR_LIST_MARGIN_DAYS días,
   porque una declaración creada antes y confirmada después aparece en el listado con su fecha de creación.
 * Con CGR_LIST_FULL_SCAN = true se recorre el listado completo (sirve para completar remote_id_v2
   de todas las online ya cargadas y atrapar lo que se haya escapado del delta).

Variables de Airflow (todas opcionales):
 * CGR_LIST_PAGE_SIZE: registros por página (máx. 50), por defecto 50
 * CGR_LIST_SLEEP: segundos de pausa entre páginas, por defecto 1
 * CGR_LIST_MARGIN_DAYS: días hacia atrás desde la última fecha cargada, por defecto 60
 * CGR_LIST_FULL_SCAN: "true" para recorrer todo el listado, por defecto "false"
 * CGR_LIST_MAX_PAGES: tope de páginas por corrida (0 = sin tope), por defecto 0. Útil para probar.
"""
import time
from datetime import datetime, timedelta
from re import findall as re_findall
from typing import List, Optional, Tuple

import pytz
import requests
from airflow import AirflowException
from airflow.hooks.postgres_hook import PostgresHook
from airflow.models import DAG, Variable
from airflow.operators.dummy_operator import DummyOperator
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
from airflow.utils.dates import days_ago

CGR_API_BASE = "https://portaldjbr.contraloria.gov.py/portal-djbr/api/consultas/"
LIST_URL = CGR_API_BASE + "declaraciones-djb"
PY_TZ = pytz.timezone("America/Asuncion")
API_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Esquema de staging.djbr_raw_data. Todo es idempotente: se puede correr en cada ejecución.
RAW_DATA_SCHEMA_SQL = """
    CREATE TABLE IF NOT EXISTS staging.djbr_raw_data
    (
        id              bigserial primary key,
        remote_id       bigint,
        id_cabecera_djb bigint,
        nombres         text,
        cedula          text,
        fecha           timestamp,
        nombre_archivo  text,
        path            text,
        fisico          boolean,
        periodo         int,
        UNIQUE(remote_id)
    );

    -- id de la declaración en la API nueva (solo online; en las físicas el id no cambió y está en remote_id)
    ALTER TABLE staging.djbr_raw_data ADD COLUMN IF NOT EXISTS remote_id_v2 bigint;

    -- cuándo entró la fila a nuestra base; las filas anteriores a este cambio quedan en NULL
    ALTER TABLE staging.djbr_raw_data ADD COLUMN IF NOT EXISTS fetched_at timestamp;
    ALTER TABLE staging.djbr_raw_data ALTER COLUMN fetched_at SET DEFAULT now();

    CREATE UNIQUE INDEX IF NOT EXISTS djbr_raw_data_id_cabecera_djb_uidx
        ON staging.djbr_raw_data (id_cabecera_djb) WHERE id_cabecera_djb IS NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS djbr_raw_data_remote_id_v2_uidx
        ON staging.djbr_raw_data (remote_id_v2) WHERE remote_id_v2 IS NOT NULL;
"""

default_args = {
    "owner": "airflow",
    "depends_on_past": False,
    "email": ["arturovolpe@gmail.com"],
    "email_on_failure": False,
    "email_on_retry": False,
    "retry_delay": timedelta(hours=1),
}

dag = DAG(
    dag_id="contralory_declaration_link_fetcher",
    default_args=default_args,
    description="Fetchs the declarations list from " + LIST_URL + " and stores it in staging.djbr_raw_data",
    start_date=days_ago(2),
    schedule_interval=timedelta(weeks=1),
)


def keep_num_data(data: str):
    try:
        pattern = '[0-9]'
        re = re_findall(pattern, data)

        # retrieve all numbers
        return ''.join(re)
    except Exception as e:
        print(f"Invalid data returned '{data}'")
        raise AirflowException("Error trying to parse", e)


def is_valid_ci(cedula):
    if not isinstance(cedula, str):
        print("Invalid data type for CI validation")
        return False

    if not cedula.isnumeric():
        print("CI is not numeric or is null")
        return False

    if len(cedula) < 5:
        print(f"This value {cedula} is not valid for CI range")
        return False

    return True


def fetch_page(inicio: int, cantidad: int, order_by: int, retries: int = 3) -> dict:
    params = {"inicio": inicio, "cantidad": cantidad, "orderBy": order_by, "orderDir": "desc", "filtros": "{}"}
    last_error = None
    for attempt in range(retries + 1):
        try:
            r = requests.get(LIST_URL, params=params, timeout=120)
            if r.status_code == 200:
                return r.json()
            last_error = f"HTTP {r.status_code}: {r.text[:300]}"
        except requests.exceptions.RequestException as e:
            last_error = str(e)
        wait = 30 * (attempt + 1)
        print(f"Error fetching {params}: {last_error}. Retry {attempt + 1}/{retries} in {wait}s")
        time.sleep(wait)
    raise AirflowException(f"Can't fetch {LIST_URL} with params {params}: {last_error}")


def get_order_by(column: str) -> int:
    """
    El orderBy de la API es la posición de la columna en su SELECT (un ORDER BY n de Postgres: con
    orderBy=10 responde "ORDER BY position 10 is not in select list"). El listado devuelve los campos
    en ese mismo orden, así que la posición se calcula de la respuesta en vez de dejar un número fijo.
    """
    data = fetch_page(0, 1, 1)
    keys = list(data["lista"][0].keys())
    for needed in (column, "id", "idCabeceraDjb", "fisico"):
        if needed not in keys:
            raise AirflowException(f"El listado ya no trae la columna '{needed}': {keys}")
    position = keys.index(column) + 1
    print(f"Columns of the list: {keys}. orderBy for '{column}' = {position}")
    return position


def check_sorted_by_fecha(records: List[dict], previous_last: Optional[str]):
    """
    Si la API cambia y el orden deja de ser por fecha desc, el DAG falla en vez de cortar mal el delta.
    Las fechas vienen como 'YYYY-MM-DD HH:MM:SS', que ordena igual como texto que como fecha.
    """
    fechas = [r["fecha"] for r in records]
    if previous_last is not None:
        fechas = [previous_last] + fechas
    if fechas != sorted(fechas, reverse=True):
        raise AirflowException(f"El listado no vino ordenado por fecha desc: {fechas[:10]}")


def local_to_utc(fecha: str) -> datetime:
    """La API da hora de Paraguay; en djbr_raw_data.fecha se guarda en UTC (como lo cargado antes)."""
    local = PY_TZ.localize(datetime.strptime(fecha, API_DATE_FORMAT))
    return local.astimezone(pytz.utc).replace(tzinfo=None)


ONLINE_UPSERT = """
    INSERT INTO staging.djbr_raw_data
        (remote_id, remote_id_v2, id_cabecera_djb, nombres, cedula, fecha, nombre_archivo, path, fisico, periodo)
    VALUES (NULL, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (id_cabecera_djb) WHERE id_cabecera_djb IS NOT NULL
    DO UPDATE SET remote_id_v2 = EXCLUDED.remote_id_v2
    WHERE staging.djbr_raw_data.remote_id_v2 IS DISTINCT FROM EXCLUDED.remote_id_v2;
"""

PHYSICAL_INSERT = """
    INSERT INTO staging.djbr_raw_data
        (remote_id, id_cabecera_djb, nombres, cedula, fecha, nombre_archivo, path, fisico, periodo)
    VALUES (%s, NULL, %s, %s, %s, %s, %s, %s, %s)
    ON CONFLICT (remote_id) DO NOTHING;
"""


def process_list(records: List[dict]) -> Tuple[list, list]:
    """Separa el listado en online y físicas, con los valores listos para insertar."""
    online = []
    physical = []

    for record in records:
        numdata = record["cedula"]
        if numdata is None or not is_valid_ci(keep_num_data(numdata)):
            print(f"Skip insertion of (CI={record['cedula']}, nombres={record['nombres']}, periodo={record['periodo']}) because CI is not valid")
            continue

        cedula = keep_num_data(numdata)
        fecha = local_to_utc(record["fecha"]) if record["fecha"] else None
        common = [record["nombres"], cedula, fecha, record["nombreArchivo"], record["path"], record["fisico"],
                  record["periodo"]]

        if record["fisico"]:
            physical.append([record["id"]] + common)
        elif record["idCabeceraDjb"] is not None:
            online.append([record["id"], record["idCabeceraDjb"]] + common)
        else:
            print(f"Skip online declaration without idCabeceraDjb: {record}")

    return online, physical


def get_cutoff(cursor, margin_days: int) -> Optional[datetime]:
    cursor.execute("SELECT max(fecha) FROM staging.djbr_raw_data")
    last = cursor.fetchone()[0]
    if last is None:
        return None
    return last - timedelta(days=margin_days)


def fetch_list(**kwargs):
    page_size = min(int(Variable.get("CGR_LIST_PAGE_SIZE", 50)), 50)
    sleep_seconds = float(Variable.get("CGR_LIST_SLEEP", 1))
    margin_days = int(Variable.get("CGR_LIST_MARGIN_DAYS", 60))
    full_scan = str(Variable.get("CGR_LIST_FULL_SCAN", "false")).lower() == "true"
    max_pages = int(Variable.get("CGR_LIST_MAX_PAGES", 0))

    db_hook = PostgresHook(postgres_conn_id="postgres_default", schema="db")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()

    cutoff = None if full_scan else get_cutoff(db_cursor, margin_days)
    order_by = get_order_by("fecha")

    print(f"""
    Starting with page_size={page_size}, sleep={sleep_seconds}s, full_scan={full_scan}, max_pages={max_pages}
    Cutoff (UTC): {cutoff} (max(fecha) - {margin_days} days)
    """)

    inicio = 0
    page = 0
    previous_last = None
    totals = {"online": 0, "physical": 0}

    while True:
        data = fetch_page(inicio, page_size, order_by)
        records = data["lista"]
        if len(records) == 0:
            print("Empty page, end of the list")
            break

        check_sorted_by_fecha(records, previous_last)
        previous_last = records[-1]["fecha"]

        online, physical = process_list(records)
        if online:
            db_cursor.executemany(ONLINE_UPSERT, online)
        if physical:
            db_cursor.executemany(PHYSICAL_INSERT, physical)
        db_conn.commit()

        totals["online"] += len(online)
        totals["physical"] += len(physical)
        page += 1
        inicio += len(records)

        if page % 20 == 0 or page == 1:
            print(f"Page {page}, offset {inicio} of {data['total']}, last fecha {previous_last}, totals {totals}")

        if cutoff is not None and local_to_utc(previous_last) < cutoff:
            print(f"Reached the cutoff {cutoff} (UTC) at fecha {previous_last} (Paraguay)")
            break

        if 0 < max_pages <= page:
            print(f"Reached CGR_LIST_MAX_PAGES={max_pages}")
            break

        time.sleep(sleep_seconds)

    print(f"Done. Pages: {page}, records sent: {totals}")


with dag:
    launch = DummyOperator(task_id="start")
    done = DummyOperator(task_id="done")

    ensure_schema = PostgresOperator(task_id='clean_table', sql=RAW_DATA_SCHEMA_SQL)

    get_list = PythonOperator(
        task_id="get_declarations_list",
        provide_context=True,
        python_callable=fetch_list,
    )

    launch >> ensure_schema >> get_list >> done

if __name__ == "__main__":
    page = fetch_page(0, 5, get_order_by("fecha"))["lista"]
    print(page)
    print(process_list(page))
