import logging
from datetime import date
from time import sleep

from dotenv import load_dotenv

from etl.engine.core.Context import Context, CanFail
from etl.engine.core.Flow import Flow


class Runner:

    def __init__(self):
        pass

    def with_job(self, job_definition):
        self.job_defintion = job_definition
        return self

    def run_now(self):
        load_dotenv()
        logging.basicConfig(level=getattr(logging, "INFO", None), format='%(asctime)s %(name)s: %(message)s ')

        self.job_instance = JobInstance(self.job_defintion.name, self.job_defintion.get_steps())
        self.job_instance.run()
        return self


class JobInstance(CanFail):

    def __init__(self, name: str, flow: Flow):
        self.name = name
        self.logger = logging.getLogger(name)
        self.ctx = Context(self.logger, self)
        self.flow = flow
        self.start_date = date.today()
        self.status = 'CREATED'
        self.stop_now = False

    def run(self):
        self.logger.info("Starting job %s", self.name)
        self.status = 'RUNNING'

        while True:
            # sleep(1)

            has_more = self.flow.iteration(self.ctx)

            if not has_more:
                self.logger.info(f">>>> Finishing job '{self.name}', with result '{self.flow.result}' <<<<")
                self.status = 'STOPPED'
                return self.flow.result

            if self.stop_now:
                self.logger.warning("Aborting jobs %s", self.name)
                self.flow.abort('FAILED')
                self.stop_now = False

    def fail(self, msg):
        self.logger.critical(">>>> Finishing job because '%s' <<<<", msg)
        self.stop_now = True
        self.status = 'STOPPING'
