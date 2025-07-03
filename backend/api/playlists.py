# playlist.py

from fastapi import APIRouter, HTTPException, status
from database.utils import playlist_repo
from database.schema import models
from typing import List

router = APIRouter(
    prefix="/playlists",
    tags=["playlists"]
)

# Create
@router.post("/", response_model=models.Playlist)
def create_playlist(uid: str, p: models.PlaylistCreate):
    row = playlist_repo.create_playlist(
        uid=uid,
        name=p.name,
        description=p.description,
        private=p.private
    )
    
    return row

# Get all playlists for a user
@router.get("/user/{uid}", response_model=List[models.Playlist])
def get_playlists(uid: str):
    rows = playlist_repo.get_playlists_by_uid(uid)
    return rows  # Already list of dicts

# Get single playlist by pid
@router.get("/{pid}", response_model=models.Playlist)
def get_playlist(pid: str):
    row = playlist_repo.get_playlist_by_pid(pid)
    if not row:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return row  # Already a dict

# Update
@router.put("/{pid}", response_model=models.Playlist)
def update_playlist(pid: str, p: models.PlaylistUpdate):
    row = playlist_repo.update_playlist(
        pid=pid,
        name=p.name,
        description=p.description,
        private=p.private
    )
    return row  # Already a dict

# Delete
@router.delete("/{pid}")
def delete_playlist(pid: str):
    playlist_repo.delete_playlist(pid)
    return {"message": f"Playlist {pid} deleted"}

# Share playlist with user
@router.post("/{pid}/share")
def share_playlist(pid: str, target_uid: str):
    try:
        playlist_repo.share_playlist_with_user(pid, target_uid)
        return {"message": f"Playlist {pid} shared with user {target_uid}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Get users who have access to a playlist
@router.get("/{pid}/users", response_model=List[models.UserPlaylist])
def get_playlist_users(pid: str):
    rows = playlist_repo.get_playlist_users(pid)
    return rows
