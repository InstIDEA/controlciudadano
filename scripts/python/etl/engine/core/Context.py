import logging
import os
import pprint

class CanFail:

    def fail(self, msg: str):
        """
        Notifies that this job should fail with a message
        """
        pass


class Context:

    def __init__(self, logger: logging.Logger, instance: CanFail):
        self.data = {}
        self.logger = logger
        self.instance = instance

    def get(self, key):
        return self.data[key]


    def put(self, key, val):
        self.data[key] = val
        return self

    def env(self, env_name):
        return os.getenv(env_name)

    def fail(self, param: str):
        self.instance.fail(param)
        return True

    def log(self, msg):
        self.logger.info(msg)

    def warn(self, msg):
        self.logger.warning(msg)

    def remove(self, key):
        self.data.pop(key)

    def dump_to_log(self):
        self.logger.info("----------------")
        self.logger.info("Dumping context:")
        pp = pprint.PrettyPrinter(indent=4)
        self.logger.info(pp.pformat(self.data))
        self.logger.info("----------------")
