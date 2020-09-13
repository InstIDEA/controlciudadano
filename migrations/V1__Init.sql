CREATE SCHEMA staging;

CREATE TABLE staging.pytyvo
(
    id         BIGINT primary key,
    name       text,
    department text,
    district   text,
    cid        text,
    file       text
);
DROP SEQUENCE staging.id_pytyvo;
CREATE SEQUENCE staging.id_pytyvo START 10000000;
ALTER TABLE staging.pytyvo ALTER COLUMN id SET DEFAULT nextval('staging.id_pytyvo');
-- ALTER TABLE staging.pytyvo ADD COLUMN file TEXT default 'pytyvo-lista04-2020-05-07.csv';
select count(*) from staging.pytyvo;
select * from staging.pytyvo where id > 10000000 order by id desc;

CREATE TABLE staging.nangareko
(
    id         BIGINT primary key,
    name       text,
    department text,
    district   text,
    cid        text
);

CREATE TABLE staging.nangareko_2
(
    id         BIGINT primary key,
    name       text,
    department text,
    district   text,
    cid        text,
    state      text,
    mpago      text,
    fpago      timestamp with time zone
);

CREATE TABLE staging.nangareko_transparencia
(
    id                        SERIAL primary key,
    nivel                     BIGINT,
    codigo_entidad            BIGINT,
    entidad                   TEXT,
    clase_programa            BIGINT,
    codigo_programa           BIGINT,
    nombre_programa           TEXT,
    codigo_proyecto_actividad BIGINT,
    nombre_actividad_proyecto TEXT,
    tipo_subsidio_programa    BIGINT,
    numero_documento          TEXT,
    Nombre_beneficiario       TEXT,
    id_departamento           BIGINT,
    nombre_departamento       TEXT,
    id_municipio              BIGINT,
    nombre_municipio          TEXT,
    caracteristica_subsidio   TEXT,
    nombre_subsidio           TEXT,
    valor_subsidio            BIGINT,
    cantidad_subsidio         BIGINT,
    fecha_cargue_archivo      TIMESTAMP,
    fuente_datos              TEXT
) ;

DROP TABLE staging.hacienda_funcionarios;
CREATE TABLE staging.hacienda_funcionarios
(
    id                           SERIAL primary key,
    anio                         INTEGER NOT NULL,
    mes                          INTEGER NOT NULL,
    codigonivel                  INTEGER,
    descripcionnivel             TEXT,
    codigoentidad                INTEGER,
    descripcionentidad           TEXT,
    codigoprograma               INTEGER,
    descripcionprograma          TEXT,
    codigosubprograma            INTEGER,
    descripcionsubprograma       TEXT,
    codigoproyecto               INTEGER,
    descripcionproyecto          TEXT,
    codigounidadresponsable      INTEGER,
    descripcionunidadresponsable TEXT,
    codigoobjetogasto            INTEGER,
    conceptogasto                TEXT,
    fuentefinanciamiento         TEXT,
    linea                        INTEGER,
    codigopersona                TEXT    NOT NULL,
    nombres                      TEXT,
    apellidos                    TEXT,
    sexo                         TEXT,
    discapacidad                 TEXT,
    codigocategoria              TEXT,
    cargo                        TEXT,
    horascatedra                 TEXT,
    fechaingreso                 TEXT,
    tipopersonal                 TEXT,
    lugar                        TEXT,
    montopresupuestado           INTEGER,
    montodevengado               INTEGER,
    mescorte                     INTEGER,
    aniocorte                    TEXT,
    fechacorte                   TEXT,
    nivelabr                     TEXT,
    entidadabr                   TEXT,
    programaabr                  TEXT,
    subprogramaabr               TEXT,
    proyectoabr                  TEXT,
    unidadabr                    TEXT
);

DROP TABLE staging.sfp;
CREATE TABLE staging.sfp
(
    ID                    SERIAL PRIMARY KEY,
    anho                  INTEGER NOT NULL,
    mes                   INTEGER NOT NULL,
    nivel                 INTEGER NOT NULL,
    descripcion_nivel     TEXT,
    entidad               INTEGER,
    descripcion_entidad   TEXT,
    oee                   INTEGER,
    descripcion_oee       TEXT,
    documento             TEXT,
    nombres               TEXT,
    apellidos             TEXT,
    funcion               TEXT,
    estado                TEXT,
    carga_horaria         TEXT,
    anho_ingreso          INTEGER,
    sexo                  TEXT,
    discapacidad          TEXT,
    tipo_discapacidad     TEXT,
    fuente_financiamiento INTEGER,
    objeto_gasto          INTEGER,
    concepto              TEXT,
    linea                 TEXT,
    categoria             TEXT,
    cargo                 TEXT,
    presupuestado         INTEGER,
    devengado             INTEGER,
    movimiento            TEXT,
    lugar                 TEXT,
    fecha_nacimiento      TEXT,
    fec_ult_modif         TEXT,
    uri                   TEXT,
    fecha_acto            TEXT,
    correo                TEXT,
    profesion             TEXT,
    motivo_movimiento     TEXT
);
VACUUM (VERBOSE, ANALYZE) staging.sfp;
SELECT COUNT(*) FROM staging.sfp;


CREATE TABLE staging.policia
(
    id                        SERIAL PRIMARY KEY,
    ano                       BIGINT,
    mes                       BIGINT,
    nivel_entidad             BIGINT,
    ent                       BIGINT,
    oee                       BIGINT,
    linea                     BIGINT,
    cedula                    TEXT,
    nombres                   TEXT,
    apellidos                 TEXT,
    estado                    TEXT,
    remuneracion              TEXT,
    objeto_gasto              TEXT,
    ff                        TEXT,
    categoria                 TEXT,
    presupuesto               TEXT,
    devengado                 TEXT,
    concepto                  TEXT,
    movimiento                TEXT,
    lugar                     TEXT,
    cargo                     TEXT,
    funcion_real              TEXT,
    carga                     TEXT,
    discapacidad              TEXT,
    tipo                      TEXT,
    ingreo                    TEXT,
    oficina                   TEXT,
    profesion                 TEXT,
    correo                    TEXT,
    fecha_acto_administrativo TEXT,
    movito_movimiento         TEXT,
    filename                  TEXT
);
VACUUM (VERBOSE, ANALYZE) staging.policia;
SELECT COUNT(*) FROM staging.policia;
