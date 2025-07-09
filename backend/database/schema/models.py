from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

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

# Extended user profile for matching
class UserProfile(BaseModel):
    uid: str
    username: str
    name: Optional[str] = None
    age: Optional[int] = None
    country: Optional[str] = None
    favorite_genres: List[str] = []
    top_artists: List[str] = []
    total_songs: int = 0
    total_playlists: int = 0

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

# ================ MATCHING SYSTEM SCHEMA ================
class RecommendationType(str, Enum):
    SONG_BASED = "song_based"
    GENRE_BASED = "genre_based"
    ARTIST_BASED = "artist_based"
    PLAYLIST_BASED = "playlist_based"

class UserMatch(BaseModel):
    user1_id: str
    user2_id: str
    similarity_score: float = 0.0
    matched: bool = False
    liked_by_user1: bool = False
    liked_by_user2: bool = False
    matched_at: Optional[str] = None

class UserMatchCreate(BaseModel):
    user1_id: str
    user2_id: str
    liked_by_user1: bool = False
    liked_by_user2: bool = False

class UserMatchUpdate(BaseModel):
    liked_by_user1: Optional[bool] = None
    liked_by_user2: Optional[bool] = None
    matched: Optional[bool] = None

class UserRecommendation(BaseModel):
    uid: str
    recommended_uid: str
    recommendation_type: RecommendationType
    confidence_score: float = 0.0
    created_at: Optional[str] = None

class SongRecommendation(BaseModel):
    uid: str
    sid: str
    recommendation_reason: str
    confidence_score: float = 0.0
    created_at: Optional[str] = None

class PlaylistRecommendation(BaseModel):
    uid: str
    pid: str
    recommendation_reason: str
    confidence_score: float = 0.0
    created_at: Optional[str] = None

# ================ MATCHING RESPONSE SCHEMA ================
class MatchCandidate(BaseModel):
    uid: str
    username: str
    name: Optional[str] = None
    age: Optional[int] = None
    country: Optional[str] = None
    favorite_genres: List[str] = []
    top_artists: List[str] = []
    similarity_score: float = 0.0
    common_songs: int = 0
    common_genres: int = 0

class MatchResponse(BaseModel):
    candidates: List[MatchCandidate]
    total_candidates: int
    current_page: int
    total_pages: int