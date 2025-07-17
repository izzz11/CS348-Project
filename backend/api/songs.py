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
    
    if not rows:
        return []
    
    return [
        {
            "sid": row["sid"],
            "name": row["name"],
            "genre": row["genre"] if row["genre"] else "",
            "artist": row["artist"],
            "duration": row["duration"],
            "audio_path": row["audio_path"],
            "audio_download_path": row["audio_download_path"]
        }
        for row in rows
    ]


@router.get("/fetch_paginated", response_model=List[models.SongRead])
def fetch_paginated_filtered(
    page: int = Query(1),
    page_size: int = Query(10),
    search: str | None = Query(None)
):
    rows = song_repo.get_song_paginated_filtered(page, page_size, search)
    return [
        {
            "sid": row["sid"],
            "name": row["name"],
            "genre": row["genre"] or "",
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

@router.get("/recommendations/{uid}", response_model=List[models.SongRead])
def get_recommendations(uid: str, limit: int = Query(5, description="Number of recommendations to return")):
    """Get personalized song recommendations for a user based on their preferences and listening history"""
    try:
        recommendations = song_repo.get_personalized_recommendations(uid, limit)
        return recommendations
    except Exception as e:
        print(f"Error getting recommendations: {e}")
        raise HTTPException(status_code=500, detail="Failed to get recommendations")
