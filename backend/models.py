# models.py
from sqlalchemy import Column, Integer, String
from db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String, unique=True, index=True)     # your assigned UID
    username = Column(String, unique=True, index=True)
    password = Column(String)                          # plaintext!
