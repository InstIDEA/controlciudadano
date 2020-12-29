from airflow.hooks.postgres_hook import PostgresHook

def execute(query) -> None:
    db_hook = PostgresHook(postgres_conn_id="postgres_default")
    db_conn = db_hook.get_conn()
    db_cursor = db_conn.cursor()
    db_cursor.execute(query)
    db_conn.commit()

SQL_QUERY_CREATE_VIEW_BASE = """
DROP MATERIALIZED VIEW IF EXISTS analysis.tsje_elected;
CREATE MATERIALIZED VIEW analysis.tsje_elected AS (
    WITH authorities AS (
        SELECT DISTINCT CONCAT(
                REPLACE(e.apellido, '�', 'Ñ'),
                ', ',
                REPLACE(e.nombre, '�', 'Ñ')
            ) AS name,
            e.apellido as apellido,
            e.nombre as nombre
        FROM staging.tsje_elected e
    ),
    by_hand (nombre, apellido, cedula) as (
        values ('JUANA', 'PAEZ DE ESCURRA', '1790762'),
            ('HERIBERTO', 'SILVERA ACOSTA', '311107'),
            ('GALEANO LUGO', 'ELADIO', '480243'),
            (
                'MARIA BLANCA LILA',
                'MIGNARRO DE GONZALEZ',
                '384004'
            ),
            ('EVARISTO', 'MOREL ROJAS', '940792')
    ),
    with_by_hand AS (
        SELECT DISTINCT ON (a.name) a.name,
            a.apellido,
            a.nombre,
            h.cedula
        FROM authorities a
            LEFT JOIN by_hand h ON h.nombre = a.nombre
            AND h.apellido = a.apellido
    ),
    with_set_simple AS (
        SELECT DISTINCT ON (a.name) a.name,
            a.apellido,
            a.nombre,
            COALESCE(
                a.cedula,
                set.ruc
            ) as cedula
        FROM with_by_hand a
            LEFT JOIN staging.set
        set ON a.cedula IS NULL
            AND
        set.nombre = a.name
    ),
    with_set_complex AS (
        SELECT DISTINCT ON (a.name) a.name,
            a.apellido,
            a.nombre,
            COALESCE(
                a.cedula,
                set.ruc
            ) as cedula
        FROM with_set_simple a
            LEFT JOIN staging.set
        set ON a.cedula IS NULL
            AND substr(a.name, 0, 20) = substr(
                set.nombre,
                    0,
                    20
            )
    ),
    with_sfp_simple AS (
        SELECT DISTINCT ON (a.name) a.name,
            a.apellido,
            a.nombre,
            COALESCE(a.cedula, sfp.documento) as cedula
        FROM with_set_complex a
            LEFT JOIN staging.sfp sfp ON a.cedula IS NULL
            AND sfp.nombres = a.nombre
            AND sfp.apellidos = a.apellido
    ),
    with_a_quien_elegimos_simple AS (
        SELECT DISTINCT ON (a.nombre) a.nombre,
            a.apellido,
            COALESCE(a.cedula, aqes.identifier) as cedula
        FROM with_sfp_simple a
            LEFT JOIN staging.a_quien_elegimos aqes ON a.cedula IS NULL
            AND aqes.name = a.nombre
            AND aqes.lastname = a.apellido
    ),
    final AS (
        SELECT a.*
        FROM with_a_quien_elegimos_simple a
    )
    SELECT a.cedula,
        elected.*
    FROM final a
        LEFT JOIN staging.tsje_elected elected ON elected.nombre = a.nombre
        AND elected.apellido = a.apellido"""

def SQL_QUERY_CREATE_VIEW_NOT_NULL():
    query = SQL_QUERY_CREATE_VIEW_BASE + """WHERE "cedula" IS NOT NULL);"""
    execute(query)

def SQL_QUERT_CREATE_VIEW_NULL():
    query = SQL_QUERY_CREATE_VIEW_BASE + """ WHERE "cedula" IS NULL );"""
    execute(query)
