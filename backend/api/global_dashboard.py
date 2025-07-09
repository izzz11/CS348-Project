from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from database.utils.dashboard_repo import (
    get_user_profile,
    get_global_top_songs,
    get_global_top_artists,
    get_global_top_genres
)

# ===== Pydantic Schemas for Dashboard =====
class UserProfile(BaseModel):
    uid: str
    username: str
    name: str
    email: Optional[str]
    country: Optional[str]
    total_plays: int
    favourite_count: int
    playlists_count: int

class SongStats(BaseModel):
    sid: str
    name: str
    artist: str
    plays: int

class ArtistStats(BaseModel):
    artist: str
    plays: int

class GenreStats(BaseModel):
    genre: str
    plays: int

router = APIRouter(
    prefix="/dashboard",
    tags=["global-dashboard"]
)

@router.get("/profile/{uid}", response_model=UserProfile)
async def user_profile_endpoint(uid: str):
    profile = get_user_profile(uid)
    if profile is None:
        raise HTTPException(status_code=404, detail="User not found")
    return profile

@router.get("/global/top-songs", response_model=List[SongStats])
async def global_top_songs_endpoint(limit: int = 10):
    return get_global_top_songs(limit)

@router.get("/global/top-artists", response_model=List[ArtistStats])
async def global_top_artists_endpoint(limit: int = 10):
    return get_global_top_artists(limit)

@router.get("/global/top-genres", response_model=List[GenreStats])
async def global_top_genres_endpoint(limit: int = 10):
    return get_global_top_genres(limit)