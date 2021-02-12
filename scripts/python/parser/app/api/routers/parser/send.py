from fastapi import APIRouter
from api.models.item import DJBRItem
from extractor.core import DJBRParser

router = APIRouter()

@router.post("/send")
def read_item(item: DJBRItem):
    q = item.dict()
    parser = DJBRParser(q['file']['path'])
    parser.extract()
    parser.save()
    return parser.get_stdout()