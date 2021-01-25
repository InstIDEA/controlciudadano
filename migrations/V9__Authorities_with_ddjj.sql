DROP TABLE analysis.authorities_with_ddjj;

CREATE TABLE analysis.authorities_with_ddjj AS (
    SELECT autoridad.document     AS document,
           autoridad.full_name    AS full_name,
           autoridad.year_elected AS year_elected,
           autoridad.department   AS departament,
           autoridad.district     AS district,
           autoridad.election     AS election,
           autoridad.charge       AS charge,
           autoridad.list         AS list,
           autoridad.title        AS title,
           autoridad.sex          AS sex,
           autoridad.nacionality  AS nacionality,
           autoridad.age          AS age,
           (SELECT jsonb_build_object(
                           'id', start.id,
                           'link', start.link,
                           'link_sandwich', start.link_sandwich,
                           'origin', start.origin,
                           'active', start.active,
                           'passive', start.passive,
                           'net_worth', start.net_worth)
            FROM analysis.djbr start
            WHERE start.document = autoridad.document
              AND start.year = autoridad.year_elected
            ORDER BY start.version desc
            LIMIT 1)              AS start,
           (SELECT jsonb_build_object(
                           'id', "end".id,
                           'link', "end".link,
                           'link_sandwich', "end".link_sandwich,
                           'origin', "end".origin,
                           'active', "end".active,
                           'passive', "end".passive,
                           'net_worth', "end".net_worth)
            FROM analysis.djbr "end"
            WHERE "end".document = autoridad.document
              AND "end".year = autoridad.year_elected + 5
            ORDER BY "end".version desc
            LIMIT 1)              AS "end",
           aqe.head_shot          as photo
    FROM analysis.tsje_elected autoridad
             LEFT JOIN staging.a_quien_elegimos aqe ON aqe.identifier = autoridad.document
);

ALTER TABLE analysis.authorities_with_ddjj
    ADD COLUMN presented boolean DEFAULT FALSE;

UPDATE analysis.authorities_with_ddjj
SET presented = start IS NOT NULL AND ("end" IS NOT NULL OR year_elected + 5 > date_part('year', CURRENT_DATE));
