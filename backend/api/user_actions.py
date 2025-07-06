from fastapi import APIRouter, HTTPException
from database.schema.models import UserTrackActionCreate, UserTrackActionUpdate, UserTrackActionRead
from database.utils.user_actions_repo import (
    create_user_track_action,
    update_user_track_action,
    get_user_track_action,
    get_user_track_actions,
    delete_user_track_action,
    increment_play_count,
    toggle_favourite,
    toggle_favourite_with_playlist,
    is_song_favourite
)

router = APIRouter(
    prefix="/user-actions",
    tags=["user-actions"]
)

@router.post("/create")
async def create_action(action: UserTrackActionCreate):
    """Create a new user track action"""
    success = create_user_track_action(action)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to create user track action")
    return {"message": "User track action created successfully"}

@router.put("/{uid}/{sid}")
async def update_action(uid: str, sid: str, update_data: UserTrackActionUpdate):
    """Update an existing user track action"""
    success = update_user_track_action(uid, sid, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="User track action not found")
    return {"message": "User track action updated successfully"}

@router.get("/{uid}/{sid}")
async def get_action(uid: str, sid: str):
    """Get a specific user track action"""
    action = get_user_track_action(uid, sid)
    if not action:
        raise HTTPException(status_code=404, detail="User track action not found")
    return action

@router.get("/{uid}")
async def get_user_actions(uid: str):
    """Get all track actions for a user"""
    actions = get_user_track_actions(uid)
    return {"actions": actions}

@router.delete("/{uid}/{sid}")
async def delete_action(uid: str, sid: str):
    """Delete a user track action"""
    success = delete_user_track_action(uid, sid)
    if not success:
        raise HTTPException(status_code=404, detail="User track action not found")
    return {"message": "User track action deleted successfully"}

@router.post("/{uid}/{sid}/play")
async def record_play(uid: str, sid: str):
    """Record a play for a user's track action"""
    success = increment_play_count(uid, sid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to record play")
    return {"message": "Play recorded successfully"}

@router.post("/{uid}/{sid}/toggle-favourite")
async def toggle_favourite_action(uid: str, sid: str):
    """Toggle favourite status for a user's track action with playlist management"""
    success = toggle_favourite_with_playlist(uid, sid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to toggle favourite")
    return {"message": "Favourite status toggled successfully"}

@router.get("/{uid}/favourites")
async def get_user_favourites(uid: str):
    """Get all favourite songs for a user"""
    actions = get_user_track_actions(uid)
    favourites = [action for action in actions if action.favourite]
    return {"favourites": favourites}

@router.get("/{uid}/recent")
async def get_recent_plays(uid: str, limit: int = 10):
    """Get recent plays for a user"""
    actions = get_user_track_actions(uid)
    # Sort by last_listened and take the most recent
    recent_actions = sorted(
        [action for action in actions if action.last_listened], 
        key=lambda x: x.last_listened, 
        reverse=True
    )[:limit]
    return {"recent_plays": recent_actions}

@router.get("/{uid}/{sid}/is-favourite")
async def get_is_song_favourite(uid: str, sid: str):
    """Check if a song is marked as favourite by a user"""
    is_favourite = is_song_favourite(uid, sid)
    return {"is_favourite": is_favourite}
