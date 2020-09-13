CREATE TABLE staging.dncp_sanctioned_suppliers
(
    id SERIAL PRIMARY KEY,
    supplier_name TEXT,
    supplier_id TEXT,
    identifier jsonb,
    contact_point jsonb,
    details jsonb,
    address jsonb,
    date timestamp,
    awarded_tenders int,
    type text
)
