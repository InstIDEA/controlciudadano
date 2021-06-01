import os
from pathlib import Path
from natsort import natsorted
import pandas as pd
import tabula
import time

def imprimir_csv(path_archivo, df_list):
    df = pd.concat(df_list, axis=0, ignore_index=True)
    new_df = df.iloc[:, [0, 1, 3, 4, 6, 7]]
    new_df.columns = ['Ci', 'Nombre', 'Monto', 'Concepto', 'Cargo', 'Ingreso']
    new_df.to_csv(path_archivo, index=False)


def extraer_datos(path_archivo, indice):
    if indice == 1:
        #estos valores salen del photogimp, notacion point
        area = [100.6, 56.9, 528.5, 767.5]
    else:
        area = [63.4, 56.9, 525.6, 767.5]

    return tabula.read_pdf(path_archivo, pages='all', guess=False, area=area,
                           columns=[92.6, 255.4, 299.8, 335.8, 462.2, 624.0, 720.7], pandas_options={'header': None})


def procesar_archivos():
    print(f'Inicio de procesamiento de archivos\n')

    files = os.listdir('./pdfs')
    for nombre_archivo in files:
        start = time.time()
        print(f'Procesando archivo: {nombre_archivo}\n')
        nombre_pdf = nombre_archivo.split('.')[0]
        nombre_carpeta_pdf_parts = f'./pdf-parts/{nombre_pdf}'
        nombre_carpeta_jpeg = f'./jpeg/{nombre_pdf}'
        nombre_carpeta_jpeg_pdf = f'./jpeg-pdf/{nombre_pdf}'
        nombre_carpeta_pdf_searchable = f'./pdf-searchable/{nombre_pdf}'
        nombre_carpeta_csv_final = f'./csv-final'
        Path(nombre_carpeta_pdf_parts).mkdir(parents=True, exist_ok=True)
        Path(nombre_carpeta_jpeg).mkdir(parents=True, exist_ok=True)
        Path(nombre_carpeta_jpeg_pdf).mkdir(parents=True, exist_ok=True)
        Path(nombre_carpeta_pdf_searchable).mkdir(parents=True, exist_ok=True)
        Path(nombre_carpeta_csv_final).mkdir(parents=True, exist_ok=True)
        os.system(f'pdfseparate ./pdfs/{nombre_pdf}.pdf {nombre_carpeta_pdf_parts}/part-%d')
        parts_list = os.listdir(nombre_carpeta_pdf_parts)

        # Para ordenar los nombres de las partes en orden "natural" ascendente
        parts_list = natsorted(parts_list)
        df_list = []
        indice = 1
        for nombre_pdf_part in parts_list:
            print(f'Procesando parte: {nombre_pdf_part}\n')

            print('pdftoppm')
            os.system(f'pdftoppm -singlefile -jpeg -r 300 -jpegopt quality=100 {nombre_carpeta_pdf_parts}/{nombre_pdf_part} {nombre_carpeta_jpeg}/{nombre_pdf_part}')

            print('img2pdf')
            os.system(f'img2pdf {nombre_carpeta_jpeg}/{nombre_pdf_part}.jpg -o {nombre_carpeta_jpeg_pdf}/{nombre_pdf_part}-jpeg.pdf')

            print('ocrmypdf')
            os.system(f'ocrmypdf -f --tesseract-pagesegmode 6 --jpeg-quality 100 -l spa {nombre_carpeta_jpeg_pdf}/{nombre_pdf_part}-jpeg.pdf {nombre_carpeta_pdf_searchable}/{nombre_pdf_part}-jpeg-ocr.pdf')

            print('tabula')
            df_list += extraer_datos(f'{nombre_carpeta_pdf_searchable}/{nombre_pdf_part}-jpeg-ocr.pdf', indice)
            indice += 1

        print("csv final")
        imprimir_csv(f'{nombre_carpeta_csv_final}/{nombre_pdf}.csv', df_list)
        end = time.time()
        print(f"El tiempo transcurrido en minutos: {(end - start) / 60}")

if __name__ == '__main__':
    start = time.time()
    procesar_archivos()
    end = time.time()
    print(f"El tiempo transcurrido total en minutos: {(end - start) / 60}")