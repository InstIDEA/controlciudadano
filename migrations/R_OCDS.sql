DROP SCHEMA temp_schema_similarities CASCADE;

CREATE INDEX IF NOT EXISTS "view_data_dncp_data.idx_item_classification" ON view_data_dncp_data.award_items_summary (item_classification);

DROP MATERIALIZED VIEW view_data_dncp_data.unique_suppliers;
CREATE MATERIALIZED VIEW view_data_dncp_data.unique_suppliers AS
(
SELECT DISTINCT parties_summary.party ->> 'name'::text                                   AS name,
                replace(parties_summary.party ->> 'id'::text, 'PY-RUC-'::text, ''::text) AS ruc,
                regexp_replace((parties_summary.party -> 'contactPoint'::text) ->> 'telephone'::text, '[^0-9]+'::text,
                               ''::text, 'g'::text)                                      AS telephone,
                (parties_summary.party -> 'contactPoint'::text) ->> 'name'::text         AS contact_point,
                (parties_summary.party -> 'address'::text) ->> 'countryName'::text       AS pais,
                upper((parties_summary.party -> 'address'::text) ->> 'region'::text)     AS departamento,
                upper((parties_summary.party -> 'address'::text) ->> 'locality'::text)   AS ciudad,
                (parties_summary.party -> 'address'::text) ->> 'streetAddress'::text     AS direccion
FROM view_data_collection_3.parties_summary
WHERE NOT parties_summary.roles ? 'buyer'::text
  AND NOT parties_summary.roles ? 'procuringEntity'::text
  AND NOT parties_summary.roles ? 'payer'::text
  AND parties_summary.parties_id ~~ 'PY-RUC-%'::text );


alter table view_data_dncp_data.tender_summary
    add column IF NOT EXISTS tender_datepublished timestamp;
alter table view_data_dncp_data.tender_summary
    add column IF NOT EXISTS covid boolean default false;

update view_data_dncp_data.tender_summary ts
set tender_datepublished = (
    select max(t.tender ->> 'datePublished')::timestamp
    from view_data_dncp_data.tender_summary_with_data t
    where t.ocid = ts.ocid
      and t.data_id = ts.data_id
)
WHERE tender_datepublished IS NULL;

update view_data_dncp_data.tender_summary ts
set covid = (
    select case
               when t.tender -> 'coveredBy' ? 'covid_19' is null then false
               else t.tender -> 'coveredBy' ? 'covid_19' end
    from view_data_dncp_data.tender_summary_with_data t
    where t.ocid = ts.ocid
      and t.data_id = ts.data_id
    limit 1
)
WHERE covid IS NULL;


create or replace function get_promedio_before_covid(presentacion text, moneda text, catalogo_n5 text, unidad text)
    RETURNS integer AS
$$
BEGIN
    return
        avg(ai.unit_amount) as precio_unitario_promedio_antes_pandemia
    from view_data_dncp_data.award_items_summary ai
    join view_data_dncp_data.tender_summary t on ai.
    ocid = t.ocid
           where ai.item_classification = catalogo_n5
             and ai.item -> 'attributes' -> 1 ->> 'value' = presentacion
             and ai.item -> 'unit' ->> 'name' = unidad
             and ai.unit_currency = moneda
             and t.tender_datepublished < '2020-03-01';

END;
$$ LANGUAGE plpgsql;

alter table view_data_dncp_data.awards_summary_no_data
    add column fecha_firma_contrato timestamp;
update view_data_dncp_data.awards_summary_no_data a
set fecha_firma_contrato = c.datesigned
from view_data_dncp_data.contracts_summary_no_data c
where c.data_id = a.data_id
  and c.award_id = a.award_id;

set search_path to view_data_dncp_data, public;

create or replace function get_max_collection() returns integer
    language sql
as
$$
select max(id)
from selected_collections;
$$;
create or replace function get_duplicated_ids() returns setof int
    language sql
as
$$
select distinct data_id
from release_summary r
where collection_id < get_max_collection()
  and ocid in (select distinct ocid
               from release_summary rr
               where collection_id = get_max_collection());
$$;

delete
from record
where data_id in (select * from get_duplicated_ids());

delete
from data
where id in (select * from get_duplicated_ids());

delete
from tender_documents_summary
where data_id in (select * from get_duplicated_ids());

delete
from tender_items_summary
where data_id in (select * from get_duplicated_ids());

delete
from procuringentity_summary
where data_id in (select * from get_duplicated_ids());

delete
from tenderers_summary
where data_id in (select * from get_duplicated_ids());

delete
from tender_summary
where data_id in (select * from get_duplicated_ids());

delete
from buyer_summary
where data_id in (select * from get_duplicated_ids());


delete
from planning_summary
where data_id in (select * from get_duplicated_ids());

delete
from parties_summary_no_data
where data_id in (select * from get_duplicated_ids());

delete
from award_suppliers_summary
where data_id in (select * from get_duplicated_ids());

delete
from award_items_summary
where data_id in (select * from get_duplicated_ids());

delete
from award_documents_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from awards_summary_no_data
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contract_documents_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contract_implementation_documents_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contract_implementation_milestones_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contract_implementation_transactions_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contract_items_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contract_milestones_summary
where data_id in (
    select *
    from get_duplicated_ids());

delete
from contracts_summary_no_data
where data_id in (
    select *
    from get_duplicated_ids());


delete
from release_summary
where data_id in (
    select *
    from get_duplicated_ids());


----------
-- Part of comparison
create schema temp_schema_similarities;
-- DROP MATERIALIZED VIEW temp_schema_similarities.covid_suppliers;
CREATE MATERIALIZED VIEW temp_schema_similarities.covid_suppliers AS
select DISTINCT s.supplier ->> 'name' as supplier_name,
                s.supplier ->> 'id'   as supplier_ruc,
                s.supplier            as raw_data

from view_data_dncp_data.award_items_summary ai
         join view_data_dncp_data.tender_summary_with_data ts on ts.data_id = ai.data_id
         join view_data_dncp_data.award_suppliers_summary s on s.award_index = ai.award_index and ts.data_id = s.data_id

where ts.tender -> 'coveredBy' ? 'covid_19';


-- DROP MATERIALIZED VIEW temp_schema_similarities.similarity_name;
CREATE MATERIALIZED VIEW temp_schema_similarities.similarity_name AS
SELECT c1.ruc                    as ruc1,
       c1.name                   as name1,
       c2.ruc                    as ruc2,
       c2.name                   as name2,
       c1.contact_point          as data,
       'OCDS_SAME_LEGAL_CONTACT' as relation,
       100                       as weight,
       NOW()                     as date
FROM view_data_dncp_data.unique_suppliers AS c1
         JOIN view_data_dncp_data.unique_suppliers AS c2 ON c1.ruc != c2.ruc
    AND c2.telephone IS NOT NULL
    AND c1.contact_point = c2.contact_point
    AND c1.contact_point IS NOT NULL
    AND c1.contact_point <> '-';

CREATE MATERIALIZED VIEW temp_schema_similarities.address AS
SELECT c1.ruc              as ruc1,
       c2.ruc              as ruc2,
       c1.direccion        as data,
       'OCDS_SAME_ADDRESS' as relation,
       100                 as weight,
       NOW()               as date
FROM view_data_dncp_data.unique_suppliers AS c1
         JOIN view_data_dncp_data.unique_suppliers AS c2 ON c1.ruc != c2.ruc
    AND c1.ciudad != c1.direccion
    AND c1.direccion != 'ASUNCION'
    AND c1.direccion = c2.direccion
    AND c1.direccion IS NOT NULL
    AND c1.direccion not in ('-', '*', 'SAN IGNACIO', 'SANTA ROSA', 'SANTA MARIA', 'CNEL OVIEDO', 'GRAL. CABALLERO',
                             'SUPER CARRETERA', 'SAN PEDRO', 'CORONEL BOGADO', 'GRAL CABALLERO', 'MISIONES',
                             'SAN ROQUE G. SANTACRUZ',
                             'ASUNCION', 'CIUDAD DEL ESTE', 'LUQUE', 'SAN LORENZO', 'CAPIATA', 'LAMBARE',
                             'FERNANDO DE LA MORA', 'LIMPIO',
                             'ÑEMBY', 'ENCARNACION', 'CAAGUAZU', 'CORONEL OVIEDO', 'PEDRO JUAN CABALLERO',
                             'ITAUGUA', 'MARIANO ROQUE ALONSO',
                             'PRESIDENTE FRANCO', 'MINGA GUAZU', 'CONCEPCION', 'ITA', 'VILLA ELISA', 'HERNANDARIAS',
                             'AREGUA', 'VILLARRICA',
                             'SAN ANTONIO', 'HORQUETA', 'CAMBYRETA', 'CAACUPE', 'CURUGUATY', 'SAN ESTANISLAO',
                             'JULIAN AUGUSTO SALDIVAR', 'YPANE',
                             'VILLA HAYES', 'CAPIIBARY', 'SANTA ROSA DEL AGUARAY', 'VILLETA', 'SAN JUAN NEPOMUCENO',
                             'ITAKYRY',
                             'DOCTOR JUAN EULOGIO ESTIGARRIBIA', 'CARAPEGUA', 'GUARAMBARE', 'SALTO DEL GUAIRA',
                             'SAN PEDRO DE YCUAMANDIYU',
                             'YHU', 'SAN PEDRO DEL PARANA', 'SAN IGNACIO GUAZU', 'REPATRIACION', 'PILAR',
                             'SANTA RITA', 'ABAI', 'TOBATI',
                             'YBY YAU', 'YAGUARON', 'GUAYAIBI', 'TOMAS ROMERO PEREIRA', 'CHORE',
                             'MARISCAL JOSE FELIX ESTIGARRIBIA', 'PIRIBEBUY',
                             'YASY CAÑY', 'YPACARAI', 'INDEPENDENCIA', 'PASO YOBAI',
                             'TENIENTE PRIMERO MANUEL IRALA FERNANDEZ', 'CAAZAPA',
                             'JUAN EMILIO OLEARY', 'GENERAL ISIDORO RESQUIN', 'ARROYOS Y ESTEROS', 'YBYCUI',
                             'DOCTOR JUAN MANUEL FRUTOS', 'LIBERACION',
                             'EDELIRA', 'GENERAL ELIZARDO AQUINO', 'PARAGUARI', 'EUSEBIO AYALA',
                             'SAN JUAN BAUTISTA', 'SAN RAFAEL DEL PARANA', 'YUTY',
                             'DOCTOR JUAN LEON MALLORQUIN', 'QUIINDY', 'NATALIO', 'CORONEL JOSE FELIX BOGADO',
                             'BENJAMIN ACEVAL', 'CARLOS ANTONIO LOPEZ',
                             'SAN JOSE DE LOS ARROYOS', 'EMBOSCADA', 'CAPITAN BADO', 'TRES DE MAYO', 'LORETO',
                             'FILADELFIA', 'AYOLAS',
                             'SANTA ROSA DE LIMA', 'TAVAI', 'SAN JOAQUIN', 'ALTO VERA', 'PIRAYU', 'VILLA YGATIMI',
                             'RAUL ARSENIO OVIEDO', 'OBLIGADO',
                             'ITAPUA POTY', 'ATYRA', 'BELLA VISTA NORTE', 'LOMA PLATA', 'ACAHAY', 'TACUATI',
                             'CARAYAO', 'YRYBUCUA', 'MAYOR JULIO DIONISIO OTAÑO', 'HOHENAU', 'MINGA PORA',
                             'TEMBIAPORA', 'MBUYAPEY', 'ALTOS', 'CAPITAN MEZA', 'BELLA VISTA', 'YBYRAROBANA',
                             'CARAGUATAY', 'CAPITAN MIRANDA', 'YATYTAY', 'GENERAL ARTIGAS', 'SANTA ROSA DEL MBUTUY',
                             'NUEVA ESPERANZA', 'BELEN', 'YATAITY DEL NORTE', 'NUEVA ITALIA',
                             'SAN ROQUE GONZALEZ DE SANTA CRUZ', 'LIMA', 'SAN ALBERTO', 'SAN BERNARDINO',
                             'GENERAL FRANCISCO CABALLERO ALVAREZ', 'VAQUERIA', 'YBY PYTA', 'SAN LAZARO',
                             'ITACURUBI DEL ROSARIO', 'YGUAZU', 'JOSE DOMINGO OCAMPOS',
                             'ITACURUBI DE LA CORDILLERA', 'VILLA DEL ROSARIO', 'CAPITAN MAURICIO JOSE TROCHE',
                             'SAN CRISTOBAL', 'PUERTO PINASCO', 'LOS CEDRALES', '25 DE DICIEMBRE', 'BORJA', 'FRAM',
                             'TRES DE FEBRERO', 'SAN COSME Y DAMIAN', 'CORPUS CHRISTI', 'SAN JUAN DEL PARANA',
                             'TRINIDAD', 'ÑACUNDAY', 'R. I. TRES CORRALES', 'ALBERDI', 'DOCTOR RAUL PEÑA', 'PIRAPO',
                             'ITURBE', 'AZOTEY', 'LA PALOMA DEL ESPIRITU SANTO', 'MBARACAYU', 'SANTA MARIA DE FE',
                             'CARMEN DEL PARANA', 'KATUETE', 'YPEJHU', 'MBOCAYATY DEL GUAIRA', 'ESCOBAR',
                             'GENERAL EUGENIO ALEJANDRINO GARAY', 'CAAPUCU', 'TAVAPY', 'GENERAL DELGADO',
                             'ISLA PUCU', 'DOCTOR CECILIO BAEZ', 'ITAPE', 'NUEVA ALBORADA', 'ZANJA PYTA',
                             'QUYQUYHO', 'SANTA ROSA DEL MONDAY', 'YBYTYMI', 'GENERAL BERNARDINO CABALLERO',
                             'UNION', 'SARGENTO JOSE FELIX LOPEZ', 'MARISCAL FRANCISCO SOLANO LOPEZ', 'VALENZUELA',
                             'JOSE A. FASSARDI', 'FULGENCIO YEGROS', 'NUEVA GERMANIA', 'JUAN DE MENA', 'SAPUCAI',
                             'CORONEL MARTINEZ', 'PRIMERO DE MARZO', 'SANTIAGO', 'JESUS',
                             'GENERAL HIGINIO MORINIGO', 'SIMON BOLIVAR', 'FELIX PEREZ CARDOZO', 'BUENA VISTA',
                             'IRUÑA', 'PUERTO CASADO', 'NARANJAL', 'NANAWA', 'SAN MIGUEL',
                             'SAN JUAN BAUTISTA DEL ÑEEMBUCU', 'DOMINGO MARTINEZ DE IRALA', 'LA COLMENA',
                             'DOCTOR MOISES SANTIAGO BERTONI', 'CERRITO', 'SAN ALFREDO', 'LA PASTORA',
                             'SANTA ELENA', 'NUEVA TOLEDO', 'NUEVA LONDRES', 'NATALICIO TALAVERA', 'MACIEL',
                             'JOSE LEANDRO OVIEDO', 'YATAITY DEL GUAIRA', 'TEBICUARYMI', 'KARAPAI',
                             'CAPITAN CARMELO PERALTA', 'SAN JOSE OBRERO', 'FUERTE OLIMPO', 'SANTA FE DEL PARANA',
                             'MAYOR JOSE DE JESUS MARTINEZ', 'ANTEQUERA', 'MBOCAYATY DEL YHAGUY', 'PASO BARRETO',
                             'JOSE FALCON', 'GENERAL JOSE EDUVIGIS DIAZ', 'NUEVA COLOMBIA', 'TACUARAS',
                             'VILLA OLIVA', 'SAN PATRICIO', 'SAN PABLO', 'VILLA FLORIDA', 'LOMA GRANDE', 'LAURELES',
                             'ÑUMI', 'TENIENTE ESTEBAN MARTINEZ', 'LA PAZ', 'ITANARA', 'GENERAL JOSE MARIA BRUGUEZ',
                             'TEBICUARY', 'HUMAITA', 'ISLA UMBU', 'SAN SALVADOR', 'YABEBYRY', 'BAHIA NEGRA',
                             'VILLALBIN', 'GUAZU CUA', 'PASO DE PATRIA', 'DESMOCHADOS', 'DOCTOR BOTTRELL',
                             'VILLA FRANCA', 'SAN CARLOS DEL APA', 'MARACANA', 'MARIA ANTONIA',
                             'SAN VICENTE PANCHOLO', 'ARROYITO', 'PUERTO ADELA', 'PASO HORQUETA', 'CERRO CORA',
                             'CAMPO ACEVAL');



