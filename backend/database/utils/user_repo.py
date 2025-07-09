from database.db import run

def get_all_users():
    sql = """
    SELECT uid, username, password
    FROM users
    """
    result = run(sql, fetch=True)
    return result


def get_by_username(username: str):
    sql = """
    SELECT uid, username, password
    FROM users
    WHERE username = :username
    """
    result = run(sql, {"username": username}, fetchone=True)
    return result


def get_by_uid(uid: str):
    sql = """
    SELECT uid, username, password, email, age, country
    FROM users
    WHERE uid = :uid
    """
    result = run(sql, {"uid": uid}, fetchone=True)
    return result


def update_user_profile(uid: str, update_data: dict):
    """
    Update user profile information.
    
    Args:
        uid: User ID
        update_data: Dictionary containing fields to update (username, email, age, country)
    
    Returns:
        Updated user data
    """
    # Filter out None values
    filtered_data = {k: v for k, v in update_data.items() if v is not None}
    
    if not filtered_data:
        # Nothing to update
        return get_by_uid(uid)
    
    # Build dynamic SQL update statement
    set_parts = [f"{field} = :{field}" for field in filtered_data.keys()]
    set_clause = ", ".join(set_parts)
    
    sql = f"""
    UPDATE users
    SET {set_clause}
    WHERE uid = :uid
    """
    
    # Add uid to params
    params = {**filtered_data, "uid": uid}
    
    # Execute update
    run(sql, params)
    
    # Return updated user data
    return get_by_uid(uid)


def create_user(username: str, password: str):
    import uuid

    uid = str(uuid.uuid4())

    # ✅ MySQL 不支持 RETURNING
    sql_insert = """
    INSERT INTO users (uid, username, password)
    VALUES (:uid, :username, :password)
    """

    params = {
        "uid": uid,
        "username": username,
        "password": password
    }

    # 先插入
    run(sql_insert, params)

    # ✅ 再查询
    sql_select = """
    SELECT uid, username, password
    FROM users
    WHERE uid = :uid
    """

    row = run(sql_select, {"uid": uid}, fetchone=True)
    return row

def get_user_profile(uid: str):
    """
    Get extended user profile with music taste information
    """
    sql = """
    SELECT u.uid, u.username, u.name, u.age, u.country,
           COUNT(DISTINCT uta.sid) as total_songs,
           COUNT(DISTINCT up.pid) as total_playlists
    FROM users u
    LEFT JOIN user_track_actions uta ON u.uid = uta.uid
    LEFT JOIN user_playlists up ON u.uid = up.uid
    WHERE u.uid = :uid
    GROUP BY u.uid, u.username, u.name, u.age, u.country
    """
    result = run(sql, {"uid": uid}, fetchone=True)
    return result

def get_user_favorite_genres(uid: str):
    """
    Get user's favorite genres based on their music actions
    """
    sql = """
    SELECT s.genre, COUNT(*) as play_count
    FROM user_track_actions uta
    JOIN songs s ON uta.sid = s.sid
    WHERE uta.uid = :uid AND (uta.favourite = TRUE OR uta.total_plays > 0)
    GROUP BY s.genre
    ORDER BY play_count DESC
    LIMIT 5
    """
    result = run(sql, {"uid": uid}, fetch=True)
    return [row['genre'] for row in result]

def get_user_top_artists(uid: str):
    """
    Get user's top artists based on their music actions
    """
    sql = """
    SELECT s.artist, COUNT(*) as play_count
    FROM user_track_actions uta
    JOIN songs s ON uta.sid = s.sid
    WHERE uta.uid = :uid AND (uta.favourite = TRUE OR uta.total_plays > 0)
    GROUP BY s.artist
    ORDER BY play_count DESC
    LIMIT 5
    """
    result = run(sql, {"uid": uid}, fetch=True)
    return [row['artist'] for row in result]

def get_users_for_matching(current_uid: str, limit: int = 10, offset: int = 0):
    """
    Get users for matching, excluding the current user and already matched users
    """
    sql = """
    SELECT u.uid, u.username, u.name, u.age, u.country
    FROM users u
    WHERE u.uid != :current_uid
    AND u.uid NOT IN (
        SELECT user2_id FROM user_matches WHERE user1_id = :current_uid
        UNION
        SELECT user1_id FROM user_matches WHERE user2_id = :current_uid
    )
    LIMIT :limit OFFSET :offset
    """
    result = run(sql, {
        "current_uid": current_uid,
        "limit": limit,
        "offset": offset
    }, fetch=True)
    return result

def calculate_user_similarity(user1_id: str, user2_id: str):
    """
    Calculate similarity score between two users based on music taste
    """
    # Get common genres
    genre_sql = """
    SELECT COUNT(DISTINCT s1.genre) as common_genres
    FROM user_track_actions uta1
    JOIN songs s1 ON uta1.sid = s1.sid
    JOIN user_track_actions uta2 ON s1.sid = uta2.sid
    JOIN songs s2 ON uta2.sid = s2.sid
    WHERE uta1.uid = :user1_id AND uta2.uid = :user2_id
    AND s1.genre = s2.genre
    AND (uta1.favourite = TRUE OR uta2.favourite = TRUE)
    """
    genre_result = run(genre_sql, {
        "user1_id": user1_id,
        "user2_id": user2_id
    }, fetchone=True)
    
    # Get common artists
    artist_sql = """
    SELECT COUNT(DISTINCT s1.artist) as common_artists
    FROM user_track_actions uta1
    JOIN songs s1 ON uta1.sid = s1.sid
    JOIN user_track_actions uta2 ON s1.sid = uta2.sid
    JOIN songs s2 ON uta2.sid = s2.sid
    WHERE uta1.uid = :user1_id AND uta2.uid = :user2_id
    AND s1.artist = s2.artist
    AND (uta1.favourite = TRUE OR uta2.favourite = TRUE)
    """
    artist_result = run(artist_sql, {
        "user1_id": user1_id,
        "user2_id": user2_id
    }, fetchone=True)
    
    # Calculate similarity score (simple weighted average)
    common_genres = genre_result['common_genres'] if genre_result else 0
    common_artists = artist_result['common_artists'] if artist_result else 0
    
    # Simple similarity calculation (can be improved)
    similarity = (common_genres * 0.4 + common_artists * 0.6) / 10.0
    return min(similarity, 1.0)  # Cap at 1.0

def get_total_users_for_matching(current_uid: str):
    """
    Get total count of users available for matching
    """
    sql = """
    SELECT COUNT(*) as total
    FROM users u
    WHERE u.uid != :current_uid
    AND u.uid NOT IN (
        SELECT user2_id FROM user_matches WHERE user1_id = :current_uid
        UNION
        SELECT user1_id FROM user_matches WHERE user2_id = :current_uid
    )
    """
    result = run(sql, {"current_uid": current_uid}, fetchone=True)
    return result['total'] if result else 0
