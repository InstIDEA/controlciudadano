import ssl
from typing import List

from _muni_operators import get_target_path
from _policia_operators import _get_links
from network_operators import download_links

ssl._create_default_https_context = ssl._create_unverified_context


def get_links() -> List[str]:
    to_download = _get_links(
        'https://www.mspbs.gov.py/ley-5282-14-funcionarios.html',
        '.item-mes a'
    )
    return to_download


if __name__ == "__main__":

    to_download = get_links()
    downloaded = download_links(to_download, "/tmp/mspbs")
    for download in downloaded:
        print(get_target_path(download, "2020-12-12"))
