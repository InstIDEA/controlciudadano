import datetime
import math
import os
from typing import List
from urllib.parse import urlparse

import pytz
import requests
from airflow import AirflowException
from dateutil.parser import parse as parsedate


def download_file_if_changed(
        url: str,
        target: str
):
    print(f"Downloading file {url} to {target}")

    head_info = requests.head(url)

    if head_info.status_code != requests.codes.ok:
        raise NetworkError(f"The url '{url}' returned {head_info.status_code}")

    url_date = datetime.datetime(3000, 1, 1, 0, 0, 0).replace(tzinfo=pytz.UTC)
    if 'last-modified' in head_info.headers:
        url_time = head_info.headers['last-modified']
        url_date = parsedate(url_time)

    print(head_info.headers)
    if 'Content-Length' in head_info.headers:
        file_size = head_info.headers['Content-Length']
        batch_size = math.ceil(int(file_size) / 20) + 20
        if file_size.isdigit():
            file_size = f"{file_size} ({humansize(int(file_size))})"
    else:
        file_size = 'Unknown'
        batch_size = 16384

    should_download = True

    if os.path.exists(target):
        if os.path.getsize(target) == 0:
            print(f"The file {target} is empty, re-downloading")
        else:
            file_time = datetime.datetime.fromtimestamp(os.path.getmtime(target)).replace(tzinfo=pytz.UTC)
            print(f"Comparing {url_date} with {file_time}")
            if url_date < file_time:
                should_download = False
                print(f"The current file is the same as the last one that was downloaded ({url_date})")
    else:
        print(f"The file {target} does not exists, downloading")

    if should_download:
        with open(target, 'wb') as target_file:
            downloaded = 0
            req = requests.get(url, stream=True)

            if req.status_code != requests.codes.ok:
                raise NetworkError(f"The url {url} returned {req.status_code}")

            for data in req.iter_content(batch_size):
                target_file.write(data)
                downloaded = downloaded + batch_size
                print(f"Downloading file {url}. {downloaded} ({humansize(downloaded)}) of {file_size}")


def download_file(
        url: str,
        target: str
):
    """
    Performs a get and downloads the file
    :param url: the file path
    :param target: the local folder to download the file
    :return: None
    """
    print(f"Downloading file {url} to {target}")

    with open(target, 'wb') as target_file:
        downloaded = 0
        req = requests.get(url, stream=True)

        if 'Content-Length' in req.headers:
            file_size: str = req.headers['Content-Length']
            batch_size = math.ceil(int(file_size) / 20) + 20
            if file_size.isdigit():
                file_size = f"{file_size} ({humansize(int(file_size))})"
        else:
            file_size = 'Unknown'
            batch_size = 16384

        if req.status_code != requests.codes.ok:
            raise NetworkError(f"The url {url} returned {req.status_code}")

        for data in req.iter_content(batch_size):
            target_file.write(data)
            downloaded = downloaded + batch_size
            print(f"Downloading file {url}. {downloaded} ({humansize(downloaded)}) of {file_size}")


def download_links(links: List[str], folder: str) -> List[str]:
    """
    Downloads all links to a folder and return the list of downloaded files
    :param links: the links to download
    :param folder:  the target folder
    :return: the list of downloaded files
    """

    to_ret = []
    for link in links:
        a = urlparse(link)
        file_name = os.path.basename(a.path)
        full_name = os.path.join(folder, file_name)
        to_ret.append(full_name)
        if not os.path.exists(full_name):
            download_file(link, full_name)

    return to_ret

suffixes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
def humansize(nbytes: int) -> str:
    i = 0
    while nbytes >= 1024 and i < len(suffixes)-1:
        nbytes /= 1024.
        i += 1
    f = ('%.2f' % nbytes).rstrip('0').rstrip('.')
    return '%s %s' % (f, suffixes[i])


class NetworkError(AirflowException):
    pass
