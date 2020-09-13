from DAO import DAO
from Models import Supplier, Relation


class TenderParticipationComparator:
    cache: DAO

    def __init__(self, dao):
        self.name = 'TenderParticipationComparator'
        self.dao = dao

    def compare(self, supplier1: Supplier, supplier2: Supplier):

        if supplier2.ruc == supplier1.ruc:
            return None

        print('{} - Comparing {} with {}'.format(self.name, supplier1.ruc, supplier2.ruc))

        supplier1_parts = self.dao.get_participation(supplier1.ruc)
        supplier2_parts = self.dao.get_participation(supplier2.ruc)

        print('{} has {} contracts'.format(supplier1.ruc, len(supplier1_parts)))
        print('{} has {} contracts'.format(supplier2.ruc, len(supplier2_parts)))

        index = 0

        for c1 in supplier1_parts:
            for c2 in supplier2_parts:
                if c1["tender_slug"] == c2["tender_slug"]:
                    index += 1
                    break

        print('{} and {} has {} contracts in common'.format(supplier1.ruc, supplier2.ruc, index))

        if index > 0:
            return Relation(
                supplier1,
                supplier2,
                'OCDS_SAME_PARTICIPATION',
                index,
                None
            )

        return None
