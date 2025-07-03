from database.db import run
import uuid

# 1️⃣ Create playlist and associate with user
def create_playlist(uid: str, name: str, description: str = "", private: bool = False):
    pid = str(uuid.uuid4())
    
    # ✅ Check if user exists before inserting playlist
    user_check_sql = "SELECT uid FROM users WHERE uid = :uid"
    user_exists = run(user_check_sql, {"uid": uid}, fetchone=True)
    if not user_exists:
        raise ValueError(f"User with uid '{uid}' does not exist.")

    # Create the playlist
    sql_insert_playlist = """
    INSERT INTO playlists (pid, name, description, private)
    VALUES (:pid, :name, :description, :private)
    """
    playlist_params = {
        "pid": pid,
        "name": name,
        "description": description,
        "private": private
    }
    run(sql_insert_playlist, playlist_params)

    # Associate playlist with user
    sql_insert_user_playlist = """
    INSERT INTO user_playlists (uid, pid)
    VALUES (:uid, :pid)
    """
    user_playlist_params = {
        "uid": uid,
        "pid": pid
    }
    run(sql_insert_user_playlist, user_playlist_params)

    # ✅ Return the created playlist
    sql_select = """
    SELECT pid, name, description, private
    FROM playlists
    WHERE pid = :pid
    """
    row = run(sql_select, {"pid": pid}, fetchone=True)
    return row

# 2️⃣ Read all playlists by user
def get_playlists_by_uid(uid: str):
    sql = """
    SELECT p.pid, p.name, p.description, p.private
    FROM playlists p
    JOIN user_playlists up ON p.pid = up.pid
    WHERE up.uid = :uid
    """
    rows = run(sql, {"uid": uid}, fetch=True)
    return rows

# 3️⃣ Read by pid
def get_playlist_by_pid(pid: str):
    sql = """
    SELECT pid, name, description, private
    FROM playlists
    WHERE pid = :pid
    """
    row = run(sql, {"pid": pid}, fetchone=True)
    return row

# 4️⃣ Update playlist
def update_playlist(pid: str, name: str = None, description: str = None, private: bool = None):
    fields = []
    params = {"pid": pid}
    if name is not None:
        fields.append("name = :name")
        params["name"] = name
    if description is not None:
        fields.append("description = :description")
        params["description"] = description
    if private is not None:
        fields.append("private = :private")
        params["private"] = private

    if not fields:
        raise ValueError("No fields to update!")

    sql_update = f"""
    UPDATE playlists
    SET {', '.join(fields)}
    WHERE pid = :pid
    """

    run(sql_update, params)

    # ✅ Re-select the updated row
    sql_select = """
    SELECT pid, name, description, private
    FROM playlists
    WHERE pid = :pid
    """
    row = run(sql_select, {"pid": pid}, fetchone=True)
    return row

# 5️⃣ Delete playlist (also removes from user_playlists due to CASCADE)
def delete_playlist(pid: str):
    sql = """
    DELETE FROM playlists WHERE pid = :pid
    """
    run(sql, {"pid": pid})

# 6️⃣ Share playlist with another user
def share_playlist_with_user(pid: str, target_uid: str):
    # Check if playlist exists
    playlist = get_playlist_by_pid(pid)
    if not playlist:
        raise ValueError(f"Playlist with pid '{pid}' does not exist.")
    
    # Check if target user exists
    user_check_sql = "SELECT uid FROM users WHERE uid = :uid"
    user_exists = run(user_check_sql, {"uid": target_uid}, fetchone=True)
    if not user_exists:
        raise ValueError(f"User with uid '{target_uid}' does not exist.")

    # Check if already shared
    existing_sql = """
    SELECT uid, pid FROM user_playlists 
    WHERE uid = :uid AND pid = :pid
    """
    existing = run(existing_sql, {"uid": target_uid, "pid": pid}, fetchone=True)
    if existing:
        raise ValueError(f"Playlist is already shared with user {target_uid}")

    # Share the playlist
    sql_insert = """
    INSERT INTO user_playlists (uid, pid)
    VALUES (:uid, :pid)
    """
    run(sql_insert, {"uid": target_uid, "pid": pid})

# 7️⃣ Get users who have access to a playlist
def get_playlist_users(pid: str):
    sql = """
    SELECT up.uid, up.shared_at
    FROM user_playlists up
    WHERE up.pid = :pid
    """
    rows = run(sql, {"pid": pid}, fetch=True)
    return rows
