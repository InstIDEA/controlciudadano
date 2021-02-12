from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from settings import PG_CONN

Base = declarative_base()
Engine = create_engine(PG_CONN)
Session = sessionmaker(bind=Engine)
Base.metadata.bind = Engine