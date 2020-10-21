from __future__ import annotations

import os.path
import zipfile
from pathlib import Path
from typing import Callable
import hashlib

from etl.engine.core.BaseStep import BaseStep
from etl.engine.core.Condition import BaseCondition
from etl.engine.core.Context import Context


class AssureFolderExists(BaseStep):

    def __init__(self, folder: str):
        super().__init__(f"AssureFolderExists {folder}")
        self.__folder = folder

    def prepare(self, ctx: Context) -> bool:
        Path(self.__folder).mkdir(parents=True, exist_ok=True)
        return True


class UnzipFile(BaseStep):

    def __init__(self):
        super().__init__("UnzipFile")
        self.__zip_file = lambda c: "_INVALID_"
        self.__target_folder = lambda c: "_INVALID_"
        self.__single_file = False

    def path(self, param: Callable[[Context], str]) -> UnzipFile:
        self.__zip_file = param
        return self

    def target(self, param: Callable[[Context], str]) -> UnzipFile:
        self.__target_folder = param
        return self

    def single_file(self, param: bool) -> UnzipFile:
        self.__single_file = param
        return self

    def prepare(self, ctx: Context) -> bool:

        zip_file = self.__zip_file(ctx)
        if zip_file is None or zip_file == "_INVALID_":
            return ctx.fail("No url was provided to download the file")

        target = self.__target_folder(ctx)
        if target is None or target == "_INVALID_":
            return ctx.fail("No url was provided for the path to download")

        single_file = self.__single_file

        ctx.log(f"Unzipping file {zip_file} to {target} (is single {single_file})")

        with zipfile.ZipFile(zip_file, "r") as zip_ref:
            if not single_file:
                zip_ref.extractall(target)
                return True

            if len(zip_ref.namelist()) != 1:
                return ctx.fail(f"The zip file {zip_file} has {len(zip_ref.filelist)} files, can't proceed")

            first = zip_ref.namelist()[0]
            zip_ref.extract(first, "/tmp")
            unzipped_path = os.path.join("/tmp", first)
            if os.path.isfile(unzipped_path):
                os.rename(unzipped_path, target)
            else:
                ctx.fail(f"We unzipped the file {unzipped_path} from the zip {zip_file} but the file does not exist")

        return True


class CalculateHash(BaseStep):

    __file_path: Callable[[Context], str]
    __store_key: str

    def __init__(self):
        super().__init__("CalculateHash")
        self.__file_path = lambda c: "_INVALID_"
        self.__store_key = "FILE_HASH"

    def file(self, clb: Callable[[Context], str]) -> CalculateHash:
        self.__file_path = clb
        return self

    def store_key(self, key: str) -> CalculateHash:
        self.__store_key = key
        return self

    def prepare(self, ctx: Context) -> bool:

        path = self.__file_path(ctx)

        if path is None or path == "_INVALID_":
            ctx.fail("Please provide a file on CalculateHash step")

        ctx.put(self.__store_key, self.__do_hash(path))

        return True

    def __do_hash(self, path: str) -> str:
        BUF_SIZE = 65536  # lets read stuff in 64kb chunks!

        md5 = hashlib.md5()
        sha1 = hashlib.sha1()

        with open(path, 'rb') as f:
            while True:
                data = f.read(BUF_SIZE)
                if not data:
                    break
                md5.update(data)
                sha1.update(data)

        return md5.hexdigest()


class FileExists(BaseCondition):
    __path_producer: Callable[[Context], str]

    def __init__(self):
        self.__path_producer = lambda ctx: ""

    def exist(self, path_producer: Callable[[Context], str]):
        self.__path_producer = path_producer
        return self

    def match(self, ctx: Context):
        path = self.__path_producer(ctx)

        if path is None or path == "":
            ctx.fail("Please provide a file on FileExists condition")
            return False

        return os.path.isfile(path)


class FileConditions:

    @classmethod
    def exists(cls, path: Callable[[Context], str]) -> BaseCondition:
        return FileExists().exist(path)
