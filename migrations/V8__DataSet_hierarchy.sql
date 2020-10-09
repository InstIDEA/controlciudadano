CREATE TABLE staging.data_set
(
    id          bigserial primary key,
    institution text,
    name        text,
    last_update timestamp,
    description text,
    base_url    text,
    kind        text
);

COMMENT ON COLUMN staging.data_set.kind is 'Kind of dataset, posible values are "MONTHLY"|"OTHER"';
COMMENT ON COLUMN staging.data_set.institution is 'Name of the public institution that from which this dataset was extracted.';

CREATE TABLE staging.data_set_file
(
    id           bigserial primary key,
    file_name    text,
    data_set_id  BIGINT NOT NULL,
    loaded_date  timestamp,
    file_date    timestamp,
    original_url text   NOT NULL,
    local_suffix text,
    hash         text,

    CONSTRAINT "dsf_ds" FOREIGN KEY (data_set_id) REFERENCES staging.data_set (id)
);

COMMENT ON COLUMN staging.data_set_file.loaded_date IS 'The date that this file was loaded to the local server';
COMMENT ON COLUMN staging.data_set_file.file_date IS 'The date that this file belongs to, for example year and month in a MONTHLY data set';
