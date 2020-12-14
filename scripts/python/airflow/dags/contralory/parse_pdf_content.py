#!/usr/bin/python3
import sys
import re
from subprocess import Popen, PIPE
from string import Template
import json
import os

SQL_TEMPLATE_PARSE_PDF = Template(
    "UPDATE analysis.declarations \
    SET net_worth = $net_worth, \
    passive = $passive, \
    active = $active, \
    scrapped_data = '$json' \
    WHERE link = '$data_link' \
    ;"
)

def parse_pdf(dfile: str, files_path: str) -> dict:
    with open(dfile, "r") as data_file:
        data_json = json.load(data_file)

        for declaration in data_json['data']:
            print("\tParsing " + declaration['link'])

            if declaration['year'] < 2015:
                print("\tOld declaration, skipping")
                continue

            last_idx = declaration["link"].rfind('/') + 1
            fname = declaration['link'][last_idx:]
            
            try:
                command = [
                    'grep',
                    r'{"id',
                    os.path.join(files_path, fname)
                ]

                with Popen(command, stdout=PIPE, text=True, shell=False) as pr:
                    parsed = pr.communicate()[0]
                
                loaded = json.loads(parsed)
                
                print(
                    SQL_TEMPLATE_PARSE_PDF.substitute({
                        'passive': loaded['pasivos'],
                        'active': loaded['activos'],
                        'net_worth': loaded['patrimonioNeto'],
                        'data_link': declaration['link'],
                        'json': parsed
                    })
                )
            except Exception as err_:
                print('\tError parsing ' + fname)
                print(err_)