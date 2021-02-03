from fastapi import APIRouter
from api.routers.root.root import router as root_router

router = APIRouter()

router.include_router(root_router)
