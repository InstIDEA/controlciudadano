#!/usr/bin/python3
from typing import List, Union
from datetime import datetime
from fnmatch import fnmatch
import pickle
import sys
import re
import os


class MalformedData(Exception):
    "Exeption for when Passed String is malformed"

    def __init__(
        self,
        data,
        formato: Union[str] = None,
        message: str = "Passed data is malformed",
    ):
        self.data = data
        self.formato = formato
        self.message = message


def find(path: str, pattern: str = "*.pdf") -> List[str]:
    """
    busca todos los pdfs del directorio
    """
    result = []
    for _, _, files in os.walk(path):
        for name in files:
            if fnmatch(name, pattern):
                result.append(os.path.join(name))
    return result


def extract_data_from_name(file_name: str, date: datetime) -> dict:
    """
    saca ci, nombre, año y version del link y nombre del archivo[0]
    """

    cleaned = (
        file_name.replace(
            "OLGA_CAROLINA_ACOSTA_LEDESMA__1.pdf",
            "OLGA_CAROLINA_ACOSTA_LEDESMA_2000_1.pdf",
        )
        .replace("PERDOMO2016_1", "PERDOMO_2016_1")
        .replace("SOSARIELLA_216", "SOSARIELLA_2016")
        .replace("221.035", "221035")
        .replace("991712_8", "991712#8")
        .replace("_.pdf", "")
        .replace("_pdf", "")
        .replace(".pdf", "")
        .strip()
        .replace("\n", "")
        .replace("-", "_")
        .replace(" ", "_")
        .replace(".", "_")
        .replace("1235021SANDRA", "1235021_SANDRA")
    )

    parts = cleaned.split("_")
    document = parts[0]

    last = "name"
    name = year = version = ""

    for part in parts[1:]:
        if last == "name":
            if part.isdigit():
                last = "year"
                year = part
            else:
                name += " " + part
        if last == "year" and len(part) == 1:
            version = part

    if year == "216":
        year = "2016"

    if not (len(version)):
        version = "1"

    name = name.strip()
    filename = file_name.replace("\n", "")

    if not year.isdigit() or int(year) < 1990:
        raise MalformedData(year, message="invalid year")
    if not version.isdigit() or int(version) > 2000:
        raise MalformedData(version, message="invalid version")

    return {
        "file_name": filename,
        "document": document,
        "name": name,
        "year": year,
        "version": version,
        "download_date": date,
    }


def extract_data_from_names(error_folder: str, ti, **kwargs) -> List[str]:
    output, error = list(), False
    for archivo in ti.xcom_pull(task_ids="download_new_PDFs_from_list", key="new"):
        try:
            output.append(extract_data_from_name(file_name=archivo[0], date=archivo[1]))
        except MalformedData as err_:
            print(f"\tSomething ocoured while parsing: {archivo[0]}")
            error_fname = os.path.join(error_folder, "names.pkl")
            try:
                error_list = pickle.load(open(error_fname, "rb"))
            except FileNotFoundError:
                error_list = list()
            except EOFError:
                error_list = list()
            err_ = {
                "file": archivo[0],
                "date_now": str(archivo[1]),
                "error": {"message": err_.message, "data": err_.data,},
            }
            print(err_)
            error_list.append(err_)
            pickle.dump(error_list, open(error_fname, "wb"))
            error = True
    if error:
        ti.xcom_push(key="some_failure", value=error)
    return output
