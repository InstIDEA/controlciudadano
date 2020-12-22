CREATE TABLE analysis.full_data AS (
    WITH sfp_documents AS (
        select documento                       as document,
               MAX(anho || to_char(mes, '00')) as last_month_worked
        FROM staging.sfp
        GROUP BY 1
--         LIMIT 10
    ),
         mh_documents AS (
             select codigopersona                   as document,
                    MAX(anio || to_char(mes, '00')) as last_month_worked
             FROM staging.hacienda_funcionarios
             GROUP BY 1
--              LIMIT 10
         ),
         police_document AS (
             select cedula                         as document,
                    MAX(ano || to_char(mes, '00')) as last_month_worked
             FROM staging.policia
             GROUP BY 1
         ),
         all_docs AS (
             SELECT 'a_quien_elegimos'                        as source,
                    name || ' ' || lastname                   as name,
                    regexp_replace(identifier, '\.', '', 'g') as document,
                    head_shot                                 as photo,
                    CAST(NULL as bigint)                      as salary,
                    CAST(NULL as bigint)                      as age,
                    CAST(NULL as bigint)                      as net_worth
             FROM staging.a_quien_elegimos
             UNION
             SELECT 'declarations' as source,
                    name           as name,
                    document       as document,
                    NULL           as photo,
                    NULL           as salary,
                    NULL           as age,
                    net_worth      as net_worth
             FROM analysis.declarations
             UNION
             SELECT 'ande_exonerados' as source,
                    cliente           as name,
                    documento         as document,
                    NULL              as photo,
                    NULL              as salary,
                    NULL              as age,
                    NULL              as net_worth
             FROM staging.ande_exonerados
             UNION
             SELECT 'tsje_elected'            as source,
                    nombre || ' ' || apellido as name,
                    cedula                    as document,
                    NULL                      as photo,
                    NULL                      as salary,
                    edad                      as age,
                    NULL                      as net_worth
             FROM analysis.tsje_elected
             UNION
             SELECT 'sfp'                  as source,
                    (select sfp2.nombres || ' ' || sfp2.apellidos
                     from staging.sfp sfp2
                     WHERe sfp2.documento = docs.document
                     LIMIT 1)              as name,
                    docs.document          as document,
                    NULL                   as photo,
                    sum(raw.presupuestado) as salary,
                    CAST(NULL as bigint)   as age,
                    CAST(NULL as bigint)   as net_worth
             FROM staging.sfp raw
                      JOIN sfp_documents docs
                           ON docs.document = raw.documento AND
                              (raw.anho || to_char(raw.mes, '00')) = docs.last_month_worked
             GROUP BY docs.document, docs.last_month_worked
             UNION
             SELECT 'mh'                        as source,
                    (select sfp2.nombres || ' ' || sfp2.apellidos
                     from staging.hacienda_funcionarios sfp2
                     WHERe sfp2.codigopersona = docs.document
                     LIMIT 1)                   as name,
                    docs.document               as document,
                    NULL                        as photo,
                    sum(raw.montopresupuestado) as salary,
                    NULL                        as age,
                    NULL                        as net_worth
             FROM staging.hacienda_funcionarios raw
                      JOIN mh_documents docs
                           ON docs.document = raw.codigopersona AND
                              (raw.anio || to_char(raw.mes, '00')) = docs.last_month_worked
             GROUP BY docs.document, docs.last_month_worked
             UNION
             SELECT 'pytyvo'    as source,
                    pytyvo.name as name,
                    pytyvo.cid  as document,
                    NULL        as photo,
                    NULL        as salary,
                    NULL        as age,
                    NULL        as net_worth
             FROM staging.pytyvo pytyvo
             UNION
             SELECT 'nangareko'    as source,
                    nangareko.name as name,
                    nangareko.cid  as document,
                    NULL           as photo,
                    NULL           as salary,
                    NULL           as age,
                    NULL           as net_worth
             FROM staging.nangareko nangareko
             UNION
             SELECT 'policia'      as source,
                    (select pol.nombres || ' ' || pol.apellidos
                     from staging.policia pol
                     WHERe pol.cedula = docs.document
                     LIMIT 1)      as name,
                    docs.document  as document,
                    NULL           as photo,
                    sum(raw.linea) as salary,
                    NULL           as age,
                    NULL           as net_worth
             FROM staging.policia raw
                      JOIN police_document docs
                           ON docs.document = raw.cedula AND
                              (raw.ano || to_char(raw.mes, '00')) = docs.last_month_worked
             GROUP BY docs.document, docs.last_month_worked
         )
    SELECT regexp_replace(document, '[^0-9]+', '', 'g')                 as document,
           array_agg(name)                                              as name,
           array_agg(photo)                                             as photo,
           array_agg(salary)                                            as salary,
           array_agg(age)                                               as age,
           array_agg(net_worth)                                         as net_worth,
           array_agg(source)                                            as sources
    FROM all_docs
    WHERE document IS NOT NULL
      AND regexp_replace(document, '[^0-9]+', '', 'g') != ''
    GROUP BY 1
)
