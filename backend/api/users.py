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

# get user by ID
@router.get("/{uid}", response_model=dict)
def get_user(uid: str):
    user = user_repo.get_by_uid(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return user data without password
    user_data = {k: v for k, v in user.items() if k != 'password'}
    return user_data

# update user profile
@router.put("/{uid}", response_model=dict)
def update_profile(uid: str, user_update: models.UserUpdate):
    # Check if user exists
    existing_user = user_repo.get_by_uid(uid)
    if not existing_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username is being updated and is already taken
    if user_update.username and user_update.username != existing_user['username']:
        user_with_same_name = user_repo.get_by_username(user_update.username)
        if user_with_same_name:
            raise HTTPException(status_code=400, detail="Username already taken")
    
    # Update user profile
    update_data = user_update.model_dump(exclude_unset=True)
    updated_user = user_repo.update_user_profile(uid, update_data)
    
    # Return updated user data without password
    user_data = {k: v for k, v in updated_user.items() if k != 'password'}
    return user_data

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
        is_favourite=True
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

