from uvicorn import run
from fastapi import FastAPI
from api.routers import root
from api.routers import parser

app = FastAPI()

app.include_router(root.router)
app.include_router(parser.router)