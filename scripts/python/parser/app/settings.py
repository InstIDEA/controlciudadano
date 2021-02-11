from os import getenv
from dotenv import load_dotenv
load_dotenv()

PARSERENGINE_GO_BIN = getenv("PARSERENGINE_GO_BIN")
PARSERENGINE_IN = getenv("PARSERENGINE_IN")
PARSERENGINE_OUT = getenv("PARSERENGINE_OUT")
PG_CONN = getenv("PG_CONN")