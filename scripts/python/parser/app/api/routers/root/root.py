from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_root():
    return {"status": "on", "version": "1.0.3"}
