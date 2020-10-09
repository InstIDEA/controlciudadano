#!/usr/bin/python3
import sys
import re
from string import Template
import json
import os

SQL_TEMPLATE = Template("UPDATE analysis.declarations \
        SET net_worth = $net_worth, passive = $passive, active = $active, scrapped_data = '$json' \
        WHERE link = '$file' \
        ;")

def gen_sql(data):
    return SQL_TEMPLATE.substitute(data)



def parse(file):
    command =   '/home/cdssa/local services/public_data/contraloria/declaraciones/' + file + ' | grep \'{"id\''
    stream = os.popen(command)
    output = stream.read()
    return output

if len(sys.argv) < 2:
    raise Exception('Usage: python3 parse_pdf.py FILE')

FILE_NAME=sys.argv[1]

with open(FILE_NAME, "r") as file:
    data = json.load(file)
    for declaration in data['data']:
        print("____Parsing " + declaration['link'])
        if declaration['year'] < 2015:
          print("____Old declaration, skipping")
          continue
        last_idx = declaration["link"].rfind('/') + 1
        file_name = declaration['link'][last_idx:]
        try:
          parsed = parse(file_name)
          loaded = json.loads(parsed)
  
          print(gen_sql({
              'passive': loaded['pasivos'],
              'active': loaded['activos'],
              'net_worth': loaded['patrimonioNeto'],
              'file': declaration['link'],
              'json': parsed
              }))
        except Exception as e:
          print('____Error parsing ' + file_name)
