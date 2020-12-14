import json
import sys
import re
import os

from datetime import datetime as dt
from bs4 import BeautifulSoup
from fnmatch import fnmatch
from pathlib import Path
from typing import List
import requests
import pickle

def find(path: str, pattern: str = '*.pdf') -> List[str]:
    """
    busca todos los pdfs del directorio
    """
    result = []
    for _, _, files in os.walk(path):
        for name in files:
            if fnmatch(name, pattern):
                result.append(os.path.join(name))
    return(result)

def contraloria_get_urls(contraloria_url: str, ti, **kwargs) -> List[str]:
    '''
    Dada la pagina web de la contraloria publica del paraguay:
    Obtener lista de URLs que apunta a los PDFs
    '''
    s = requests.Session()
    urlist = []
    
    print(f"Consiguiendo links de: {contraloria_url}")
    
    r = s.get(contraloria_url)
    
    if(r.ok):
        page_content = r.content
        page_soup = BeautifulSoup(page_content, 'html.parser')
        imput_list = page_soup.findAll("input", {'type': 'hidden', 'value': '1'})
        magic_number = imput_list[0].get('name')
        post_data = {magic_number: '1', 'limit': '0'}
        r_url = s.post(contraloria_url, data=post_data)

        if(r_url.ok):
            URLs = BeautifulSoup(r_url.content, 'html.parser')
            for btn in (URLs.findAll('a', {'class': 'btn btn-success'})):
                urlist.append(contraloria_url + btn.get('href')[1:])
            print(f'Obtenidos: {str(len(urlist))} Links')
            ti.xcom_push(key='some_failure', value=False)
            return(urlist)
        else:
            ti.xcom_push(key='some_failure', value=True)
            r_url.raise_for_status()
    else:
        ti.xcom_push(key='some_failure', value=True)
        r_url.raise_for_status()

def contraloria_download_pdfs(targetDir: str, error_folder: str, ti, **kwargs) -> str:
    '''
    Dada una lista de URLs, descargar los PDF
    si no estan en la carpeta de descargas
    '''
    
    error = False
    
    Path(targetDir).mkdir(parents=True, exist_ok=True)
    Path(error_folder).mkdir(parents=True, exist_ok=True)

    cache_list = find(path=os.path.join(targetDir), pattern='*.pdf')
    
    URList = ti.xcom_pull(task_ids='get_directory_listing_from_contralory_page')

    URList_len = len(URList)
    
    print(f'Bajando {str(URList_len)} pdfs')
    
    for i, paged in enumerate(URList):
        new, error = list(), False
        if not(i % 100):
            s = requests.Session()
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

        if(r.ok):
            try:
                fname = re.findall("filename=(.+)", r.headers['content-disposition'])
                fname = fname[0].replace('"', '').replace("'", "")
                if not(fname in cache_list):
                    print(f'Downloading {fname}')
                    outfile = os.path.join(targetDir, fname)
                    with open(outfile, 'wb') as targetFile:
                        targetFile.write(r.content)
                    new.append((fname, dt.now(),))
            except:
                error = True
        else:
            error = True
        if(error):
            print(f'\tSomething ocoured while trying to get: {paged}')
            error_file = os.path.join(error_folder, 'downloads.pkl')
            try:
                error_list = pickle.load(open(error_file, 'rb'))
            except FileNotFoundError:
                error_list = list()
            except EOFError:
                error_list = list()
            error_list.append({'status_code': r.status_code,
                               'headers': r.headers, 'url': paged})
            pickle.dump(error_list, open(error_file, 'wb'))
            error = True
    
    ti.xcom_push(key='some_failure', value=error)

    asdasd = os.path.join('.pdf')
    print(f'{str(i)} Archivos Descargados)')
    print(f'[{len(find(asdasd, targetDir))}] archivos en cache.')
    ti.xcom_push(key='new', value=new)
