import requests
import os
import re

from typing import List
from bs4 import BeautifulSoup

from readCfg import read_config
from fnmatch import fnmatch

config = read_config(['local.properties', 'shared.properties'])

download_folder = config.get('global', 'download_folder')
contraloria_py = 'https://djbpublico.contraloria.gov.py/'

def find(pattern: str, path: str) -> List[str]:
    """
    busca todos los pdfs del directorio
    """
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch(name, pattern):
                result.append(os.path.join(name))
    return(result)


def contraloria_get_url(page: str = contraloria_py) -> List[str]:
    '''
    Dada la pagina web de la contraloria publica del paraguay:
    Obtener lista de URLs que apunta a los PDFs
    '''
    s = requests.Session()

    print(f'Consiguiendo links de: {page}')
    page_content = s.get(page).content
    page_soup = BeautifulSoup(page_content, 'html.parser')
    imput_list = page_soup.findAll("input", {'type': 'hidden', 'value': '1'})
    magic_number = imput_list[0].get('name')
    post_data = {magic_number: '1', 'limit': '0'}

    URLs = BeautifulSoup(s.post(page, data=post_data).content, 'html.parser')

    urlist = []
    for btn in (URLs.findAll('a', {'class': 'btn btn-success'})):
        urlist.append(page + btn.get('href')[1:])
    print(f'Obtenidos: {str(len(urlist))} Links')
    return(urlist)


def contraloria_download_pdfs(urlist: List[str], targetDir: str) -> None:
    '''
    Dada una lista de URLs, descargar los PDF
    si no estan en la carpeta de descargas
    '''
    cache_list = find('*.pdf', targetDir)

    s = requests.Session()
    URList_len = len(urlist)
    print(f'Bajando {str(URList_len)} pdfs:')
    for i, paged in enumerate(urlist):
        if not(i % 50):
            print(f'\tBajados {str(i)} de {str(URList_len)}')
        page_soup = BeautifulSoup(s.get(paged).content, 'html.parser')
        import_list = page_soup.findAll("input", {'type': 'hidden',
                                                  'value': '1'})
        magic_number = import_list[1].get('name')

        r = s.post(paged, data={
            'submit': 'Descarga',
            'license_agree': '1',
            'download': paged.split('/')[-1].split('-')[0],
            magic_number: '1'
            })

        fname = re.findall("filename=(.+)", r.headers['content-disposition'])
        fname = fname[0].replace('"', '').replace("'", "")
        if not(fname in cache_list):
            print(f"Downloading {fname}...")
            with open(os.path.join(targetDir, fname), 'wb') as targetFile:
                targetFile.write(r.content)
    print(f"{str(i)} Archivos Descargados")
    print(f"ahora hay {len(find('*.pdf', targetDir))} archivos en cache.")


def main():
    contraloria_download_pdfs(urlist=contraloria_get_url(page=contraloria_py),
                              targetDir=download_folder)


main()
