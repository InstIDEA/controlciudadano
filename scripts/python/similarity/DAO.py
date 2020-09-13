import diskcache as dc
from sqlalchemy import engine, text


def _to_arr_dict(proxy: engine.ResultProxy):
    d, a = {}, []
    for row in proxy:
        for column, value in row.items():
            # build up the dictionary
            d = {**d, **{column: value}}
        a.append(d)

    return a


class DAO:
    conn: engine.Engine
    cache: dc
    hits: int
    total: int

    def __init__(self, conn):
        self.cache = dc.Cache('tmp')
        self.conn = conn
        self.hits = 0
        self.total = 0

    def get_stats(self):
        return '{} hits, {} total, {}%'.format(self.hits, self.total, self.hits / self.total * 100)

    def get_participation(self, supplier_ruc):
        key = '{}_participation'.format(supplier_ruc)

        self.total += 1

        if key in self.cache:
            self.hits += 1
            return self.cache[key]

        query = '''
        select ts.tender_id                as tender_slug,
               ts.tender_title             as tender_title,
               c.ocid                      as contract_ocid,
               c.contract_id               as contract_id,
               c.award_id                  as contract_award_id,
               s.supplier ->> 'name'       as name,
               s.supplier ->> 'id'         as ruc,
               c.contract_value_amount     as amount,
               c.contract_value_currency   as currency,
               c.datesigned                as sign_date,
               ts.tender_procurementmethod as procurement_method
        from view_data_dncp_data.award_suppliers_summary s
                 join view_data_dncp_data.awards_summary a
                      on s.data_id = a.data_id and a.award_index = s.award_index
                 join view_data_dncp_data.contracts_summary_no_data c
                      on c.data_id = s.data_id and c.award_id = a.award_id
                 join view_data_dncp_data.tender_summary_with_data ts on ts.data_id = s.data_id

        where s.supplier ->> 'id' ilike :ruc
        ORDER BY c.datesigned DESC
        '''

        to_ret = _to_arr_dict(self.conn.execute(text(query), ruc=supplier_ruc))
        self.cache[key] = to_ret
        return to_ret

    def get_items(self, supplier_ruc):
        key = '{}_items'.format(supplier_ruc)

        self.total += 1

        if key in self.cache:
            self.hits += 1
            return self.cache[key]

        query = '''
            SELECT DISTINCT i.item_classification AS item_id,
                            i.item -> 'unit' ->> 'id' as unidad,
                            i.item ->> 'description' as name

            FROM view_data_dncp_data.award_suppliers_summary sa
                     JOIN view_data_dncp_data.award_items_summary i ON i.data_id = sa.data_id
                AND i.award_index = sa.award_index
            WHERE sa.supplier_identifier = :ruc
        '''

        to_ret = _to_arr_dict(self.conn.execute(text(query), ruc=supplier_ruc))
        self.cache[key] = to_ret
        return to_ret
