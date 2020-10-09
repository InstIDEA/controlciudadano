#!/usr/bin/python3
import sys
import re
from string import Template

#
# Usage: python3 generate_rows.py t.txt > /tmp/all_rows.sql
#

def remove_duplicate_spaces(string):
    return ' '.join(string.split())


SQL_TEMPLATE = Template(remove_duplicate_spaces("INSERT INTO analysis.declarations (document, name, year, link, version, origin) \
        VALUES \
        ( \
            '$document', \
            '$name', \
            $year, \
            'https://datapy.ftp.cds.com.py/contraloria/declaraciones/$file_name', \
            $version, \
            'https://djbpublico.contraloria.gov.py/index.php/component/search/?searchword=$document' \
        ) \
        ON CONFLICT ON CONSTRAINT uq_declarations_link \
        DO UPDATE SET document = '$document', name = '$name', \
        year = $year, \
        version = $version \
        ;"))


def gen_sql(data):
    return SQL_TEMPLATE.substitute(data)


def get_file_data(file_name):
    
    cleaned = file_name \
        .replace('OLGA_CAROLINA_ACOSTA_LEDESMA__1.pdf', 'OLGA_CAROLINA_ACOSTA_LEDESMA_2000_1.pdf') \
        .replace('PERDOMO2016_1', 'PERDOMO_2016_1') \
        .replace('SOSARIELLA_216', 'SOSARIELLA_2016') \
        .replace('GALEANO_ALCARAZ__1', 'GALEANO_ALCARAZ_2002_1') \
        .replace('221.035', '221035') \
        .replace('991712_8', '991712#8') \
        .replace("_0_", "") \
        .replace("-.pdf", "") \
        .replace("_.pdf", "") \
        .replace(".pdf", "") \
        .strip() \
        .replace("\n", "") \
        .replace("__", "_") \
        .replace("-", "_") \
        .replace(" ", "_") \
        .replace(".", "_")

    parts = cleaned.split("_")

    document = parts[0]

    name = ''
    last = 'document'
    year = '2016'
    version = '0'
    for part in parts[1:]:
        # print('Last "' + last + '" current: ' + part)
        if last == 'document':
            if not part.isdigit():
                last = 'name'
                name += ' ' + part
            else:
                raise Exception(f'Double document {document} > {part} in {file_name}')
            continue
        if last == 'name':
            if part.isdigit():
                last = 'year'
                year = part
            else:
                name += ' ' + part
            continue
        if last == 'year':
            version = part
            if version == '':
                version = '1'

    if year == '216':
        year = '2016'

    return {
            'file_name': file_name.replace("\n", ""),
            'document': document,
            'name': name.strip(),
            'year': year,
            'version': version
           }


if len(sys.argv) < 2:
    raise Exception('Usage: python3 generate_rows.py FILE')

FILE_NAME=sys.argv[1]

# print("Reading file: " + FILE_NAME)

with open(FILE_NAME, "r") as file:
    for line in file: 
        if '(1)' in line or '(2)' in line:
            continue
        data = get_file_data(line)
        if not data['year'].isdigit() or int(data['year']) < 1990:
            print(data)
            raise Exception('invalid year: ' + data['year'])
        if not data['version'].isdigit() or int(data['version']) > 2000:
            print(data)
            raise Exception('invalid digit: ' + data['version'])
        print(gen_sql(data))

