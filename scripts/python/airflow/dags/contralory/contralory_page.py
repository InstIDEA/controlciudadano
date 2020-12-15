import re
import os

from bs4 import BeautifulSoup
from fnmatch import fnmatch
from pathlib import Path
from typing import List, Tuple
import requests
import pickle


def print_req_err_(r, ti, error_folder):
    print(f"\tSomething ocoured while trying to get: {r.history[0].url}")
    error_file = os.path.join(error_folder, "downloads.pkl")
    try:
        error_list = pickle.load(open(error_file, "rb"))
    except Exception:
        error_list = list()
    err_ = {
        "status_code": r.status_code,
        "url": r.history[0].url,
        "headers": r.headers
    }
    print(err_)
    error_list.append(err_)
    pickle.dump(error_list, open(error_file, "wb"))
    r.raise_for_status()


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


def get_page(url: str,
             session: requests.Session = False,
             ) -> Tuple[requests.Response, requests.Session]:
    if not(session):
        session = requests.Session()
    response, i = False, 0
    while not response:
        if i == 5:
            raise(Exception(
                f'Network failure: Can\'t connect to: {url}'
            ))
        try:
            response = session.get(url)
        except Exception:
            response = False
            i += 1
    return response, session


def post_page(url: str,
              session: requests.Session,
              data: dict = {}
              ) -> Tuple[requests.Response, requests.Session]:
    response, i = False, 0
    while not response:
        if i == 5:
            raise(Exception(
                f'Network failure: Can\'t connect to: {url}'
            ))
        try:
            response = session.post(url, data=data)
        except Exception:
            response = False
            i += 1
    return response, session


def contraloria_get_urls(contraloria_url: str,
                         error_folder: str,
                         ti,
                         **kwargs) -> List[str]:
    """
    Dada la pagina web de la contraloria publica del paraguay:
    Obtener lista de URLs que apunta a los PDFs
    """
    s = requests.Session()

    urlist = []

    print(f"Consiguiendo links de: {contraloria_url}")

    r, s = get_page(url=contraloria_url)

    if r.ok:
        page_content = r.content
        page_soup = BeautifulSoup(page_content, "html.parser")
        imput_list = page_soup.findAll("input", {"type": "hidden",
                                                 "value": "1"})
        magic_number = imput_list[0].get("name")
        post_data = {magic_number: "1", "limit": "0"}

        r_url, s = post_page(url=contraloria_url, session=s, data=post_data)

        if r_url.ok:
            URLs = BeautifulSoup(r_url.content, "html.parser")
            for btn in URLs.findAll("a", {"class": "btn btn-success"}):
                urlist.append(contraloria_url + btn.get("href")[1:])
            print(f"Obtenidos: {str(len(urlist))} Links")
            return urlist
        else:
            print_req_err_(r_url, ti, error_folder)
    else:
        print_req_err_(r, ti, error_folder)


def contraloria_download_pdfs(targetDir: str,
                              error_folder: str,
                              ti,
                              **kwargs) -> List[str]:
    """
    Dada una lista de URLs, descargar los PDF
    si no estan en la carpeta de descargas
    """

    Path(targetDir).mkdir(parents=True, exist_ok=True)
    Path(error_folder).mkdir(parents=True, exist_ok=True)

    cache_list = find(path=os.path.join(targetDir))

    new = list()
    URList = ti.xcom_pull(
        task_ids="get_directory_listing_from_contralory_page")

    URList_len = len(URList)

    print(f"Bajando {str(URList_len)} pdfs")

    for i, paged in enumerate(URList):
        error = False
        if not (i % 100):
            s = requests.Session()
            print(f"\tBajados {str(i)} de {str(URList_len)}")
        page_soup = BeautifulSoup(s.get(paged).content, "html.parser")
        import_list = page_soup.findAll("input", {"type": "hidden",
                                                  "value": "1"})
        magic_number = import_list[1].get("name")

        data = {
            "submit": "Descarga",
            "license_agree": "1",
            "download": paged.split("/")[-1].split("-")[0],
            magic_number: "1"
        }

        try:
            r, s = post_page(url=paged, session=s, data=data)
            if r.ok:
                try:
                    fname = re.findall("filename=(.+)",
                                    r.headers["content-disposition"])
                    fname = fname[0].replace('"', "").replace("'", "")
                    if not (fname in cache_list):
                        print(f"Downloading {fname}")
                        outfile = os.path.join(targetDir, fname)
                        with open(outfile, "wb") as targetFile:
                            targetFile.write(r.content)
                        new.append(fname)
                except Exception:
                    error = True
            else:
                error = True
        except Exception:
            error = True
        if error:
            print(f"\tSomething ocoured while trying to get: {paged}")
            error_file = os.path.join(error_folder, "downloads.pkl")
            try:
                error_list = pickle.load(open(error_file, "rb"))
            except FileNotFoundError:
                error_list = list()
            except EOFError:
                error_list = list()
            if (type(r) is requests.Request):
                err_ = {
                    "status_code": r.status_code,
                    "url": paged,
                    "headers": r.headers,
                }
            else:
                err_ = {
                    'status_code': 'Network Error',
                    'headders': None,
                    'url': paged,
                }
            print(err_)
            error_list.append(err_)
            pickle.dump(error_list, open(error_file, "wb"))

    print(f"{str(len(new))} Archivos Descargados)")
    print(f"[{len(find(path=targetDir))}] archivos en cache.")
    return(new)
