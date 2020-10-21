from etl.engine.Runner import Context


class BaseStep:

    def __init__(self, name):
        self.name = name

    def prepare(self, ctx: Context) -> bool:
        return True

    def commit(self, ctx: Context) -> bool:
        return True

    def clean_up(self, ctx: Context) -> bool:
        return True

    def on_abort(self, ctx: Context) -> bool:
        return True
