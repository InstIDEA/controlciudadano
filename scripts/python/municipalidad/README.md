# Parseo PDF Municipalidad
Para poder ejecutar el programa hay que tener instaladas las siguientes dependencias en el sistema operativo:
* python 3.5+
* poppler-utils (https://poppler.freedesktop.org/)
* img2pdf (https://gitlab.mister-muffin.de/josch/img2pdf#installation)
* ocrmypdf (https://ocrmypdf.readthedocs.io/en/latest/installation.html)
* tesseract-ocr-spa (https://ocrmypdf.readthedocs.io/en/latest/languages.html)
* java 8+ (dependencia de tabula-py https://tabula-py.readthedocs.io/en/latest/getting_started.html)

Instalar las dependencias de python definidas en el archivo requirements.txt
* pip install -r requirements.txt 
  
Utilizacion del programa
* Descargar un pdf de salarios de la municipalidad de Asuncion  del siguiente enlace:  (https://data.controlciudadanopy.org/municipalidad/) que tiene el siguiente formato downloadDate(%y-%MM-%dd)hashDocument(%Mon_%y).pdf
* Ejecutar el programa pasando como argumento el pathfile del pdf a parsear. Ejemplo: python3 parseo_municipalidad_asu.py /home/root/Documents/2020-12-12_fbfefbfa75182dfe655df641c016f900_Octubre_2020.pdf
* El resultado estara en la carpeta csv-final dentro del directorio del programa
