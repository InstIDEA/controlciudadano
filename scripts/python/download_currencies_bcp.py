#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Dependencias:
# - beautifulsoup4

import sys
import time
import urllib
import urllib.request
import contextlib
from bs4 import BeautifulSoup

def get_file(anho, mes):
    s_anho = str(anho)
    s_mes = str(mes)
    if mes < 10:
        s_mes = '0' + s_mes

    data = urllib.parse.urlencode({'anho': s_anho, 'mes' : s_mes}).encode('UTF-8')
    print ('Downloading: ', data, file=sys.stderr)
    req = urllib.request.Request("https://www.bcp.gov.py/webapps/web/cotizacion/monedas-mensual",
                                 data,
                                 headers={'User-Agent' : "Chrome",
                                     'Cookie': 'BNIS_STCookie=w5Dphai9Wi5i4vFr7Cd7MZU/3q11TkmixrO6cm/u3H4Kzvv6bte3XvgOioTnQGzrocoJ9Mmvnq6iDgGleFCVQQ==; 43B850=tka571s8cs9vk1st5v5bs0q3s0; BNIS_x-bni-jas=IMqp4mA9ZGbU+5RYfajRalvfnv94bdSc2Rk+aPD1/kZmY5AQk90VcO2w6YrA4vZFxZIp0r3x16x6ZOcrF5UqheUsB42pXMrwIziPugf0zPWPeqjlMBJ82Q==; x-bni-ja=-397786028; PHPSESSID=b0bs4j2fe5jp30uqjk2v0j1hh3; x-bni-ci=96kUEccgetwMLCwvrhCCerkzM5KMQ29QGhRVKKrrRi0PjweBfk1M_z5cU4H70TkKZtelKY9DHmV5_8sCfhDe8uieqTthvEbl'})
    with contextlib.closing(urllib.request.urlopen(req)) as response:

        result = response.read()

        soup = BeautifulSoup(result, 'html.parser')

        # Ejemplo de como imprimir todo
        # print soup.prettify()

        # Obtenemos la tabla

        # print soup

        tabla_paraguay = soup.find('table', {"id": "cotizacion-interbancaria"})

        # Obtenemos todas las filas
        rows = tabla_paraguay.find_all("tr")

        to_ret = ""

        for row in rows:
            # obtenemos todas las columns
            cells = row.find_all("td")
            linea = ''

            for cell in cells:
                # se eliminan los asteriscos y se borran los espacios en blanco
                linea += cell.get_text().replace('*', '').strip() + '|'

            if not linea:
                continue
            if linea[0] == '(':
                continue
            # se agrega la fecha de hoy
            linea += time.strftime('%x %X')

            #imprimos la fila
            to_ret += s_anho + '|' + s_mes + '|' + linea + '\n'

        return to_ret



if len(sys.argv) > 2:
    for j in range(int(sys.argv[2]), 13):
        try:
            print (get_file(int(sys.argv[1]), j))
            time.sleep(2)
        except Exception as error:
            print ('error', error, file=sys.stderr)
            print ('Error en ' + sys.argv[2] + ' mes ' + str(j), file=sys.stderr)
            sys.exit()
else:
    for i in range(int(sys.argv[1]), 2021):
        for j in range(1, 13):
            try:
                print (get_file(i, j))
                time.sleep(2)
            except Exception as error:
                print ('error', error, file=sys.stderr)
                print ('Error en ' + str(i) + ' mes ' + str(j), file=sys.stderr)
                sys.exit()

