# routers/users.py
from fastapi import APIRouter, HTTPException, status
from database.utils import user_repo, playlist_repo
from database.schema import models

router = APIRouter(prefix="/users", tags=["users"])

# fetch all users
@router.get("/fetch_all", response_model=list[models.UserRead])
def fetch_all_users():
    rows = user_repo.get_all_users()
    
    if not rows:
        return []
    return [{"uid": row['uid'], "username": row['username']} for row in rows]

# register
@router.post("/register", response_model=models.UserRead,
             status_code=status.HTTP_201_CREATED)
def register(u: models.UserCreate):
    if user_repo.get_by_username(u.username):
        raise HTTPException(400, "Username already registered")

    row = user_repo.create_user(u.username, u.password)
    # Create default playlist for the new user
    playlist_repo.create_playlist(
        uid=row['uid'],
        name='My Favourites',
        description='Your favorite songs collection',
        private=True,
        shared_with=''
    )

    print(f"User created: {row}")
    return {"uid": row['uid'], "username": row['username']}

# login
@router.post("/login", response_model=models.UserRead)
def login(u: models.UserLogin):
    row = user_repo.get_by_username(u.username)
    
    if not row or row['password'] != u.password:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid credentials")
    return {"uid": row['uid'], "username": row['username']}
