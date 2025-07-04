from typing import List, Optional
from datetime import datetime
from database.schema.models import UserTrackActionCreate, UserTrackActionUpdate, UserTrackActionRead
from database.db import run

def create_user_track_action(action: UserTrackActionCreate) -> bool:
    """
    Create a new user track action
    Returns True if successful, False otherwise
    """
    try:
        # Check if user exists
        check_user_sql = """
        SELECT 1 FROM users 
        WHERE uid = :uid
        """
        user_exists = run(check_user_sql, {"uid": action.uid}, fetchone=True)
        if not user_exists:
            print(f"User with uid {action.uid} does not exist")
            return False

        # Check if song exists
        check_song_sql = """
        SELECT 1 FROM songs 
        WHERE sid = :sid
        """
        song_exists = run(check_song_sql, {"sid": action.sid}, fetchone=True)
        if not song_exists:
            print(f"Song with sid {action.sid} does not exist")
            return False

        # Check if action already exists
        check_action_sql = """
        SELECT 1 FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": action.uid, "sid": action.sid}
        exists = run(check_action_sql, params, fetchone=True)
        
        if exists:
            print(f"User track action already exists for user {action.uid} and song {action.sid}")
            return False

        # Insert new action
        insert_sql = """
        INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
        VALUES (:uid, :sid, :last_listened, :total_plays, :favourite, :rating)
        """
        
        insert_params = {
            "uid": action.uid,
            "sid": action.sid,
            "last_listened": action.last_listened or datetime.now().isoformat(),
            "total_plays": action.total_plays or 0,
            "favourite": action.favourite or False,
            "rating": action.rating
        }
        
        run(insert_sql, insert_params)
        print(f"Successfully created user track action for user {action.uid} and song {action.sid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def update_user_track_action(uid: str, sid: str, update_data: UserTrackActionUpdate) -> bool:
    """
    Update an existing user track action
    Returns True if successful, False otherwise
    """
    try:
        # Check if action exists
        check_sql = """
        SELECT 1 FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": uid, "sid": sid}
        exists = run(check_sql, params, fetchone=True)
        if not exists:
            print(f"User track action does not exist for user {uid} and song {sid}")
            return False

        # Build update query dynamically based on provided fields
        update_fields = []
        update_params = {"uid": uid, "sid": sid}
        
        if update_data.last_listened is not None:
            update_fields.append("last_listened = :last_listened")
            update_params["last_listened"] = update_data.last_listened
            
        if update_data.total_plays is not None:
            update_fields.append("total_plays = :total_plays")
            update_params["total_plays"] = update_data.total_plays
            
        if update_data.favourite is not None:
            update_fields.append("favourite = :favourite")
            update_params["favourite"] = update_data.favourite
            
        if update_data.rating is not None:
            update_fields.append("rating = :rating")
            update_params["rating"] = update_data.rating

        if not update_fields:
            print("No fields to update")
            return False

        update_sql = f"""
        UPDATE user_track_actions 
        SET {', '.join(update_fields)}
        WHERE uid = :uid AND sid = :sid
        """
        
        run(update_sql, update_params)
        print(f"Successfully updated user track action for user {uid} and song {sid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_user_track_action(uid: str, sid: str) -> Optional[UserTrackActionRead]:
    """
    Get a specific user track action
    Returns the action if found, None otherwise
    """
    try:
        sql = """
        SELECT uid, sid, last_listened, total_plays, favourite, rating
        FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": uid, "sid": sid}
        row = run(sql, params, fetchone=True)
        
        if row:
            return UserTrackActionRead(**row)
        return None
        
    except Exception as e:
        print(f"Database error: {e}")
        return None

def get_user_track_actions(uid: str) -> List[UserTrackActionRead]:
    """
    Get all track actions for a user
    Returns a list of user track actions
    """
    try:
        sql = """
        SELECT uid, sid, last_listened, total_plays, favourite, rating
        FROM user_track_actions 
        WHERE uid = :uid
        """
        rows = run(sql, {"uid": uid}, fetch=True)
        
        if rows:
            return [UserTrackActionRead(**row) for row in rows]
        return []
        
    except Exception as e:
        print(f"Database error: {e}")
        return []

def delete_user_track_action(uid: str, sid: str) -> bool:
    """
    Delete a user track action
    Returns True if successful, False otherwise
    """
    try:
        # Check if action exists
        check_sql = """
        SELECT 1 FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": uid, "sid": sid}
        exists = run(check_sql, params, fetchone=True)
        if not exists:
            print(f"User track action does not exist for user {uid} and song {sid}")
            return False

        # Delete the action
        delete_sql = """
        DELETE FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        run(delete_sql, params)
        print(f"Successfully deleted user track action for user {uid} and song {sid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def increment_play_count(uid: str, sid: str) -> bool:
    """
    Increment the play count for a user's track action
    Returns True if successful, False otherwise
    """
    try:
        # Check if action exists
        check_sql = """
        SELECT total_plays FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": uid, "sid": sid}
        row = run(check_sql, params, fetchone=True)
        
        if not row:
            # Create new action with 1 play
            action = UserTrackActionCreate(
                uid=uid,
                sid=sid,
                total_plays=1,
                last_listened=datetime.now().isoformat()
            )
            return create_user_track_action(action)
        
        # Update existing action
        update_sql = """
        UPDATE user_track_actions 
        SET total_plays = total_plays + 1, last_listened = :last_listened
        WHERE uid = :uid AND sid = :sid
        """
        update_params = {
            "uid": uid,
            "sid": sid,
            "last_listened": datetime.now().isoformat()
        }
        run(update_sql, update_params)
        print(f"Successfully incremented play count for user {uid} and song {sid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def toggle_favourite(uid: str, sid: str) -> bool:
    """
    Toggle the favourite status for a user's track action
    Returns True if successful, False otherwise
    """
    try:
        # Check if action exists
        check_sql = """
        SELECT favourite FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": uid, "sid": sid}
        row = run(check_sql, params, fetchone=True)
        
        if not row:
            # Create new action with favourite = True
            action = UserTrackActionCreate(
                uid=uid,
                sid=sid,
                favourite=True
            )
            return create_user_track_action(action)
        
        # Toggle existing favourite status
        new_favourite = not row["favourite"]
        update_sql = """
        UPDATE user_track_actions 
        SET favourite = :favourite
        WHERE uid = :uid AND sid = :sid
        """
        update_params = {
            "uid": uid,
            "sid": sid,
            "favourite": new_favourite
        }
        run(update_sql, update_params)
        print(f"Successfully toggled favourite status for user {uid} and song {sid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def is_song_favourite(uid: str, sid: str) -> bool:
    """
    Check if a song is marked as favourite by a user
    Returns True if the song is favourite, False otherwise
    """
    try:
        sql = """
        SELECT favourite FROM user_track_actions 
        WHERE uid = :uid AND sid = :sid
        """
        params = {"uid": uid, "sid": sid}
        row = run(sql, params, fetchone=True)
        
        if row:
            return row["favourite"]
        return False
        
    except Exception as e:
        print(f"Database error: {e}")
        return False
