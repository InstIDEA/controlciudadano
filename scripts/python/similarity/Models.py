class Supplier:
    name: str
    ruc: str

    def __init__(self, name, ruc):
        self.name = name
        self.ruc = ruc


class Relation:
    sup1: Supplier
    sup2: Supplier
    name: str
    index: int
    meta: object

    def __init__(self, sup1, sup2, name, index, meta):
        self.sup1 = sup1
        self.sup2 = sup2
        self.name = name
        self.index = index
        self.meta = meta

    def __str__(self):
        return '''{} and {} has a relation of type {} with weight {}'''.format(self.sup1.ruc, self.sup2.ruc, self.name,
                                                                               self.index)
