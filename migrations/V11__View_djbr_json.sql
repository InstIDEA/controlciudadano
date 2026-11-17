-- Declaraciones juradas con la API nueva de la Contraloría y el JSON de las online.
--
-- * staging.djbr_raw_data.remote_id_v2: id de las online en la API nueva (el remote_id viejo da 404) y ahora tienen diferentes ids.
-- * staging.djbr_raw_data.fetched_at / analysis.djbr_data.processed_at: cuándo entró / se procesó cada fila.
-- * analysis.djbr:
--     - origin: URL nueva del PDF en la Contraloría (físicas con remote_id, online con remote_id_v2).
--     - data_source: de dónde salen los montos (CGR_DJBR_JSON, MS_DJBR_PARSER o MANUAL).
--     - Muestra también las online que no tienen PDF propio pero sí datos del JSON
--       (antes era JOIN con djbr_downloaded_files: solo aparecían las que tenían PDF bajado).
--     - link usa data.controlcivico.org, como quedó en producción el 2026-11-12.
-- Los ALTER son idempotentes: los mismos cambios los hacen los DAGs al correr.

ALTER TABLE staging.djbr_raw_data ADD COLUMN IF NOT EXISTS remote_id_v2 bigint;
ALTER TABLE staging.djbr_raw_data ADD COLUMN IF NOT EXISTS fetched_at timestamp;
ALTER TABLE staging.djbr_raw_data ALTER COLUMN fetched_at SET DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS djbr_raw_data_id_cabecera_djb_uidx
    ON staging.djbr_raw_data (id_cabecera_djb) WHERE id_cabecera_djb IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS djbr_raw_data_remote_id_v2_uidx
    ON staging.djbr_raw_data (remote_id_v2) WHERE remote_id_v2 IS NOT NULL;

ALTER TABLE analysis.djbr_data ADD COLUMN IF NOT EXISTS processed_at timestamp;
ALTER TABLE analysis.djbr_data ALTER COLUMN processed_at SET DEFAULT now();

CREATE TABLE IF NOT EXISTS staging.djbr_json_errors
(
    id          bigserial primary key,
    raw_data_id bigint references staging.djbr_raw_data (id),
    date        timestamp default now(),
    http_status int,
    message     text
);
CREATE INDEX IF NOT EXISTS djbr_json_errors_raw_data_id_idx ON staging.djbr_json_errors (raw_data_id);

DROP MATERIALIZED VIEW IF EXISTS analysis.djbr;

CREATE MATERIALIZED VIEW analysis.djbr AS
(
SELECT raw.id,
       CAST(raw.cedula as TEXT)                                              as document,
       raw.nombres                                                           as name,
       raw.periodo                                                           as year,
       10000                                                                 as version,
       CASE
           WHEN file is not null THEN 'https://data.controlcivico.org/contraloria/declaraciones/' ||
                                      file.file_name
           END                                                               as link,
       CASE
           WHEN raw.fisico THEN
               'https://portaldjbr.contraloria.gov.py/portal-djbr/api/consultas/djb-descargarpdf/' || raw.remote_id
           WHEN raw.remote_id_v2 IS NOT NULL THEN
               'https://portaldjbr.contraloria.gov.py/portal-djbr/api/consultas/djb-descargarpdf/' || raw.remote_id_v2
           END                                                               as origin,
       NULL                                                                  as link_sandwich,
       'V2'                                                                  as type,
       COALESCE(parsed.active, manual.active)                                as active,
       COALESCE(parsed.passive, manual.passive)                              as passive,
       COALESCE(parsed.net_worth, manual.net_worth)                          as net_worth,
       NULL                                                                  as scrapped_data,
       parsed.charge                                                         as charge,
       CASE
           WHEN file is not null THEN file.download_date
           END                                                               as download_date,
       parsed.monthly_expenses                                               as monthly_expenses,
       parsed.monthly_income                                                 as monthly_income,
       parsed.anual_expenses                                                 as anual_expenses,
       parsed.anual_income                                                   as anual_income,
       COALESCE(parsed.declaration_date, TO_DATE(raw.periodo || '', 'YYYY')) as date,
       CASE
           WHEN parsed.active IS NOT NULL THEN parsed.source
           WHEN manual.active IS NOT NULL THEN 'MANUAL'
           END                                                               as data_source
FROM staging.djbr_raw_data raw
         LEFT JOIN staging.djbr_downloaded_files file ON raw.id = file.raw_data_id
         LEFT JOIN analysis.temp_djbr_scrapped_data manual ON manual.raw_data_id = raw.id
         LEFT JOIN analysis.djbr_data parsed ON parsed.raw_data_id = raw.id
WHERE raw.periodo > 1970
  AND raw.periodo < 3000
  -- por id: "fila IS NOT NULL" en Postgres es falso si cualquier columna de la fila es NULL
  AND (file.id IS NOT NULL OR parsed.id IS NOT NULL)
    );

CREATE INDEX "analysis.djbr_document_idx" ON analysis.djbr USING btree (document);
GRANT SELECT ON analysis.djbr TO ikeep;
