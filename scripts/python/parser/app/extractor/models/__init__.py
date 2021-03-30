from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy import pool
from settings import PG_CONN

Base = declarative_base()

'''
https://docs.sqlalchemy.org/en/14/core/pooling.html#sqlalchemy.pool.NullPool
'''
Engine = create_engine(PG_CONN, poolclass=pool.NullPool)

Session = sessionmaker(bind=Engine)
Base.metadata.bind = Engine