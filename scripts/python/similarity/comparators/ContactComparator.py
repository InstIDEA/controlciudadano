from sqlalchemy import text


class ContactComparison:
    def __init__(self):
        self.name = 'ContactComparison'

    def compare(self, con, suppliers):

        print('Querying all suppliers with same contact')

        query = '''
        SELECT * FROM temp_schema_similarities.similarity_name WHERE ruc1 = ANY(:rucs) AND ruc2 = ANY(:rucs)
        '''

        rucs = []
        for supplier in suppliers:
            rucs.append(supplier.ruc)

        result = con.execute(text(query), rucs=rucs)
        to_ret = []

        for row in result:
            to_ret.append(Relation(
                Supplier(row["name1"], 'PY-RUC-' + row["ruc1"]),
                Supplier(row["name2"], 'PY-RUC-' + row["ruc2"]),
                'OCDS_SAME_LEGAL_CONTACT',
                1,
                {
                    'contact_name': row["data"]
                }
            ))

        return to_ret
