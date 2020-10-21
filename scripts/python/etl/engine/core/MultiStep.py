from __future__ import annotations

from typing import List

from etl.engine.core.BaseStep import BaseStep
from etl.engine.core.Context import Context


class MultiStep(BaseStep):
    """
    A step that can have multiple children, useful in combination with the ConditionStep
    """

    steps: List[BaseStep]

    def __init__(self):
        super().__init__("MultiStep")
        self.steps = []

    def step(self, to_add: BaseStep) -> MultiStep:
        self.steps.append(to_add)
        return self

    def prepare(self, ctx: Context) -> bool:
        if len(self.steps) == 0:
            return True

        for step in self.steps:
            ctx.log(f"> {self.name} prepare {step.name}")
            success = step.prepare(ctx)
            if not success:
                return False

        ctx.log(f"> Finishing prepare {self.name}")
        return True

    def commit(self, ctx: Context) -> bool:
        if len(self.steps) == 0:
            return True

        for step in self.steps:
            ctx.log(f"> {self.name} commit {step.name}")
            success = step.commit(ctx)
            if not success:
                return False

        ctx.log(f"> Finishing commit {self.name}")
        return True

    def on_abort(self, ctx: Context) -> bool:
        if len(self.steps) == 0:
            return True

        for step in self.steps:
            ctx.log(f"> {self.name} on_abort {step.name}")
            success = step.on_abort(ctx)
            if not success:
                return False
        ctx.log(f"> Finishing on_abort {self.name}")

        return True
