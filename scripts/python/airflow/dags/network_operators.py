import datetime
import math
import os

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
                print(f"Downloading file {url}. {downloaded} of {file_size}")


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
            file_size = req.headers['Content-Length']
            batch_size = math.ceil(int(file_size) / 20) + 20
        else:
            file_size = 'Unknown'
            batch_size = 16384

        if req.status_code != requests.codes.ok:
            raise NetworkError(f"The url {url} returned {req.status_code}")

        for data in req.iter_content(batch_size):
            target_file.write(data)
            downloaded = downloaded + batch_size
            print(f"Downloading file {url}. {downloaded} of {file_size}")


class NetworkError(AirflowException):
    pass
