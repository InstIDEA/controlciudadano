from DAO import DAO
from Models import Supplier, Relation


class TenderItemsComparator:
    cache: DAO

    def __init__(self, dao):
        self.name = 'TenderItemsComparator'
        self.dao = dao

    def compare(self, supplier1: Supplier, supplier2: Supplier):

        if supplier2.ruc == supplier1.ruc:
            return None

        print('{} - Comparing {} with {}'.format(self.name, supplier1.ruc, supplier2.ruc))

        supplier1_parts = self.dao.get_items(supplier1.ruc)
        supplier2_parts = self.dao.get_items(supplier2.ruc)

        print('{} has {} items'.format(supplier1.ruc, len(supplier1_parts)))
        print('{} has {} items'.format(supplier2.ruc, len(supplier2_parts)))

        index = 0

        for c1 in supplier1_parts:
            for c2 in supplier2_parts:
                if c1["item_id"] == c2["item_id"]:
                    index += 1
                    break

        print('{} and {} has {} items in common'.format(supplier1.ruc, supplier2.ruc, index))

        if index > 0:
            return Relation(
                supplier1,
                supplier2,
                'OCDS_SAME_ITEMS',
                index,
                None
            )

        return None
