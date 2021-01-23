from sqlalchemy import create_engine

import csv
import os


db_uri = "postgresql://USER:PASS@HOST:PORT/DB"

tsje_path = os.path.join(
    "somwhere", "to", "resultados-1996-2018-municipales-y-generales.csv"
)
raise (Exception("You should set tsje_path and db_uri value"))

engine = create_engine(db_uri)

with open(tsje_path, "r", encoding="iso-8859-1") as f:
    tsje = [
        {k: (str(v) if bool(v) else None) for k, v in row.items()}
        for row in csv.DictReader(f, skipinitialspace=True, delimiter=";")
    ]

create_table = """
DROP TABLE IF EXISTS staging.tsje_local_elected CASCADE;
CREATE TABLE staging.tsje_local_elected
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 ),
    ano text,
    tipo_eleccion text,
    dep integer,
    depdes text,
    dis integer,
    disdes text,
    zon integer,
    zondes text,
    loc integer,
    locdes text,
    candidatura integer,
    cand_desc text,
    lista integer,
    siglas_lista text,
    nombre_lista text,
    votos integer,
    nulos integer,
    blancos integer,
    total_votos integer,
    PRIMARY KEY (id)
);

ALTER TABLE staging.tsje_local_elected
    OWNER to postgres;
"""

query = (
    """
INSERT INTO staging.tsje_local_elected(
    ano, tipo_eleccion, dep, depdes,
    dis, disdes, zon, zondes, loc,
    locdes, candidatura, cand_desc,
    lista, siglas_lista, nombre_lista,
    votos, nulos, blancos, total_votos
) VALUES ("""
    + "%s, " * 18
    + """%s);"""
)
data = []

for autority in tsje:
    if autority["tipo_eleccion"] == "municipales":
        data.append(
            [
                autority["año"],
                autority["tipo_eleccion"],
                int(autority["dep"]) if autority["dep"] else None,
                autority["depdes"],
                int(autority["dis"]) if autority["dis"] else None,
                autority["disdes"],
                int(autority["zon"]) if autority["zon"] else None,
                autority["zondes"],
                int(autority["loc"]) if autority["loc"] else None,
                autority["locdes"],
                int(autority["candidatura"])
                if autority["candidatura"]
                else None,
                autority["cand_desc"],
                int(autority["lista"]) if autority["lista"] else None,
                autority["nombre_lista"],
                autority["siglas_lista"],
                int(autority["votos"]) if autority["votos"] else None,
                int(autority["nulos"]) if autority["nulos"] else None,
                int(autority["blancos"]) if autority["blancos"] else None,
                int(autority["total_votos"])
                if autority["total_votos"]
                else None,
            ]
        )

connection = engine.raw_connection()
cursor = connection.cursor()
cursor.execute(create_table)
cursor.executemany(query, data)
connection.commit()
connection.close()
