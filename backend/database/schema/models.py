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
    email: Optional[str] = None
    age: Optional[int] = None
    country: Optional[str] = None

# Request schema for updating user profile
class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    country: Optional[str] = None

# Optional: for internal use or updates
class User(BaseModel):
    id: int
    uid: str
    username: str
    password: str


# ================ PLAYLIST SCHEMA ================
class Playlist(BaseModel):
    pid: str
    name: str
    description: str
    private: bool

class PlaylistFetch(BaseModel):
    pid: str
    name: str
    description: str
    private: bool
    is_favourite: bool

# Request model for creating a playlist
class PlaylistCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    private: Optional[bool] = False

# Request model for updating a playlist
class PlaylistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    private: Optional[bool] = None

# New model for user-playlist relationship
class UserPlaylist(BaseModel):
    uid: str
    pid: str
    shared_at: Optional[str] = None
    is_favourite: bool

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

# ================ USER TRACK ACTIONS SCHEMA ================
class UserTrackActionCreate(BaseModel):
    uid: str
    sid: str
    last_listened: Optional[str] = None
    total_plays: Optional[int] = 0
    favourite: Optional[bool] = False
    rating: Optional[int] = None

class UserTrackActionUpdate(BaseModel):
    last_listened: Optional[str] = None
    total_plays: Optional[int] = None
    favourite: Optional[bool] = None
    rating: Optional[int] = None

class UserTrackActionRead(BaseModel):
    uid: str
    sid: str
    last_listened: Optional[str] = None
    total_plays: int
    favourite: bool
    rating: Optional[int] = None