CREATE TABLE analysis.authorities_with_ddjj AS (
    SELECT autoridad.id,
           autoridad.cedula       AS document,
           autoridad.apellido     AS last_name,
           autoridad.nombre       AS first_name,
           autoridad.ano          AS year_elected,
           autoridad.dep_desc     AS departament,
           autoridad.cand_desc    AS charge,
           autoridad.nombre_lista AS list,
           autoridad.desc_tit_sup AS title,
           autoridad.sexo         AS sex,
           autoridad.nacionalidad AS nacionality,
           autoridad.edad         AS age,
           (SELECT jsonb_build_object(
                           'id', start.id,
                           'link', start.link,
                           'link_sandwich', start.link_sandwich,
                           'origin', start.origin,
                           'active', start.active,
                           'passive', start.passive,
                           'net_worth', start.net_worth)
            FROM analysis.declarations start
            WHERE start.document = autoridad.cedula
              AND start.year = autoridad.ano
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
            FROM analysis.declarations "end"
            WHERE "end".document = autoridad.cedula
              AND "end".year = autoridad.ano + 5
            ORDER BY "end".version desc
            LIMIT 1)              AS "end"
    FROM analysis.tsje_elected autoridad
);
