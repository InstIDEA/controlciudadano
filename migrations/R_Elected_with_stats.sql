DROP TABLE IF EXISTS staging.tsje_elected_with_stats CASCADE;
CREATE TABLE staging.tsje_elected_with_stats
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 ),
    year integer NOT NULL,
    nombre text,
    apellido text,
    nombre_completo text,
    edad integer,
    sexo "char",
    cand_desc text,
    candidatura integer,
    departamento integer,
    dep_desc text,
    desc_tit_sup text,
    dis_desc text,
    distrito integer,
    lista integer,
    orden integer,
    siglas_lista text,
    tit_sup integer,
    PRIMARY KEY (id)
);

ALTER TABLE staging.tsje_elected_with_stats
    OWNER to postgres;