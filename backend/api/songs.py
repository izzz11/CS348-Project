# routers/songs.py
from fastapi import APIRouter, HTTPException, status, Query
from database.utils import song_repo
from database.schema import models
from typing import List


router = APIRouter(prefix="/songs", tags=["songs"])

# fetch all songs
@router.get("/fetch_all", response_model=list[models.SongRead])
def fetch_all_songs():
    rows = song_repo.get_all_songs()
    
    print("Fetched songs:", rows)  # Debugging line
    if not rows:
        return []
    
    return [
        {
            "sid": row["sid"],
            "name": row["name"],
            "genre": row["genre"],
            "artist": row["artist"],
            "duration": row["duration"],
            "audio_path": row["audio_path"],
            "audio_download_path": row["audio_download_path"]
        }
        for row in rows
    ]

@router.get("/by_genre", response_model=List[models.SongRead])
def get_by_genre(genre: str = Query(..., description="e.g. pop")):
    return song_repo.search_by_genre(genre)

@router.get("/by_artist", response_model=List[models.SongRead])
def get_by_artist(artist: str = Query(...)):
    return song_repo.search_by_artist(artist)

@router.get("/by_name", response_model=List[models.SongRead])
def get_by_name(name: str = Query(...)):
    return song_repo.search_by_name(name)

@router.get("/by_duration", response_model=List[models.SongRead])
def get_by_duration(
    min_duration: float = Query(0),
    max_duration: float = Query(1000)
):
    return song_repo.search_by_duration(min_duration, max_duration)

@router.get("/fetch-song", response_model=models.SongRead)
def fetch_song(sid: str):
    return song_repo.search_by_sid(sid)[0]
