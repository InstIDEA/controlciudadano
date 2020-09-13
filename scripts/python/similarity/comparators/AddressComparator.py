from sqlalchemy import text


class AddressComparator:
    def __init__(self):
        self.name = 'AddressComparison'

    def compare(self, con, suppliers):
        query = '''
        SELECT * FROM temp_schema_similarities.address WHERE ruc1 = ANY(:rucs) AND ruc2 = ANY(:rucs)
        '''

        print('Querying all suppliers with same address')

        rucs = []
        for supplier in suppliers:
            rucs.append(supplier.ruc)

        result = con.execute(text(query), rucs=rucs)
        to_ret = []

        for row in result:
            to_ret.append(Relation(
                Supplier(row["name1"], 'PY-RUC-' + row["ruc1"]),
                Supplier(row["name2"], 'PY-RUC-' + row["ruc2"]),
                'OCDS_SAME_LEGAL_ADDRESS',
                1,
                {
                    'address': row["data"]
                }
            ))

        return to_ret
