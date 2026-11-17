import os
import re
import urllib.parse
from typing import List, Set

import requests
from bs4 import BeautifulSoup

from _muni_operators import get_target_path
from network_operators import download_links, NetworkError

DRIVE_FOLDER_RE = re.compile(r"drive\.google\.com/drive/(?:u/\d+/)?folders/([\w-]+)")
DRIVE_FILE_RE = re.compile(r"drive\.google\.com/(?:file/d/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)")


def _get_links(
        base_link: str,
        css_selector: str,
        verify=True
) -> List[str]:
    """
    Retrieve all 'href' links using a selector of a given url
    :param base_link the link to fetch
    :param css_selector the selector, must return a list of 'a' tags
    :return: an array of links
    """
    url = base_link
    req = requests.get(url, verify=verify)
    if req.status_code != requests.codes.ok:
        print(f"WARNING: {url} returned {req.status_code}, 0 links from this page")
    html = req.text

    print(html)
    soup = BeautifulSoup(html, features="html.parser")
    to_ret = []

    for link in soup.select(css_selector, href=True):
        href: str = link.get("href")
        if href is None:
            continue
        # el sitio tiene hrefs con espacios al inicio/fin (" https://...pdf ")
        href = href.strip()

        if not href.startswith("http"):
            """It's a relative_path"""
            final_path = urllib.parse.urljoin(base_link, href)
            print(f"Found relative path {href}, changing to {final_path}")
            href = final_path

        print("Link: " + href)
        if href in to_ret:
            print(f"Duplicated link found: {href}")
        else:
            to_ret.append(href)

    return to_ret


def is_url_for_file(link: str) -> bool:
    if link is None:
        return False
    if link.endswith('.pdf'):
        return True
    if link.endswith('.xlsx') or link.endswith('.xls'):
        return True
    return False


def only_files(links: List[str]) -> List[str]:
    return [link for link in links if is_url_for_file(link)]


def only_files_or_drive(links: List[str]) -> List[str]:
    """
    Como only_files pero primero abre las carpetas de Drive, para no descartar
    los archivos publicados en Google Drive (sus links no terminan en .pdf).
    """
    return [link for link in expand_drive_links(links) if is_url_for_file(link) or is_drive_file(link)]


def is_drive_file(link: str) -> bool:
    return DRIVE_FILE_RE.search(link) is not None


def _drive_folder_files(folder_id: str, seen_folders: Set[str]) -> List[str]:
    """
    Lista los archivos de una carpeta pública de Google Drive (y sus subcarpetas)
    usando la vista embebida, que no requiere login ni API key.
    :return: links normalizados https://drive.google.com/file/d/<id>/view
    """
    if folder_id in seen_folders:
        return []
    seen_folders.add(folder_id)

    req = requests.get(f"https://drive.google.com/embeddedfolderview?id={folder_id}")
    soup = BeautifulSoup(req.text, features="html.parser")
    to_ret = []
    for a in soup.select("a[href]"):
        href = a.get("href")
        sub_folder = DRIVE_FOLDER_RE.search(href)
        if sub_folder:
            to_ret.extend(_drive_folder_files(sub_folder.group(1), seen_folders))
            continue
        file_id = DRIVE_FILE_RE.search(href)
        if file_id:
            print(f"Drive folder {folder_id}: {a.get_text(strip=True)}")
            to_ret.append(f"https://drive.google.com/file/d/{file_id.group(1)}/view")
    return to_ret


def expand_drive_links(links: List[str]) -> List[str]:
    """
    Reemplaza las carpetas de Drive por los archivos que contienen y normaliza los links a
    archivos de Drive. El resto de los links quedan igual. Quita duplicados.
    """
    to_ret = []
    seen_folders = set()
    for link in links:
        folder = DRIVE_FOLDER_RE.search(link)
        if folder:
            expanded = _drive_folder_files(folder.group(1), seen_folders)
        else:
            file_id = DRIVE_FILE_RE.search(link)
            expanded = [f"https://drive.google.com/file/d/{file_id.group(1)}/view"] if file_id else [link]
        for item in expanded:
            if item not in to_ret:
                to_ret.append(item)
    return to_ret


def _get_salary_links() -> List[str]:
    """
    La página de nómina ya no enlaza archivos: enlaza una subpágina por año (salarios-pn-2022, ...)
    y cada subpágina tiene PDFs en wp-content y/o carpetas de Google Drive.
    """
    year_pages = _get_links(
        'https://www.policianacional.gov.py/nomina-de-salarios-de-personal-de-la-policia-nacional/',
        '.column-2 > a'
    )
    to_ret = []
    for page in year_pages:
        if is_url_for_file(page) or is_drive_file(page) or DRIVE_FOLDER_RE.search(page):
            to_ret.append(page)
            continue
        # la subpágina sin "/" final a veces responde 403
        to_ret.extend(_get_links(page.rstrip('/') + '/', '.column-2 a'))
    return [link for link in expand_drive_links(to_ret) if is_url_for_file(link) or is_drive_file(link)]


def download_drive_file(link: str, folder: str) -> str:
    """
    Descarga un archivo público de Google Drive. Si es grande, Drive responde primero una página
    "no se puede analizar en busca de virus" con un formulario de confirmación: se envía ese formulario.
    El nombre del archivo se toma del header Content-Disposition.
    :return: la ruta local del archivo descargado
    """
    file_id = DRIVE_FILE_RE.search(link).group(1)
    req = requests.get(f"https://drive.usercontent.google.com/download?id={file_id}&export=download", stream=True)

    if 'text/html' in req.headers.get('Content-Type', ''):
        soup = BeautifulSoup(req.text, features="html.parser")
        form = soup.find("form")
        if form is None or not form.get("action"):
            raise NetworkError(f"Drive file {file_id} is not public or can't be downloaded")
        params = {i["name"]: i.get("value", "") for i in form.select("input[name]")}
        req = requests.get(form["action"], params=params, stream=True)

    if req.status_code != requests.codes.ok or 'text/html' in req.headers.get('Content-Type', ''):
        raise NetworkError(f"Drive file {file_id} returned {req.status_code} {req.headers.get('Content-Type')}")

    name = re.search(r'filename="?([^";]+)"?', req.headers.get('Content-Disposition', ''))
    file_name = os.path.basename(name.group(1)) if name else f"{file_id}.pdf"
    full_name = os.path.join(folder, file_name)

    if os.path.exists(full_name):
        print(f"{full_name} already downloaded")
        req.close()
        return full_name

    print(f"Downloading drive file {file_id} to {full_name}")
    with open(full_name, 'wb') as target_file:
        for data in req.iter_content(1024 * 1024):
            target_file.write(data)
    return full_name


def download_poli_links(links: List[str], folder: str) -> List[str]:
    """
    Igual que network_operators.download_links pero también descarga archivos de Google Drive.
    """
    to_ret = []
    for link in links:
        if is_drive_file(link):
            to_ret.append(download_drive_file(link, folder))
        else:
            to_ret.extend(download_links([link], folder))
    return to_ret


def get_links() -> List[str]:
    to_download = _get_salary_links()
    to_download.extend(_get_links(
        'https://www.policianacional.gov.py/convenio-y-contratos-celebrados-objeto-monto-total-de-la-contratacion-plazos-de-ejecucion-mecanismos-de-control-y-rendicion-de-cuentas/',
        '.entry-content a'
    ))
    to_download.extend(_get_links(
        'https://www.policianacional.gov.py/viaticos/',
        'td > a'
    ))
    to_download.extend(only_files_or_drive(_get_links(
        'https://www.policianacional.gov.py/ley-n-518914-de-libre-acceso-ciudadano-a-la-informacion-publica-y-transparencia-gubernamental-articulo-n-8/',
        '.column-2 > a'
    )))
    to_download.extend(only_files_or_drive(_get_links(
        'https://www.policianacional.gov.py/ley-n-5282-de-libre-acceso-ciudadano-a-la-informacion-publica-y-transparencia-gubernamental/',
        '.column-2 > a'
    )))
    to_download.extend(_get_links(
        'https://www.policianacional.gov.py/informe-anual-sobre-derechos-humanos-y-situacion-carcelaria-con-especial-enfasis-en-los-derechos-sociales-a-la-salud-y-a-la-educacion/',
        'td a'
    ))
    # viáticos e informes también enlazan archivos/carpetas de Google Drive
    return expand_drive_links(to_download)


if __name__ == "__main__":
    to_download = get_links()
    downloaded = download_poli_links(to_download, "/tmp/poli")
    for download in downloaded:
        print(get_target_path(download, "2020-12-12"))
