# routers/users.py
from fastapi import APIRouter, HTTPException, status
from database import user_repo
import schemas

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/register", response_model=schemas.UserRead,
             status_code=status.HTTP_201_CREATED)
def register(u: schemas.UserCreate):
    if user_repo.get_by_username(u.username):
        raise HTTPException(400, "Username already registered")

    row = user_repo.create_user(u.username, u.password)
    # row is a SQLAlchemy Row: (id, uid, username, password)
    return {"uid": row.uid, "username": row.username}

@router.post("/login", response_model=schemas.UserRead)
def login(u: schemas.UserLogin):
    row = user_repo.get_by_username(u.username)
    if not row or row.password != u.password:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return {"uid": row.uid, "username": row.username}
