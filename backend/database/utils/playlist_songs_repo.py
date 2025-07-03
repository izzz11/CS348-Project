from typing import List
from database.schema.models import PlaylistSongCreate
from database.db import run

def add_song_to_playlist(playlist_song: PlaylistSongCreate) -> bool:
    """
    Add a song to a playlist
    Returns True if successful, False otherwise
    """
    try:
        # First check if playlist exists
        check_playlist_sql = """
        SELECT 1 FROM playlists 
        WHERE pid = :pid
        """
        playlist_exists = run(check_playlist_sql, {"pid": playlist_song.pid}, fetchone=True)
        if not playlist_exists:
            print(f"Playlist with pid {playlist_song.pid} does not exist")
            return False

        # Then check if song exists
        check_song_sql = """
        SELECT 1 FROM songs 
        WHERE sid = :sid
        """
        song_exists = run(check_song_sql, {"sid": playlist_song.sid}, fetchone=True)
        if not song_exists:
            print(f"Song with sid {playlist_song.sid} does not exist")
            return False

        # Check if song already exists in playlist
        check_sql = """
        SELECT 1 FROM playlist_songs 
        WHERE pid = :pid AND sid = :sid
        """
        params = {
            "pid": playlist_song.pid,
            "sid": playlist_song.sid
        }
        
        exists = run(check_sql, params, fetchone=True)
        if exists:
            print(f"Song {playlist_song.sid} already exists in playlist {playlist_song.pid}")
            return False  # Song already exists in playlist
        
        # Add song to playlist
        insert_sql = """
        INSERT INTO playlist_songs (pid, sid)
        VALUES (:pid, :sid)
        """
        run(insert_sql, params)
        print(f"Successfully added song {playlist_song.sid} to playlist {playlist_song.pid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def remove_song_from_playlist(pid: str, sid: str) -> bool:
    """
    Remove a song from a playlist
    Returns True if successful, False otherwise
    """
    try:
        sql = """
        DELETE FROM playlist_songs 
        WHERE pid = :pid AND sid = :sid
        """
        params = {"pid": pid, "sid": sid}
        
        # First check if the song exists in the playlist
        check_sql = """
        SELECT 1 FROM playlist_songs 
        WHERE pid = :pid AND sid = :sid
        """
        exists = run(check_sql, params, fetchone=True)
        if not exists:
            print(f"Song {sid} does not exist in playlist {pid}")
            return False
            
        # Then delete it
        run(sql, params)
        print(f"Successfully removed song {sid} from playlist {pid}")
        return True
        
    except Exception as e:
        print(f"Database error: {e}")
        return False

def get_playlist_songs(pid: str) -> List[str]:
    """
    Get all songs in a playlist
    Returns a list of song IDs
    """
    try:
        sql = """
        SELECT sid 
        FROM playlist_songs 
        WHERE pid = :pid
        """
        print("pid", pid)
        rows = run(sql, {"pid": pid}, fetch=True)
        print("rows", rows)
        return [row['sid'] for row in rows] if rows else []
        
    except Exception as e:
        print(f"Database error: {e}")
        return [] 