from fastapi import APIRouter
from api.models.item import DJBRItem

router = APIRouter()

@router.post("/send")
def read_item(item: DJBRItem):
    q = item.dict()
    return q
