from __future__ import annotations

from typing import Callable

from etl.engine.core.BaseStep import BaseStep
from etl.engine.core.Context import Context
from etl.engine.steps.Steps import EmptyStep

ALTERNATIVE_FLOW = "Executing other"
MAIN_FLOW = "Executing main"


class BaseCondition:

    def match(self, ctx) -> bool:
        return True


class Condition(BaseStep):

    def __init__(self, description: str):
        super().__init__(f"Conditional Step '{description}'")
        self.__when = BaseCondition()
        self.__main = EmptyStep()
        self.__other = EmptyStep()
        self.__result = True
        self.__description = description

    def when(self, cond: BaseCondition):
        self.__when = cond
        return self

    def then(self, step: BaseStep):
        self.__main = step
        return self

    def otherwise(self, step: BaseStep):
        self.__other = step
        return self

    def prepare(self, ctx: Context) -> bool:

        self.__result = self.__when.match(ctx)

        ctx.log(f"> The result of the condition step '{self.__description}' is '{self.__result}'")

        if self.__result:
            ctx.log(MAIN_FLOW)
            return self.__main.prepare(ctx)

        ctx.log(ALTERNATIVE_FLOW)
        return self.__other.prepare(ctx)

    def commit(self, ctx: Context) -> bool:
        if self.__result:
            ctx.log(MAIN_FLOW)
            return self.__main.commit(ctx)

        ctx.log(ALTERNATIVE_FLOW)
        return self.__other.commit(ctx)

    def on_abort(self, ctx: Context) -> bool:
        if self.__result:
            ctx.log(MAIN_FLOW)
            return self.__main.on_abort(ctx)

        ctx.log(ALTERNATIVE_FLOW)
        return self.__other.on_abort(ctx)


class EqualCondition(BaseCondition):
    __first_producer: Callable[[Context], str]
    __second_producer: Callable[[Context], str]

    def __init__(self, first_key: str = "_INVALID_", second_key: str = "_INVALID_"):
        self.__first_producer = lambda c: c.get(first_key)
        self.__second_producer = lambda c: c.get(second_key)

    def first(self, producer: Callable[[Context], str]) -> EqualCondition:
        self.__first_producer = producer
        return self

    def second(self, producer: Callable[[Context], str]) -> EqualCondition:
        self.__second_producer = producer
        return self

    def match(self, ctx) -> bool:
        first = self.__first_producer(ctx)
        second = self.__second_producer(ctx)

        return first == second
