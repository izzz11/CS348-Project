# schemas.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserRead(BaseModel):
    uid: str
    username: str

    class Config:
        orm_mode = True
