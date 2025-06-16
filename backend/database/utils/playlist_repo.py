from database.db import run
import uuid

# 1️⃣ Create
def create_playlist(uid: str, name: str, description: str = "", private: bool = False, shared_with: str = None):
    pid = str(uuid.uuid4())
    
     # ✅ Check if user exists before inserting playlist
    user_check_sql = "SELECT uid FROM users WHERE uid = :uid"
    user_exists = run(user_check_sql, {"uid": uid}, fetchone=True)
    if not user_exists:
        raise ValueError(f"User with uid '{uid}' does not exist.")


    sql_insert = """
    INSERT INTO playlists (pid, uid, name, description, private, shared_with)
    VALUES (:pid, :uid, :name, :description, :private, :shared_with)
    """
    params = {
        "pid": pid,
        "uid": uid,
        "name": name,
        "description": description,
        "private": private,
        "shared_with": shared_with
    }

    # 🚫 No RETURNING — insert first
    run(sql_insert, params)

    # ✅ then SELECT
    sql_select = """
    SELECT pid, uid, name, description, private, shared_with
    FROM playlists
    WHERE pid = :pid
    """
    row = run(sql_select, {"pid": pid}, fetchone=True)
    return row

# 2️⃣ Read all playlists by user
def get_playlists_by_uid(uid: str):
    sql = """
    SELECT pid, uid, name, description, private, shared_with
    FROM playlists
    WHERE uid = :uid
    """
    rows = run(sql, {"uid": uid}, fetch=True)
    return rows

# 3️⃣ Read by pid
def get_playlist_by_pid(pid: str):
    sql = """
    SELECT pid, uid, name, description, private, shared_with
    FROM playlists
    WHERE pid = :pid
    """
    row = run(sql, {"pid": pid}, fetchone=True)
    return row

# 4️⃣ Update (no RETURNING, re-SELECT)
def update_playlist(pid: str, name: str = None, description: str = None, private: bool = None, shared_with: str = None):
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
    if shared_with is not None:
        fields.append("shared_with = :shared_with")
        params["shared_with"] = shared_with

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
    SELECT pid, uid, name, description, private, shared_with
    FROM playlists
    WHERE pid = :pid
    """
    row = run(sql_select, {"pid": pid}, fetchone=True)
    return row

# 5️⃣ Delete
def delete_playlist(pid: str):
    sql = """
    DELETE FROM playlists WHERE pid = :pid
    """
    run(sql, {"pid": pid})
