from selenium.webdriver import Chrome, ChromeOptions
from time import sleep
import os
import fnmatch
from readCfg import read_config
from bs4 import BeautifulSoup

config = read_config(['local.properties', 'shared.properties'])

opts = ChromeOptions()
# opts.binary_location = config.get('chrome_location', '')

download_folder = config.get('global', 'download_folder')

prefs = {'download.default_directory': download_folder}
opts.add_experimental_option('prefs', prefs)
opts.add_argument('--headless')

driver = Chrome(options=opts)
driver.set_page_load_timeout(30000)
driver.implicitly_wait(30000)


def get_file_data(file_name):
    """
    saca ci, nombre, año y version del link y nombre del archivo
    """

    cleaned = file_name \
        .replace('OLGA_CAROLINA_ACOSTA_LEDESMA__1.pdf', 'OLGA_CAROLINA_ACOSTA_LEDESMA_2000_1.pdf') \
        .replace('PERDOMO2016_1', 'PERDOMO_2016_1') \
        .replace('SOSARIELLA_216', 'SOSARIELLA_2016') \
        .replace('221.035', '221035') \
        .replace('991712_8', '991712#8') \
        .replace("_.pdf", "") \
        .replace("_pdf", "") \
        .replace(".pdf", "") \
        .strip() \
        .replace("\n", "") \
        .replace("-", "_") \
        .replace(" ", "_") \
        .replace(".", "_")

    parts = cleaned.split("_")
    print(parts)
    document = parts[0]

    name = ''
    last = 'name'
    year = ''
    version = ''
    for part in parts[1:]:
        if last == 'name':
            if part.isdigit():
                last = 'year'
                year = part
            else:
                name += ' ' + part
        if last == 'year' and len(part) == 1:
            version = part

    if year == '216':
        year = '2016'

    return {
            'file_name': file_name.replace("\n", ""),
            'document': document,
            'name': name.strip(),
            'year': year,
            'version': version
           }


def find(pattern, path):
    """
    busca todos los pdfs del directorio
    """
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(name))
    return result


def get_local_list():
    to_ret = []
    prefix = "https://djbpublico.contraloria.gov.py/"
    with open('./cached_page.html', 'r') as content_file:
        content = content_file.read()
        soup = BeautifulSoup(content)

        links = soup.select('.pd-float > a')

        for link in links:
            to_ret.append(prefix + link['href'][1:])

    return to_ret


def get_pdfs(my_url):
    """
    guarda todos los links de la pagina contraloria en una lista
    """
    links = []
    driver.get(my_url)

    print("Finding all links")
    # el = driver.find_element_by_id("limit")
    # for option in el.find_elements_by_tag_name('option'):
        # if option.text == 'Todo':
            # print("Clicking on 'Todo', this will show all links, and is a very slow operation")
            # option.click()
            # break

    buttons = driver.find_elements_by_css_selector(".pd-button-download [href]")

    for link in buttons:
        current_link = link.get_attribute('href')
        print(current_link)
        links.append(current_link)

    return links


def check(links):
    """
    verificar si es que el archivo ya existe
    """
    c = 0
    to_ret = []
    for link in links:
        c += 1
        b = 0
        guion = link.find('-') + 1
        plbrlink = link[guion:]
        plbrlink = plbrlink.replace('-', '_')
        plbrlink = get_file_data(plbrlink)
        # Finds all pdfs in the directory
        nombres = find('*.pdf', download_folder)
        # print('Comparing: ' + link)
        for nombre in nombres:
            # print('\tWith: ' + nombre)
            nombre = get_file_data(nombre)
            if (nombre["document"] == plbrlink["document"] and
                    nombre["year"] == plbrlink["year"] and
                    nombre["version"] == plbrlink["version"]):
                print("El archivo ya existe: ", c)
                b = 1
                break

        if b == 0:
            to_ret.append(link)

    return to_ret


def descargar(link):
    """
    Downloads a PDF given its link
    """
    try:
        driver.get(link)
        driver.implicitly_wait(0)
        button = driver.find_element_by_id('pdlicensesubmit')
        button.click()
        sleep(2)
    except Exception as e:
        print("Error " + e)


def main():
    print("Getting list of pds")
    # links = get_pdfs("https://djbpublico.contraloria.gov.py/index.php")
    links = get_local_list()
    # print(links)
    print(f"Found {len(links)} links to download")
    filtered = check(links)
    print(f"Not downloaded: {len(filtered)} links to download")
    for link in filtered:
        print(f"Downloading {link}")
        descargar(link)


main()
