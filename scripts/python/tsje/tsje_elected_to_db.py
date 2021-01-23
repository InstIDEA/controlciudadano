from sqlalchemy import create_engine

import csv
import os


db_uri = "postgresql://USER:PASS@HOST:PORT/DB"
tsje_path = os.path.join(
    "somewhere", "to", "EleccionesGeneralesElectos_1998_a_2018_140319.csv"
)

raise (Exception("You should set tsje_path and db_uri value"))

engine = create_engine(db_uri)

with open(tsje_path, "r", encoding="iso-8859-1") as f:
    tsje = [
        {k: (str(v) if bool(v) else None) for k, v in row.items()}
        for row in csv.DictReader(f, skipinitialspace=True, delimiter=",")
    ]

create_table = """
DROP TABLE IF EXISTS staging.tsje_elected CASCADE;
CREATE TABLE staging.tsje_elected (
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 ),
    ano bigint,
    codeleccion bigint,
    departamento bigint,
    dep_desc text,
    candidatura bigint,
    cand_desc text,
    lista bigint,
    nombre_lista text,
    siglas_lista text,
    total_votos bigint,
    tit_sup bigint,
    desc_tit_sup text,
    orden_lista bigint,
    orden_dhont bigint,
    nro_div bigint,
    cociente bigint,
    apellido text,
    nombre text,
    sexo text,
    nacionalidad text,
    edad bigint,
    CONSTRAINT tsje_elected_pkey PRIMARY KEY (id)
);

ALTER TABLE staging.tsje_elected OWNER to postgres;
"""

query = (
    """
INSERT INTO staging.tsje_elected(
    ano, codeleccion, departamento,
    dep_desc, candidatura, cand_desc,
    lista, nombre_lista, siglas_lista,
    total_votos, tit_sup, desc_tit_sup,
    orden_lista, orden_dhont, nro_div,
    cociente, apellido, nombre, sexo,
    nacionalidad, edad
    ) VALUES ("""
    + "%s, " * 20
    + """%s);"""
)

data = []
for autority in tsje:
    data.append(
        [
            int(autority["año"]),
            int(autority["codeleccion"]),
            int(autority["departamento"]),
            autority["dep_desc"],
            int(autority["candidatura"]),
            autority["cand_desc"],
            int(autority["lista"]),
            autority["nombre_lista"],
            autority["siglas_lista"],
            int(autority["total_votos"]),
            int(autority["tit_sup"]),
            autority["desc_tit_sup"],
            int(autority["orden_lista"]),
            int(autority["orden_dhont"]),
            int(autority["nro_div"]),
            int(autority["cociente"]),
            autority["apellido"],
            autority["nombre"],
            autority["sexo"],
            autority["nacionalidad"],
            int(autority["edad"]),
        ]
    )

connection = engine.raw_connection()
cursor = connection.cursor()
cursor.execute(create_table)
cursor.executemany(query, data)
connection.commit()
connection.close()
