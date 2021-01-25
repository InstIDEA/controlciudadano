import os
import shutil


def move(source: str, target: str, verbose=True):
    print(f"Moving '{source}' to '{target}'")
    shutil.move(source, target)


def get_file_size(file: str):
    try:
        return os.path.getsize(file)
    except OSError as oe:
        print(f"Error reading file size: {str(oe)}")
        return 0
