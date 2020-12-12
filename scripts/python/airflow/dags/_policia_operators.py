from typing import List

import requests
from bs4 import BeautifulSoup

from _muni_operators import get_target_path
from network_operators import download_links


def _get_links(
        base_link: str,
        css_selector: str
) -> List[str]:
    """
    Retrieve all 'href' links using a selector of a given url
    :param base_link the link to fetch
    :param css_selector the selector, must return a list of 'a' tags
    :return: an array of links
    """
    url = base_link
    req = requests.get(url)
    html = req.text

    print(html)
    soup = BeautifulSoup(html, features="html.parser")
    to_ret = []

    for link in soup.select(css_selector):
        href: str = link.get("href")
        print("Link: " + href)
        if link in to_ret:
            print(f"Duplicated links found: {link}")
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

def get_links() -> List[str]:
    to_download = _get_links(
        'https://www.policianacional.gov.py/nomina-de-salarios-de-personal-de-la-policia-nacional/',
        '.column-2 > a'
    )
    to_download.extend(_get_links(
        'https://www.policianacional.gov.py/convenio-y-contratos-celebrados-objeto-monto-total-de-la-contratacion-plazos-de-ejecucion-mecanismos-de-control-y-rendicion-de-cuentas/',
        '.entry-content a'
    ))
    to_download.extend(_get_links(
        'https://www.policianacional.gov.py/viaticos/',
        'td > a'
    ))
    to_download.extend(only_files(_get_links(
        'https://www.policianacional.gov.py/ley-n-518914-de-libre-acceso-ciudadano-a-la-informacion-publica-y-transparencia-gubernamental-articulo-n-8/',
        '.column-2 > a'
    )))
    to_download.extend(only_files(_get_links(
        'https://www.policianacional.gov.py/ley-n-5282-de-libre-acceso-ciudadano-a-la-informacion-publica-y-transparencia-gubernamental/',
        '.column-2 > a'
    )))
    to_download.extend(_get_links(
        'https://www.policianacional.gov.py/informe-anual-sobre-derechos-humanos-y-situacion-carcelaria-con-especial-enfasis-en-los-derechos-sociales-a-la-salud-y-a-la-educacion/',
        'td a'
    ))
    return to_download


if __name__ == "__main__":
    to_download = get_links()
    downloaded = download_links(to_download, "/tmp/poli")
    for download in downloaded:
        print(get_target_path(download, "2020-12-12"))
