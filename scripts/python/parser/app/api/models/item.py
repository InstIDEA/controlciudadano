from enum import Enum
from typing import List
from typing import Optional
from pydantic import BaseModel

class Type(str, Enum):
    autodetect = 'autodetect'
    handwritten = 'handwriteen'
    documenttext = 'documenttext'
    scanned = 'scanned'

class FileInfo(BaseModel):
    remote: Optional[bool]
    path: str
    type: Optional[Type]
    version: Optional[str]
    
class DJBRItem(BaseModel):
    fullname: Optional[str]
    cedula: Optional[str]
    file: FileInfo
