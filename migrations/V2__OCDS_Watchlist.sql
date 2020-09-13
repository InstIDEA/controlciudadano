CREATE SCHEMA analysis;

CREATE TABLE analysis.ocds_watchlist
(
    id           SERIAL PRIMARY KEY,

    ocds_slug    TEXT NOT NULL,
    name         TEXT,

    observations TEXT,

    requested_by TEXT,
    revised_by   TEXT,

    link          TEXT
);

ALTER TABLE analysis.ocds_watchlist ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE analysis.ocds_watchlist ADD COLUMN dismiss_date TIMESTAMP WITH TIME ZONE;

