import os
from pathlib import Path
from natsort import natsorted
import pandas as pd
import tabula
import time
import sys
import tempfile
import shutil
import re


def imprimir_csv(filepath, df_list) -> str:
    df = pd.concat(df_list, axis=0, ignore_index=True)
    new_df = df.iloc[:, [0, 1, 3, 4, 6, 7]]
    new_df.columns = ['Ci', 'Nombre', 'Monto', 'Concepto', 'Cargo', 'Ingreso']
    filepath_partido = filepath.split('/')
    nombre_pdf = filepath_partido[-1]
    # obtener cadena que corresponde con Mes_año
    matches = re.findall('[a-zA-Z]+[_-]\d{4}', nombre_pdf)
    mes, anho = re.split('-|_', matches[0])
    path_csv_final = f'{os.path.abspath(os.path.dirname(__file__))}/csv-final/Municipalidad_{mes}_{anho}.csv'
    new_df.to_csv(path_csv_final, index=False)
    return path_csv_final


def extraer_datos(path_archivo, indice):
    if indice == 1:
        # area = [y1,x1,y2,x2]
        # y1 = top ; x1 = left ; y2 = top+height ; x2 = left + widht
        # top, left, height, widht estan en notacion point (pt)
        # area es la zona del pdf donde tabula tiene que extraer los datos
        area = [100.6, 56.9, 528.5, 767.5]  # primera pagina
    else:
        area = [63.4, 56.9, 525.6, 767.5]  # demas paginas

    return tabula.read_pdf(path_archivo, pages='all', guess=False, area=area,
                           # delimitadores de columnas en el eje x
                           # delimitadores son los puntos entre las columnas para identificar el ancho de cada columna
                           columns=[92.6, 255.4, 299.8, 335.8, 462.2, 624.0, 720.7], pandas_options={'header': None})


def procesar_archivos(filepath: str) -> str:
    print(f'Procesando archivo: {filepath}\n')
    carpeta_pdf_parts = tempfile.TemporaryDirectory('pdf-parts')
    carpeta_jpeg = tempfile.TemporaryDirectory('jpeg')
    carpeta_jpeg_pdf = tempfile.TemporaryDirectory('jpeg-pdf')
    carpeta_pdf_searchable = tempfile.TemporaryDirectory('pdf-searchable')

    try:
        # directorio del archivo csv final
        Path(os.path.abspath(os.path.dirname(__file__)) + '/csv-final').mkdir(parents=True, exist_ok=True)
    except:
        print('No se pudo crear la carpeta ./csv-final')
        sys.exit()

    # comprobar existencia de ejecutables
    if shutil.which('pdfseparate') is None:
        print('No se encontro el ejecutable: pdfseparate')
        sys.exit()

    if shutil.which('pdftoppm') is None:
        print('No se encontro el ejecutable: pdftoppm')
        sys.exit()

    if shutil.which('img2pdf') is None:
        print('No se encontro el ejecutable: img2pdf')
        sys.exit()

    if shutil.which('ocrmypdf') is None:
        print('No se encontro el ejecutable: ocrmypdf')
        sys.exit()

    os.system(f'pdfseparate {filepath} {carpeta_pdf_parts.name}/part-%d')
    parts_list = os.listdir(carpeta_pdf_parts.name)

    # Para ordenar los nombres de las partes en orden "natural" ascendente
    parts_list = natsorted(parts_list)
    df_list = []
    indice = 1
    for nombre_pdf_part in parts_list:
        print(f'Procesando parte: {nombre_pdf_part}\n')

        print('pdftoppm')
        os.system(
            f'pdftoppm -singlefile -jpeg -r 300 -jpegopt quality=100 {carpeta_pdf_parts.name}/{nombre_pdf_part} {carpeta_jpeg.name}/{nombre_pdf_part}')

        print('img2pdf')
        os.system(
            f'img2pdf {carpeta_jpeg.name}/{nombre_pdf_part}.jpg -o {carpeta_jpeg_pdf.name}/{nombre_pdf_part}-jpeg.pdf')

        print('ocrmypdf')
        os.system(
            f'ocrmypdf -f --tesseract-pagesegmode 6 --jpeg-quality 100 -l spa {carpeta_jpeg_pdf.name}/{nombre_pdf_part}-jpeg.pdf {carpeta_pdf_searchable.name}/{nombre_pdf_part}-jpeg-ocr.pdf')

        print('tabula')
        df_list += extraer_datos(f'{carpeta_pdf_searchable.name}/{nombre_pdf_part}-jpeg-ocr.pdf', indice)
        indice += 1

    print("csv final")
    return imprimir_csv(filepath, df_list)


def validacion_pdf(filepath: str):
    filepath_partido = filepath.split('/')
    nombre_pdf = filepath_partido[-1]
    # encontrar cadena que corresponda con la expresion regular
    matches = re.findall('\d{4}-\d{2}-\d{2}_[a-z0-9]+_[a-zA-Z]+[_-]\d{4}.pdf', nombre_pdf)
    if len(matches) != 1:
        print("El nombre del pdf no corresponde al patron: downloadDate(%y-%MM-%dd)hashDocument(%Mon_%y).pdf")
        sys.exit()


if __name__ == '__main__':
    # validar la cantidad de argumentos pasados por linea de comando
    if len(sys.argv) != 2:
        print(
            'Falta el argumento pathfile. Ejemplo: python3 parseo_municipalidad_asu.py /home/root/Documents/2020-12-12_fbfefbfa75182dfe655df641c016f900_Octubre_2020.pdf')
        sys.exit()
    filepath: str = str(sys.argv[1])
    if not os.path.isfile(filepath):
        print(f'No existe el archivo: {filepath}')
        sys.exit()

    validacion_pdf(filepath)
    start = time.time()
    csvfilePath = procesar_archivos(filepath)
    print(f'El filepath del csv resultante es: {csvfilePath}')
    end = time.time()
    print(f"El tiempo transcurrido total en minutos: {(end - start) / 60}")
