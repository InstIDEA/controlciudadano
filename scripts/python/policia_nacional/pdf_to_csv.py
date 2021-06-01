import tabula
import re
import os
import pandas as pd
import csv

# Ambos dir sin el ultimo /
dir_csv = "csv_out"# Directorio donde se encuentran los pdf
dir_pdf = "pdf"  # Directorio donde se encuentran los csv
dic_result = "result" # Directorio donde guardar los csv
match_list = []  # Lista de nombres de los archivos a analizar
headerList = [
    'CEDULA',
    'NOMBRES',
    'APELLIDOS',
    'REMUNERACION_TOTAL',
    'PRESUPUESTO',
    'DEVENGADO',
    'CARGO']
# Expresion regular que define el nombre de archivos que queremos analizar
valid_pdf_regex = re.compile(
    '(\\d{4}[-/]\\d{2}[-/]\\d{2})[-_](\\w{32})[-_](SALARIOS)[-_]*(PN)*[-_](ENERO|FEBRERO|MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO|SETIEMBRE|OCTUBRE|NOVIEMBRE|DICIEMBRE)[-_](\\d{4})')
# Obtenemos los nombres de todos los archivos pdf en el directorio
with os.scandir(dir_pdf) as ficheros:
    ficheros = [fichero.name for fichero in ficheros if fichero.is_file() and fichero.name.endswith('.pdf')]  # Filtramos por el tipo de archivo
# Para todos nuestros pdf encuentra los archivos de salario y lo guarda en una lista de listas
for i in range(len(ficheros)):
    # Lista con los archivos que queremos convertir
    match_list.append(valid_pdf_regex.findall(ficheros[i]))
    # Conversion de archivos pdf a csv
    if match_list[i] != []:  # Si el archivo pdf es de salario entra al if
        # Nombre de salida (SALARIO_PN_MES_AÑO)
        output_filename = 'SALARIO_PN_' + \
            match_list[i][0][4] + '_' + match_list[i][0][5] + '.csv'
        # Leemos el nombre de archivos csv existentes
        with os.scandir(dir_csv) as ficheros_csv:
            ficheros_csv = [fichero_csv.name for fichero_csv in ficheros_csv if fichero_csv.is_file(
            ) and fichero_csv.name.endswith('.csv')]  # Filtramos por el tipo de archivo
        if output_filename in ficheros_csv:  # Si el pdf ya fue convertido lo pasamos
            # print ("El archivo " + output_filename + " ya existe") 
            pass
        else:  # Si el pdf aun no se convirtió lo convertimos
            # PASO 1 -> Se convierte el pdf completo a un csv
            df = tabula.io.read_pdf(
                dir_pdf + "/" + ficheros[i],
                pages='all',
                output_format='dataframe',
                guess=False,
                stream=True)[0]
            # Conversion del dataframe a un csv ignorando los indices de las filas
            df.to_csv(dir_csv + "/" + output_filename, index=False)
            # PASO 2 -> Se arregla el csv creado anteriormente
            with open(dir_csv + "/" + output_filename) as File:  # Abrimos el archivo creado
                # Directorio y nombre de archivo donde vamos a escribir
                f = open(dic_result + "/" + output_filename, 'w')
                # Creacion de nuestro csv para escritura
                writer = csv.writer(f)
                # Añadimos el encabezado a nuestro pdf
                writer.writerow(headerList)
                # Lectura del csv a arreglar
                reader = csv.reader(File, delimiter=',')
                num_row = 0  # Para obtener el indice de columna donde se encuentran los datos de interes, solo es necesario leer entre las primeras 6 lineas del csv
                for fila in reader:  # Por cada fila del csv
                    # Leemos las primeras 6 lineas del csv para sacar el indice de columna de interes
                    if (num_row < 7):
                        num_row += 1
                        for i in range(
                                len(fila)): # Por cada columna en cada fila obtenemos los indices de las columnas con datos de interes
                            if re.findall('(CEDU)', fila[i]):
                                ced = i  # Cedula
                            if re.findall('(NOMBRES)', fila[i]):
                                nom = i  # Nombres
                            if re.findall('(APELLIDOS)', fila[i]):
                                ape = i  # Apellidos
                            if re.findall('(PRESU)', fila[i]):
                                presu = i  # Presupuesto
                            if re.findall('(DEVEN)', fila[i]):
                                deven = i  # Devengado
                            if re.findall('(REMUN)', fila[i]):
                                remun = i  # Remuneracion
                            if re.findall('(CARGO)', fila[i]):
                                cargo = i  # Cargo
                    else:
                        break
                # Volvemos a leer el archivo ya que o sino se pierden lineas de datos
                with open(dir_csv + "/" + output_filename) as File:
                    reader = csv.reader(
                        File, delimiter=',')  # Lectura del archivo
                    for fila in reader:  # Por cada fila en el archivo
                        # Vector que representa cada fila del csv
                        var = ['', '', '', '', '', '', '']
                        # Algoritmos de correccion para cada columna
                        #Cedula, nombres
                        if ced == nom:  # Si la columna de la cedula y el nombre son iguales
                            if re.findall(
                                '(\\d)[ ](\\D)',
                                    fila[ced]):  # Se cumple el modelo "cedula nombres"
                                # Separamos la cedula del nombre
                                ced_nom = (
                                    fila[ced].split(
                                        sep=' ', maxsplit=1))
                                var[0] = ced_nom[0]  # Cedula
                                var[1] = ced_nom[1]  # Nombres
                        # Si estan en columnas separadas solo asignamos
                        elif re.findall('^[A-Za-z]*(\\d)', fila[ced]):
                            var[0] = fila[ced]  # Cedula
                            var[1] = fila[nom]  # Nombres
                        # Apellidos
                        # En caso de juntarse con la columna a la derecha
                        var[2] = fila[ape].replace('PERMANENTE', '')
                        # Remuneracion total
                        if re.findall(
                            '^[A-Za-z]*(\\d)',
                                fila[remun]):  # Verificamos que el valor sea numerico
                            # Separamos por si haya hecho merge con otra
                            # columna
                            remun_to = (
                                fila[remun].replace(
                                    '.', '').split(
                                        sep=' '))
                            if len(
                                    remun_to[0]) > 3:  # Como en muchos casos hizo merge con otros datos, verificamos que tenga una longitud mayor a los datos que comunmente quedan en la columna
                                var[3] = int(remun_to[0])  # Remuneracion
                        # Presupuesto
                        if fila[presu] != '' and re.findall(
                            '^[A-Za-z]*(\\d)',
                                fila[presu]):  # A veces el presupuesto se salta una fila y queda vacio entonces verificamos
                            var[4] = fila[presu].replace('.', '')
                        # Cuando queda vacia la celda de presupuesto, esta se coloca comunmente a la derecha (+1)
                        elif fila[presu + 1] != '' and re.findall('^[A-Za-z]*(\\d)', fila[presu + 1]):
                            var[4] = fila[presu + 1].replace('.', '')
                        # Devengado
                        if re.findall(
                            '^(\\d)',
                                fila[remun]):  # Verificamos que comience con un dato numerico ya que hay datos no deseados
                            # Separamos por si haya hecho merge con otra columna
                            deven_to = (
                                fila[deven].replace(
                                    '.', '').split(
                                    sep=' ', maxsplit=1))
                            var[5] = int(deven_to[0])  # Devengado
                        # Cargo
                        if re.findall(
                            '(\\D)',
                                fila[cargo]):  # Veficamos que sea un texto, este dato es bien convertido
                            var[6] = fila[cargo]  # Cargo
                        # Carga completa de una fila para el csv
                        # Veficamos que la fila a cargar sea util
                        if var[0] != 0 and var[0] != '':
                            # Escribimos cada linea en el csv creado
                            writer.writerow(var)
