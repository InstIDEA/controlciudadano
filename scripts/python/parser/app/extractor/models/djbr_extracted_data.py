from sqlalchemy import Column
from sqlalchemy import Text
from sqlalchemy import BigInteger
from sqlalchemy.dialects.postgresql import JSONB
from extractor.models import Base
from extractor.models import Engine

class DJBRExtractedData(Base):
    __tablename__ = 'djbr_extracted_data'
    __table_args__ = {'schema': 'staging'}

    id = Column(BigInteger, primary_key=True)
    fullname = Column(Text)
    json = Column(JSONB)
    hash = Column(Text)

    def __init__(self, fullname, json, hash):
        self.fullname = fullname
        self.json = json
        self.hash = hash

Base.metadata.create_all(Engine)