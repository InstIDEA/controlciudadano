DROP MATERIALIZED VIEW analysis.djbr;

REFRESH MATERIALIZED VIEW analysis.djbr;

CREATE MATERIALIZED VIEW IF NOT EXISTS analysis.djbr AS
(
(SELECT raw.id,
        CAST(raw.cedula as TEXT)                                                                        as document,
        raw.nombres                                                                                     as name,
        raw.periodo                                                                                     as year,
        10000                                                                                           as version,
        CASE
            WHEN file is not null THEN 'https://data.controlciudadanopy.org/contraloria/declaraciones/' ||
                                       file.file_name
            END                                                                                         as link,
        'https://portaldjbr.contraloria.gov.py/portal-djbr/api/consulta/descargarpdf/' || raw.remote_id as origin,
        NULL                                                                                            as link_sandwich,
        'V2'                                                                                            as type,
        COALESCE(parsed.active, manual.active)                                                          as active,
        COALESCE(parsed.passive, manual.passive)                                                        as passive,
        COALESCE(parsed.net_worth, manual.net_worth)                                                    as net_worth,
        NULL                                                                                            as scrapped_data,
        parsed.charge                                                                                   as charge,
        CASE
            WHEN file is not null THEN file.download_date
            END                                                                                         as download_date,
        parsed.monthly_expenses                                                                         as monthly_expenses,
        parsed.monthly_income                                                                           as monthly_income,
        parsed.anual_expenses                                                                           as anual_expenses,
        parsed.anual_income                                                                             as anual_income,
        COALESCE(parsed.declaration_date, TO_DATE(raw.periodo || '', 'YYYY'))                           as date
 FROM staging.djbr_raw_data raw
          JOIN staging.djbr_downloaded_files file ON raw.id = file.raw_data_id
          LEFT JOIN analysis.temp_djbr_scrapped_data manual ON manual.raw_data_id = raw.id
          LEFT JOIN analysis.djbr_data parsed ON parsed.raw_data_id = raw.id
 WHERE raw.periodo > 1970
   and raw.periodo < 3000
--  LIMIT 10
)
);

CREATE INDEX "analysis.djbr_document_idx" ON analysis.djbr (document);

CREATE TABLE IF NOT EXISTS analysis.temp_djbr_scrapped_data
(
    id           bigserial primary key,
    raw_data_id  bigint,
    active       numeric(20, 2),
    passive      numeric(20, 2),
    net_worth    numeric(20, 2),
    scraped_date timestamp,
    scraped_alg  text,
    CONSTRAINT "djbr_temp_djbr_scrapped_data"
        FOREIGN KEY (raw_data_id) REFERENCES staging.djbr_raw_data (id)
)
