import shutil


def move(source: str, target: str, verbose=True):
    print(f"Moving '{source}' to '{target}'")
    shutil.move(source, target)
