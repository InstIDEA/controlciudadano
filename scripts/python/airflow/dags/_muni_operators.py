import os
from typing import List

import requests
from bs4 import BeautifulSoup

from ds_table_operations import calculate_hash_of_file
from network_operators import download_links


def get_links() -> List[str]:
    """
    Downloads all links from www.asuncion.gov.py
    :return: an array of links
    """
    url = 'https://www.asuncion.gov.py/'
    req = requests.get(url)
    html = req.text

    print(html)
    soup = BeautifulSoup(html, features="html.parser")
    to_ret = []

    for link in soup.select("a.ubermenu-target"):
        href: str = link.get("href")

        if href is not None and 'wp-content' in href:
            print("Link: " + href)
            to_ret.append(href)

    return to_ret


def get_target_path(local_path: str, prefix: str) -> str:
    """
    Returns the target path of a local file
    :param local_path: the local path of the file, only the basename is used
    :return: the target path, with the format "prefix_hash_basename"
    """
    file_hash = calculate_hash_of_file(local_path)
    basename = os.path.basename(local_path)
    return f"{prefix}_{file_hash}_{basename}"


if __name__ == "__main__":
    to_download = get_links()
    downloaded = download_links(to_download, "/tmp/muni")
    for download in downloaded:
        print(get_target_path(download, "2020-12-09"))
