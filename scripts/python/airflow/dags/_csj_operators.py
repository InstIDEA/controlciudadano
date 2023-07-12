from typing import List

from _muni_operators import get_target_path
from _policia_operators import _get_links, only_files
from network_operators import download_links


def get_links() -> List[str]:
    to_download = only_files(_get_links(
        'https://www.pj.gov.py/contenido/943-nomina-de-magistrados-y-funcionarios/943',
        '.mainContent a'
    ))
    return to_download


if __name__ == "__main__":
    to_download = get_links()
    downloaded = download_links(to_download, "/tmp/csj")
    for download in downloaded:
        print(get_target_path(download, "2020-12-12"))
