CREATE TABLE analysis.declarations
(
    id            SERIAL PRIMARY KEY,
    document      text,
    name          text,
    year          int,
    version       int,
    link          text,
    origin        text,
    download_date TIMESTAMP,
    link_sandwich text,
    type          text,
    active        NUMERIC(20, 2),
    passive       NUMERIC(20, 2),
    net_worth     NUMERIC(20, 2),
    scrapped_data JSONB,
    charge        text,
    scrapped_data jsonb,
    charge        text
);

ALTER TABLE analysis.declarations ADD CONSTRAINT uq_declarations_link UNIQUE(link);


CREATE TABLE staging.sources
(
    id        SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    dataset   TEXT NOT NULL,
    hash      TEXT NOT NULL,
    date      TIMESTAMP DEFAULT NOW()
);

ALTER TABLE staging.sources ADD COLUMN original_uri TEXT;



CREATE TABLE staging.watchdog
(
    id               SERIAL PRIMARY KEY,
    id_rendicion     NUMERIC,
    id_gasto         NUMERIC,
    tipo_documento   TEXT,
    nombre_documento TEXT,
    fecha_adjunto    TEXT,
    url              TEXT
);

CREATE TABLE staging.ande_exonerados
(
    id                SERIAL PRIMARY KEY,
    agencia           TEXT,
    nis               TEXT,
    tarifa            text,
    cliente           text,
    documento         text,
    fecha_exoneracion text
);

CREATE TABLE staging.essap_exonerados
(
    id            SERIAL PRIMARY KEY,
    numero        TEXT,
    ciudad        TEXT,
    zona          TEXT,
    catastro      TEXT,
    marzo_19      NUMERIC,
    abril_19      NUMERIC,
    mayo_19       NUMERIC,
    junio_19      NUMERIC,
    julio_19      NUMERIC,
    agosto_19     NUMERIC,
    septiembre_19 NUMERIC,
    octubre_19    NUMERIC,
    noviembre_19  NUMERIC,
    diciembre_19  NUMERIC,
    enero_20      NUMERIC,
    febrero_20    NUMERIC,
    promedio      NUMERIC
);

CREATE TABLE staging.tsje_elected
(
    id           SERIAL PRIMARY KEY,
    ano          BIGINT,
    codeleccion  BIGINT,
    departamento BIGINT,
    dep_desc     TEXT,
    candidatura  BIGINT,
    cand_desc    TEXT,
    lista        BIGINT,
    nombre_lista TEXT,
    siglas_lista TEXT,
    total_votos  BIGINT,
    tit_sup      BIGINT,
    desc_tit_sup TEXT,
    orden_lista  BIGINT,
    orden_dhont  BIGINT,
    nro_div      BIGINT,
    cociente     BIGINT,
    apellido     TEXT,
    nombre       TEXT,
    sexo         TEXT,
    nacionalidad TEXT,
    edad         BIGINT
);
