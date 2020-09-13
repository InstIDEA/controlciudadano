import os
import itertools

from dotenv import load_dotenv
from sqlalchemy import create_engine

from DAO import DAO
from Models import Supplier
from comparators.AddressComparator import AddressComparator
from comparators.ContactComparator import ContactComparison
from comparators.TenderParticipationComparator import TenderParticipationComparator
from comparators.TenderItemsComparator import TenderItemsComparator

load_dotenv()

QUERY_GET_ALL_SUPPLIERS = '''
    SELECT * FROM temp_schema_similarities.covid_suppliers LIMIT 200;
'''


def load_providers(conn):
    result = conn.execute(QUERY_GET_ALL_SUPPLIERS)
    suppliers = []
    for row in result:
        name = row['supplier_name']
        ruc = row['supplier_ruc']
        suppliers.append(Supplier(name, ruc))

    return suppliers


if __name__ == '__main__':
    cnx = create_engine(os.getenv('PG_CONN'))
    cnx.connect()
    dao = DAO(cnx)

    suppliers = load_providers(cnx)

    global_comparators = [
        ContactComparison(),
        AddressComparator()
    ]

    local_comparators = [
        TenderParticipationComparator(dao),
        TenderItemsComparator(dao)

    ]

    results = {}

    for comparator in global_comparators:
        results[comparator.name] = comparator.compare(cnx, suppliers)

    for local in local_comparators:
        result = []
        for sup1, sup2 in itertools.combinations(suppliers, 2):
            local_result = local.compare(sup1, sup2)
            if local_result is not None:
                result.append(local_result)

        results[local.name] = result

    for name in results:
        for row in results[name]:
            print('{}: {}'.format(name, str(row)))
        print('----')

    print(dao.get_stats())
