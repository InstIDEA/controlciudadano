from __future__ import annotations

from datetime import date
from typing import Callable

from etl.engine.core.BaseStep import BaseStep
from etl.engine.core.Context import Context


class SkipIfRecent(BaseStep):
    __date_provider: Callable[[Context], date]
    __compare_with: date

    def __init__(self):
        super().__init__("SkipIfRecent")

    def prepare(self, ctx: Context) -> bool:
        base = self.__date_provider(ctx)
        target = self.__compare_with

        if base > target:
            return ctx.fail(f"The data is too recent to perform another job {base} > {target}")

        return True

    def date(self, param: Callable[[Context], date]) -> SkipIfRecent:
        self.__date_provider = param
        return self

    def compare_with(self, param: date) -> SkipIfRecent:
        self.__compare_with = param
        return self


class PrintContext(BaseStep):

    def __init__(self):
        super().__init__("PrintContext")

    def prepare(self, ctx: Context) -> bool:
        ctx.dump_to_log()
        return True


class EmptyStep(BaseStep):

    def __init__(self):
        super().__init__("EmptyStep")


class CallMethod(BaseStep):

    def __init__(self, method: Callable[[Context], bool]):
        super().__init__("MethodStep")
        self.__method = method

    def prepare(self, ctx: Context) -> bool:
        return self.__method(ctx)


class FailStep(BaseStep):
    """
    A simple step that always fails (useful with the ConditionStep)
    """

    def __init__(self, message: str):
        super().__init__(f"FailStep '{message}'")
        self.message = message

    def prepare(self, ctx: Context) -> bool:
        return ctx.fail(self.message)
