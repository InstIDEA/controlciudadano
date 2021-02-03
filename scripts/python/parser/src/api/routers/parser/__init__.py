from fastapi import APIRouter
from api.routers.parser.send import router as send_router

router = APIRouter()

router.include_router(
    send_router,
    prefix='/parser'
)
