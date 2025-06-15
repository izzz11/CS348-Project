from pydantic import BaseModel

# Request schema (used when creating a user)
class UserCreate(BaseModel):
    username: str
    password: str

# Request schema for login
class UserLogin(BaseModel):
    username: str
    password: str

# Response schema (used when returning a user)
class UserRead(BaseModel):
    uid: str
    username: str

# Optional: for internal use or updates
class User(BaseModel):
    id: int
    uid: str
    username: str
    password: str
