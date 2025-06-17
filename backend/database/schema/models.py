from pydantic import BaseModel
from typing import Optional

# ================ USER SCHEMA ================
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


# ================ PLAYLIST SCHEMA ================
class Playlist(BaseModel):
    pid: str
    uid: str
    name: str
    description: str
    private: bool
    shared_with: Optional[str] = None

# Request model for creating a playlist
class PlaylistCreate(BaseModel):
    uid: str
    name: str
    description: Optional[str] = ""
    private: Optional[bool] = False
    shared_with: Optional[str] = None

# Request model for updating a playlist
class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    private: Optional[bool] = None
    shared_with: Optional[str] = None
    

# ================ SONG SCHEMA ================
class SongRead(BaseModel):
    sid: str
    name: str
    genre: str
    artist: str
    duration: float
    audio_path: str
    audio_download_path: str

# ================ PLAYLIST SONGS SCHEMA ================
class PlaylistSongCreate(BaseModel):
    pid: str
    sid: str