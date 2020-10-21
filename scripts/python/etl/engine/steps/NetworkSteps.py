from __future__ import annotations
from typing import Callable, Optional
import urllib.parse as urlparse
import urllib.request as urllib2

from etl.engine.core.BaseStep import BaseStep
from etl.engine.core.Context import Context


class DownloadFile(BaseStep):
    __url: Optional[Callable[[Context], str]]
    __target_path: Optional[Callable[[Context], str]]

    def __init__(self):
        super().__init__("DownloadFile")
        self.__url = lambda c: "_INVALID_"
        self.__target_path = lambda c: "_INVALID_"

    def url_producer(self, url_provider: Callable[[Context], str]) -> DownloadFile:
        self.__url = url_provider
        return self

    def destination(self, path: Optional[Callable[[Context], str]]) -> DownloadFile:
        self.__target_path = path
        return self

    def prepare(self, ctx: Context) -> bool:
        url = self.__url(ctx)
        if url is None or url == "_INVALID_":
            return ctx.fail("No url was provided to download the file")

        target = self.__target_path(ctx)
        if target is None or target == "_INVALID_":
            return ctx.fail("No url was provided for the path to download")

        ctx.log(f"Downloading file {url}")
        return self.__download_file(url, target, ctx)

    def __download_file(self, url: str, dest: str, ctx: Context) -> bool:
        """
        Download and save a file specified by url to dest directory,
        """
        u = urllib2.urlopen(url)

        scheme, netloc, path, query, fragment = urlparse.urlsplit(url)

        with open(dest, 'wb') as f:
            meta = u.info()
            meta_func = meta.getheaders if hasattr(meta, 'getheaders') else meta.get_all
            meta_length = meta_func("Content-Length")
            file_size = None
            if meta_length:
                file_size = int(meta_length[0])
            ctx.log(f"Downloading: {url} Bytes: {file_size}")

            file_size_dl = 0
            block_sz = 8192
            while True:
                buffer = u.read(block_sz)
                if not buffer:
                    break

                file_size_dl += len(buffer)
                f.write(buffer)

                status = "{0:16}".format(file_size_dl)
                if file_size:
                    status += "   [{0:6.2f}%]".format(file_size_dl * 100 / file_size)
                status += chr(13)
                print(status, end="")
            print()
            ctx.log(f"Finished downloading to {dest}")

            return True
