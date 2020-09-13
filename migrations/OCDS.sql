CREATE INDEX "view_data_dncp_data.idx_item_classification" ON view_data_dncp_data.award_items_summary (item_classification);

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
  AND parties_summary.parties_id ~~ 'PY-RUC-%'::text )
