from sqlalchemy import create_engine
from tqdm.auto import tqdm
from glob import glob

import csv
import os

# GOT FROM: http://datosabiertos.tsje.gov.py/group/elecciones-municipales

db_uri = "postgresql://USER:PASS@HOST:PORT/DB"
tsje_path = os.path.join("somewhere", "where", "*.csv")

raise (Exception("You should set tsje_path and db_uri value"))

engine = create_engine(db_uri)

tsje, data = [], []

for fn in tqdm(glob(tsje_path), desc="Loading Files"):

    if "2-1-" in fn:
        year = 2010
    elif "2-2-" in fn:
        year = 2006
    elif "2-3-" in fn:
        year = 2001
    elif "2-4-" in fn:
        year = 2015
    elif "2-5-" in fn:
        year = 1996
    else:
        raise (Exception("This should not happen"))

    with open(fn, "r", encoding="iso-8859-1") as f:
        tsje.append(
            (
                [
                    {k: (str(v) if bool(v) else None) for k, v in row.items()}
                    for row in csv.DictReader(f, skipinitialspace=True, delimiter=",")
                ],
                year,
            )
        )

create_table = """
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
"""

query = (
    """
    INSERT INTO staging.tsje_elected_with_stats(
        "year", "nombre", "apellido",
        "nombre_completo", "edad", "sexo",
        "cand_desc", "candidatura", "departamento",
        "dep_desc", "desc_tit_sup", "dis_desc",
        "distrito", "lista", "orden", "siglas_lista", "tit_sup"
    ) VALUES ("""
    + "%s, " * 16
    + """%s);
"""
)


def proc_name(nom, ape) -> tuple:
    if bool(ape) and bool(nom):
        return (
            str(nom),
            str(ape),
            f"{str(nom)} {str(ape)}",
        )
    elif bool(nom) and not (bool(ape)):
        return (
            None,
            None,
            str(nom),
        )


for n, x in tqdm(enumerate(tsje), desc="Generating Querys", leave=True):
    for i, y in enumerate(x[0]):

        if None in (x[0][i]["nombre"], x[0][i]["sexo"]):
            continue

        if not (x[0][i].get("orden") is None):
            orden = int(x[0][i].get("orden"))
        elif not (x[0][i].get("orden_dhont") is None):
            orden = int(x[0][i].get("orden_dhont"))
        else:
            orden = None

        data.append(
            (
                int(x[1]),
                *proc_name(x[0][i].get("nombre"), x[0][i].get("apellido"),),
                int(x[0][i].get("edad")) if x[0][i].get("edad") else None,
                str(x[0][i].get("sexo")) if x[0][i].get("sexo") else None,
                str(x[0][i].get("cand_desc")) if x[0][i].get("cand_desc") else None,
                int(x[0][i].get("candidatura")) if x[0][i].get("candidatura") else None,
                int(x[0][i].get("departamento"))
                if x[0][i].get("departamento")
                else None,
                str(x[0][i].get("dep_desc")) if x[0][i].get("dep_desc") else None,
                str(x[0][i].get("desc_tit_sup"))
                if x[0][i].get("desc_tit_sup")
                else None,
                str(x[0][i].get("dis_desc")) if x[0][i].get("dis_desc") else None,
                int(x[0][i].get("distrito")) if x[0][i].get("distrito") else None,
                int(x[0][i].get("lista")) if x[0][i].get("lista") else None,
                orden,
                str(x[0][i].get("siglas_lista"))
                if x[0][i].get("siglas_lista")
                else None,
                int(x[0][i].get("tit_sup")) if x[0][i].get("tit_sup") else None,
            )
        )

print("Uploading to db")

connection = engine.raw_connection()
cursor = connection.cursor()
cursor.execute(create_table)
cursor.executemany(query, data)
connection.commit()
connection.close()
