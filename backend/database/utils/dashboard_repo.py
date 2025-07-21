from database.db import run

def get_user_profile(uid: str) -> dict:
    """
    Retrieve user profile and summary stats: total plays, favourite count, playlists count
    """
    # query user information
    sql_user = """
    SELECT uid, username, email, country
    FROM users
    WHERE uid = :uid
    """
    user = run(sql_user, {"uid": uid}, fetchone=True)
    if not user:
        return None

    # query total plays
    sql_total_plays = """
    SELECT COALESCE(SUM(total_plays), 0) AS total_plays
    FROM user_track_actions
    WHERE uid = :uid
    """
    total_plays = run(sql_total_plays, {"uid": uid}, fetchone=True)["total_plays"]

    # query favorite count
    sql_favourite_count = """
    SELECT COUNT(sid) AS favourite_count
    FROM user_track_actions
    WHERE uid = :uid AND favourite = TRUE
    """
    favourite_count = run(sql_favourite_count, {"uid": uid}, fetchone=True)["favourite_count"]

    # Query the number of playlists
    sql_playlists_count = """
    SELECT COUNT(pid) AS playlists_count
    FROM user_playlists
    WHERE uid = :uid
    """
    playlists_count = run(sql_playlists_count, {"uid": uid}, fetchone=True)["playlists_count"]

    return {
        'uid': user['uid'],
        'username': user['username'],
        'name': user['username'],  # use username as name
        'email': user['email'],
        'country': user['country'],
        'total_plays': total_plays,
        'favourite_count': favourite_count,
        'playlists_count': playlists_count
    }

def get_global_top_songs(limit: int = 10) -> list:
    """
    Retrieve global top-played songs by total plays using song_play_counts view
    """
    sql = """
    SELECT sid, song_name AS name, artist, total_plays AS plays
    FROM song_play_counts
    ORDER BY total_plays DESC
    LIMIT :limit
    """
    rows = run(sql, {"limit": limit}, fetch=True)
    return [
        {'sid': r['sid'], 'name': r['name'], 'artist': r['artist'], 'plays': r['plays']}
        for r in rows
    ]

def get_global_top_artists(limit: int = 10) -> list:
    """
    Retrieve global top artists by play count using song_play_counts view
    """
    sql = """
    SELECT artist, SUM(total_plays) AS plays
    FROM song_play_counts
    GROUP BY artist
    ORDER BY plays DESC
    LIMIT :limit
    """
    rows = run(sql, {"limit": limit}, fetch=True)
    return [
        {'artist': r['artist'], 'plays': r['plays']}
        for r in rows
    ]

def get_global_top_genres(limit: int = 10) -> list:
    """
    Retrieve global top genres by play count using song_play_counts view and songs table
    """
    sql = """
    SELECT 
        g.genre_name AS genre,
        COALESCE(SUM(spc.total_plays), 0) AS plays
    FROM song_play_counts spc
    JOIN songs s ON s.sid = spc.sid
    JOIN song_genres sg ON s.sid = sg.sid
    JOIN genres g ON sg.gid = g.gid
    GROUP BY g.genre_name
    ORDER BY plays DESC
    LIMIT :limit
    """
    rows = run(sql, {"limit": limit}, fetch=True)
    return [
        {'genre': r['genre'], 'plays': r['plays']}
        for r in rows
    ]