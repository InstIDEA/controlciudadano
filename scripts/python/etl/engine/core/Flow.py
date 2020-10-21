from __future__ import annotations
from typing import List

from etl.engine.Runner import Context
from etl.engine.core.BaseStep import BaseStep


class FlowBuilder:
    steps: [BaseStep]

    def __init__(self):
        self.steps = []

    def step(self, step: BaseStep) -> FlowBuilder:
        self.steps.append(step)

        return self

    def build(self) -> Flow:
        return Flow(self.steps)


class Flow:
    steps: List[BaseStep]
    current: int
    stage: str
    result: str

    def __init__(self, steps: List[BaseStep]):
        self.steps = steps
        self.current = 0
        self.stage = 'PREPARE'
        self.result = 'PENDING'

    def iteration(self, ctx: Context) -> bool:

        if self.stage == 'FINISHED' or len(self.steps) == 0:
            ctx.log("Job finished")
            return False

        ctx.log(f"Running job with id '{self.steps[self.current].name}', my stage is '{self.stage}' and my result is '{self.result}'")
        try:
            self.run_step(ctx)
            self.avance()

        except Exception as exc:
            self.handle_error(ctx, exc)

        return True

    def avance(self):
        self.current += 1
        if len(self.steps) == self.current:
            self.next_step()

    def handle_error(self, ctx: Context, exc: Exception):

        ctx.warn("________________________________________")
        ctx.warn(f"Handling error {exc.__class__.__name__}")
        ctx.warn(exc)
        ctx.warn("________________________________________")

        # If we get an error while aborting
        if self.stage == 'ABORT' or self.stage == 'CLEAN_UP' or self.stage == 'FINISHED':
            self.avance()
            return

        # ctx.warn(exc)
        self.abort()
        self.result = 'ERROR'

    def abort(self, result = 'ABORTED'):
        if self.stage == 'ABORT' or self.stage == 'CLEAN_UP' or self.stage == 'FINISHED':
            return
        self.stage = 'ABORT'
        self.current = 0
        self.result = 'ABORTED'

    def run_step(self, ctx: Context):

        step = self.steps[self.current]

        if self.stage == 'PREPARE':
            step.prepare(ctx)
        elif self.stage == 'COMMIT':
            step.commit(ctx)
        elif self.stage == 'ABORT':
            step.commit(ctx)
        elif self.stage == 'CLEAN_UP':
            step.clean_up(ctx)

    def next_step(self):
        if self.stage == 'PREPARE':
            self.stage = 'COMMIT'
        elif self.stage == 'COMMIT':
            self.stage = 'CLEAN_UP'
            self.result = 'SUCCESS'
        elif self.stage == 'ABORT':
            self.stage = 'CLEAN_UP'
        elif self.stage == 'CLEAN_UP':
            self.stage = 'FINISHED'
        self.current = 0

