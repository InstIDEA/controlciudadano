# Conversion de PDF a CSV con tabula-py para datos de la policia nacional en la plataforma Control Ciudadano+

# Funcionamiento
==============

-   El codigo lee todos los nombres de archivos del directorio 1,
    mediante una expresión regular identifica los archivos pdf de
    salario y los guarda en un lista.
    -   Los archivos corresponden a un modelo: [fecha de descarga - hash
        de 32 digitos - POLICIA[-\_]PN[-\_] MES - AÑO]
-   Se recorre la lista y se convierte "en sucio" el pdf a un csv, que
    va ser guardado en el directorio 2
    -   Si el csv ya existe, el codigo omite la conversion
-   Luego de la conversion de cada archivo, el csv guardado en el paso
    anterior es arreglado mediante una serie de algoritmos que permiten
    identificar los datos importantes y se crea un nuevo archivo csv en
    el directorio 3

-   El archivo guardado en el directorio 3 esta listo para ser añadido a
    una tabla de base de datos.

-   Para obtener una salida en la terminal sobre el proceso que se esta
    realizando (un archivo omitido, o una conversion) descomentar las
    lineas: 27 \#print ("El archivo " + csvfile + " ya existe") \#Para
    ver los archivos omitidos por existencia

    31 \#print ("Convirtiendo " + ficheros[i] + " a csv... = " +
    csvfile) \#Para ver el archivo que se esta convirtiendo


#Cambios necesarios para el funcionamiento

-   Los directorios necesitan ser cambiados, estos se encuentran en las
    primeras lineas del codigo (9, 10, 11)

1.  Directorio donde se encuentran los pdf's a convertir
    dir_csv="csv_out" \#Aca hay que cambiar al nombre del directorio
    donde se encuentran los pdf
2.  Directorio donde guardar los csv convertidos en el paso 1
    dir_pdf="pdf" \#Aca hay que cambiar al nombre del directorio donde
    se encuentran los csv
3.  Directorio donde guardar el csv arreglado en el paso 2
    dir_result="result" \#Aca hay que cambiar al nombre del
    directorio donde guardar los csv corregidos y listos para cargar

-   El tercer directorio contiene el csv listo para ser añadido a una
    tabla de base de datos con los siguientes datos: headerList:
    [CEDULA, NOMBRES, APELLIDOS, REMUNERACION\_TOTAL, PRESUPUESTO,
    DEVENGADO, CARGO]

-   Solo estos 3 directorios necesitan ser editados para el
    funcionamiento del código

* * * * *

*   Evelyn Gimenez (SE2 para Control Ciudadano)

