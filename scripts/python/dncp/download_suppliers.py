import json
import urllib.request

import diskcache as dc

URL_BASE = "https://contrataciones.gov.py/datos/api/v3/doc/search"
URL_MONETARY = f"https://contrataciones.gov.py/datos/api/v3/doc/search/suppliers?details.sanctions.type=AMONESTACION&items_per_page=1000"
URL_INABILITY = f"https://contrataciones.gov.py/datos/api/v3/doc/search/suppliers?details.sanctions.type=INHABILITACION&items_per_page=1000"


class Downloader:

    def __init__(self):
        self.cache = dc.Cache('tmp')

    def download_url(self, url):

        if url in self.cache:
            return self.cache[url]

        print(f"Downloading ${url}")
        with urllib.request.urlopen(url) as con:
            data = json.loads(con.read().decode())

            self.cache[url] = data

        return self.cache[url]


def process_json(data, type):
    length = len(data['list'])
    total = data['pagination']['total_items']
    if total < length:
        raise Exception(f"The total_items is less than the full list. {length} < {total}")

    suppliers = data['list']

    for supplier in suppliers:
        name = supplier['name']
        supplier_id = supplier['id']
        identifier = json.dumps(supplier['identifier'])
        contact_point = json.dumps(supplier['contactPoint'])
        details = json.dumps(supplier['details'])
        address = json.dumps(supplier['address'])
        date = supplier['date']
        awarded_tenders = supplier['cantidad_adjudicaciones']
        print(f"""
INSERT INTO 
  staging.dncp_sanctioned_suppliers(supplier_name, supplier_id, identifier, contact_point, details, address, date, awarded_tenders, type)
VALUES 
  ('{name}', '{supplier_id}', '{identifier}', '{contact_point}', '{details}', '{address}', '{date}', {awarded_tenders}, '{type}');
""".replace('\n', ' '))

    print(f">>> Success")


if __name__ == '__main__':

    downloader = Downloader()

    monetary = downloader.download_url(URL_MONETARY)
    inability = downloader.download_url(URL_INABILITY)

    process_json(monetary, 'AMONESTACION')
    process_json(inability, 'INHABILITACION')
    # print(inability)
