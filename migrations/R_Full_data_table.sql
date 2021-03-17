DROP TABLE analysis.full_data;
CREATE TABLE analysis.full_data AS (
    WITH sfp_documents AS (
        select documento                       as document,
               MAX(anho || to_char(mes, '00')) as last_month_worked
        FROM staging.sfp
        WHERE documento not like 'VAC%'
        GROUP BY 1
        -- LIMIT 100
    ),
         mh_documents AS (
             select codigopersona                   as document,
                    MAX(anio || to_char(mes, '00')) as last_month_worked
             FROM staging.hacienda_funcionarios
             GROUP BY 1
             -- LIMIT 100
         ),
         police_document AS (
             select cedula                         as document,
                    MAX(ano || to_char(mes, '00')) as last_month_worked
             FROM staging.policia
             GROUP BY 1
             -- LIMIT 100
         ),
         all_docs AS (
             (SELECT 'a_quien_elegimos'                        as source,
                     jsonb_build_object(
                             'name', UPPER(name || ' ' || lastname),
                             'confidence', 0.9
                         )                                     as name,
                     regexp_replace(identifier, '\.', '', 'g') as document,
                     head_shot                                 as photo,
                     CAST(NULL as bigint)                      as salary,
                     CAST(NULL as bigint)                      as age,
                     CAST(NULL as bigint)                      as net_worth,
                     CAST(NULL as text)                        as charge
              FROM staging.a_quien_elegimos
                 -- LIMIT 100
             )
             UNION
             (SELECT 'declarations' as source,
                     jsonb_build_object(
                             'name', dec.name,
                             'confidence', CASE
                                               WHEN dec.name is NULL THEN 0
                                               WHEN dec.id < 0 THEN 0.5
                                               WHEN dec.year <= 2014 THEN 0.5
                                               WHEN dec.type = 'V1' THEN 0.5
                                               ELSE 0.99 END
                         )          as name,
                     dec.document   as document,
                     NULL           as photo,
                     NULL           as salary,
                     NULL           as age,
                     dec.net_worth  as net_worth,
                     dec.charge     as charge
              FROM analysis.djbr dec
                 -- LIMIT 100
             )
             UNION
             (SELECT 'ande_exonerados' as source,
                     jsonb_build_object(
                             'name', regexp_replace(a.cliente, '\s+', ' ', 'g'),
                             'confidence', 0.6
                         )             as name,
                     a.documento       as document,
                     NULL              as photo,
                     NULL              as salary,
                     NULL              as age,
                     NULL              as net_worth,
                     NULL              as charge
              FROM staging.ande_exonerados a
                 -- LIMIT 100
             )
             UNION
             (SELECT 'tsje_elected' as source,
                     jsonb_build_object(
                             'name', full_name,
                             'confidence', 0.7
                         )          as name,
                     document       as document,
                     NULL           as photo,
                     NULL           as salary,
                     age            as age,
                     NULL           as net_worth,
                     charge         as charge
              FROM analysis.tsje_elected
                 -- LIMIT 100
             )
             UNION
             (SELECT 'sfp'                  as source,
                     jsonb_build_object(
                             'name', (select sfp2.nombres || ' ' || sfp2.apellidos
                                      from staging.sfp sfp2
                                      WHERe sfp2.documento = docs.document
                                      LIMIT 1),
                             'confidence', 0.9
                         )                  as name,
                     docs.document          as document,
                     NULL                   as photo,
                     sum(raw.presupuestado) as salary,
                     CAST(NULL as bigint)   as age,
                     CAST(NULL as bigint)   as net_worth,
                     cargo                  as charge
              FROM staging.sfp raw
                       JOIN sfp_documents docs
                            ON docs.document = raw.documento
                                AND (raw.anho || to_char(raw.mes, '00')) = docs.last_month_worked
              GROUP BY docs.document, docs.last_month_worked, raw.cargo
                 -- LIMIT 100
             )
             UNION
             (SELECT 'mh'                        as source,
                     jsonb_build_object(
                             'name', (select hacienda2.nombres || ' ' || hacienda2.apellidos
                                      from staging.hacienda_funcionarios hacienda2
                                      WHERe hacienda2.codigopersona = docs.document
                                      LIMIT 1),
                             'confidence', 0.8
                         )                       as name,
                     docs.document               as document,
                     NULL                        as photo,
                     sum(raw.montopresupuestado) as salary,
                     NULL                        as age,
                     NULL                        as net_worth,
                     cargo                       as charge
              FROM staging.hacienda_funcionarios raw
                       JOIN mh_documents docs
                            ON docs.document = raw.codigopersona AND
                               (raw.anio || to_char(raw.mes, '00')) = docs.last_month_worked
              GROUP BY docs.document, docs.last_month_worked, raw.cargo
                 -- LIMIT 100
             )
             UNION
             (SELECT 'pytyvo'   as source,
                     jsonb_build_object(
                             'name', pytyvo.name,
                             'confidence', 0.6
                         )      as name,
                     pytyvo.cid as document,
                     NULL       as photo,
                     NULL       as salary,
                     NULL       as age,
                     NULL       as net_worth,
                     NULL       as charge
              FROM staging.pytyvo pytyvo
                 -- LIMIT 100
             )
             UNION
             (SELECT 'nangareko'   as source,
                     jsonb_build_object(
                             'name', nangareko.name,
                             'confidence', 0.6
                         )         as name,
                     nangareko.cid as document,
                     NULL          as photo,
                     NULL          as salary,
                     NULL          as age,
                     NULL          as net_worth,
                     NULL          as charge
              FROM staging.nangareko nangareko
                 -- LIMIT 100
             )
             UNION
             (SELECT 'policia'      as source,
                     jsonb_build_object(
                             'name', (select pol.nombres || ' ' || pol.apellidos
                                      from staging.policia pol
                                      WHERe pol.cedula = docs.document
                                      LIMIT 1),
                             'confidence', 0.6
                         )          as name,
                     docs.document  as document,
                     NULL           as photo,
                     sum(raw.linea) as salary,
                     NULL           as age,
                     NULL           as net_worth,
                     cargo          as charge
              FROM staging.policia raw
                       JOIN police_document docs
                            ON docs.document = raw.cedula AND
                               (raw.ano || to_char(raw.mes, '00')) = docs.last_month_worked
              GROUP BY docs.document, docs.last_month_worked, raw.cargo
                 -- LIMIT 100
             )),
         grouped AS (
             SELECT regexp_replace(document, '[^0-9]+', '', 'g') as document,
                    jsonb_agg(name)                              as name,
                    array_agg(photo)                             as photo,
                    array_agg(salary)                            as salary,
                    array_agg(age)                               as age,
                    array_agg(net_worth)                         as net_worth,
                    array_agg(source)                            as sources,
                    array_agg(charge)                            as charges
             FROM all_docs
             WHERE document IS NOT NULL
               AND regexp_replace(document, '[^0-9]+', '', 'g') != ''
             GROUP BY 1
         )
    SELECT document,
           (SELECT names ->> 'name'
            FROM jsonb_array_elements(g.name) names
            ORDER BY names ->> 'confidence' DESC
            LIMIT 1) as name,
           photo,
           salary,
           age,
           net_worth,
           sources,
           charges
    FROM grouped g
)
