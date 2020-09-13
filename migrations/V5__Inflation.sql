CREATE TABLE staging.bcp_reference_exchange
(
    id           SERIAL PRIMARY KEY,
    year         int,
    month        int,
    currency     text,
    code         text,
    currency_usd NUMERIC(16, 2),
    currency_gs  NUMERIC(16, 2)
);
