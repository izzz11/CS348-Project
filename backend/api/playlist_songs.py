from fastapi import APIRouter, HTTPException
from database.schema.models import PlaylistSongCreate
from database.utils.playlist_songs_repo import (
    add_song_to_playlist,
    remove_song_from_playlist,
    get_playlist_songs
)

router = APIRouter(
    prefix="/playlist-songs",
    tags=["playlist-songs"]
)

@router.post("/add")
async def add_song(playlist_song: PlaylistSongCreate):
    success = add_song_to_playlist(playlist_song)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add song to playlist")
    return {"message": "Song added to playlist successfully"}

@router.delete("/{pid}/{sid}")
async def remove_song(pid: str, sid: str):
    success = remove_song_from_playlist(pid, sid)
    if not success:
        raise HTTPException(status_code=404, detail="Song not found in playlist")
    return {"message": "Song removed from playlist successfully"}

@router.get("/{pid}")
async def get_songs(pid: str):
    songs = get_playlist_songs(pid)
    return {"songs": songs} 