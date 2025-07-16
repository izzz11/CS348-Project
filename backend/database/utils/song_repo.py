
from database.db import run
import random
from typing import List, Dict, Any

def get_all_songs():
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        GROUP BY s.sid
    """
    return run(sql, fetch=True)

def get_song_paginated(page: int = 1, page_size: int = 20):
    offset = (page - 1) * page_size
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        GROUP BY s.sid
        LIMIT :page_size
        OFFSET :offset
    """
    return run(sql, {"offset": offset, "page_size": page_size}, fetch=True)

def search_by_genre(genre_substr: str):
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        JOIN song_genres sg ON s.sid = sg.sid
        JOIN genres g ON sg.gid = g.gid
        WHERE g.genre_name LIKE :genre
        GROUP BY s.sid
    """
    return run(sql, {"genre": f"%{genre_substr}%"}, fetch=True)

def search_by_artist(artist_name: str):
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        WHERE s.artist LIKE :artist
        GROUP BY s.sid
    """
    return run(sql, {"artist": f"%{artist_name}%"}, fetch=True)

def search_by_name(keyword: str):
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        WHERE s.name LIKE :keyword
        GROUP BY s.sid
    """
    return run(sql, {"keyword": f"%{keyword}%"}, fetch=True)

def search_by_duration(min_sec: float = 0, max_sec: float = 1000):
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        WHERE s.duration BETWEEN :min_sec AND :max_sec
        GROUP BY s.sid
    """
    return run(sql, {"min_sec": min_sec, "max_sec": max_sec}, fetch=True)

def search_by_sid(sid: str):
    sql = """
        SELECT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
        FROM songs s
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        WHERE s.sid = :sid
        GROUP BY s.sid
    """
    return run(sql, {"sid": sid}, fetch=True)

def get_personalized_recommendations(uid: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Generate personalized song recommendations based on:
    1. User's favorite songs (genres, artists, duration patterns)
    2. Top 5 genres from user's listening history
    3. Songs from user's playlists
    4. Exclude songs user has already played
    """
    # Step 1: Get user's favorite songs and their characteristics
    favorite_songs_sql = """
        SELECT s.*, g.genre_name, uta.total_plays, uta.rating
        FROM user_track_actions uta
        JOIN songs s ON uta.sid = s.sid
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        WHERE uta.uid = :uid AND uta.favourite = TRUE
    """
    favorite_songs = run(favorite_songs_sql, {"uid": uid}, fetch=True)
    
    # Step 2: Get top 5 genres from user's listening history
    top_genres_sql = """
        SELECT g.genre_name, SUM(uta.total_plays) as total_plays
        FROM user_track_actions uta
        JOIN songs s ON uta.sid = s.sid
        JOIN song_genres sg ON s.sid = sg.sid
        JOIN genres g ON sg.gid = g.gid
        WHERE uta.uid = :uid
        GROUP BY g.genre_name
        ORDER BY total_plays DESC
        LIMIT 5
    """
    top_genres = run(top_genres_sql, {"uid": uid}, fetch=True)
    
    # Step 3: Get artists from user's favorites and listening history
    favorite_artists_sql = """
        SELECT s.artist, SUM(uta.total_plays) as total_plays, 
               COUNT(CASE WHEN uta.favourite = TRUE THEN 1 END) as favorite_count
        FROM user_track_actions uta
        JOIN songs s ON uta.sid = s.sid
        WHERE uta.uid = :uid
        GROUP BY s.artist
        ORDER BY favorite_count DESC, total_plays DESC
        LIMIT 10
    """
    favorite_artists = run(favorite_artists_sql, {"uid": uid}, fetch=True)
    
    # Step 4: Get songs from user's playlists (excluding favorites playlist)
    playlist_songs_sql = """
        SELECT DISTINCT s.sid, s.artist, g.genre_name
        FROM playlist_songs ps
        JOIN user_playlists up ON ps.pid = up.pid
        JOIN songs s ON ps.sid = s.sid
        LEFT JOIN song_genres sg ON s.sid = sg.sid
        LEFT JOIN genres g ON sg.gid = g.gid
        WHERE up.uid = :uid AND up.is_favourite = FALSE
    """
    playlist_songs = run(playlist_songs_sql, {"uid": uid}, fetch=True)
    
    # Step 5: Get songs user has already played (to exclude)
    played_songs_sql = """
        SELECT sid FROM user_track_actions WHERE uid = :uid
    """
    played_songs = run(played_songs_sql, {"uid": uid}, fetch=True)
    played_song_ids = {song['sid'] for song in played_songs} if played_songs else set()
    
    # Step 6: Calculate average duration preference
    avg_duration_sql = """
        SELECT AVG(s.duration) as avg_duration, STDDEV(s.duration) as std_duration
        FROM user_track_actions uta
        JOIN songs s ON uta.sid = s.sid
        WHERE uta.uid = :uid AND uta.favourite = TRUE
    """
    duration_stats = run(avg_duration_sql, {"uid": uid}, fetchone=True)
    
    # Build recommendation criteria
    recommendation_criteria = []    
    
    # Criteria 1: Songs from top genres
    if top_genres:
        genre_names = [genre['genre_name'] for genre in top_genres]
        genre_placeholders = ', '.join([f"'{genre}'" for genre in genre_names])
        recommendation_criteria.append(f"g.genre_name IN ({genre_placeholders})")
    
    # Criteria 2: Songs from favorite artists
    if favorite_artists:
        artist_names = [artist['artist'] for artist in favorite_artists[:5]]  # Top 5 artists
        artist_placeholders = ', '.join([f"'{artist}'" for artist in artist_names])
        recommendation_criteria.append(f"s.artist IN ({artist_placeholders})")
    
    # Criteria 3: Duration preference (if available)
    if duration_stats and duration_stats.get('avg_duration'):
        avg_dur = duration_stats['avg_duration']
        std_dur = duration_stats.get('std_duration', 30)  # Default std dev
        min_dur = max(0, avg_dur - std_dur)
        max_dur = avg_dur + std_dur
        recommendation_criteria.append(f"s.duration BETWEEN {min_dur} AND {max_dur}")
    
    print('recommendation_criteria', recommendation_criteria)
    # Build the main recommendation query
    if recommendation_criteria:
        criteria_sql = " OR ".join(recommendation_criteria)
        
        # Exclude played songs
        exclude_clause = ""
        if played_song_ids:
            exclude_list = ', '.join([f"'{sid}'" for sid in played_song_ids])
            exclude_clause = f"AND s.sid NOT IN ({exclude_list})"
        
        recommendation_sql = f"""
            SELECT DISTINCT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre,
                   CASE 
                       WHEN MAX(g.genre_name) IN ({', '.join([f"'{g['genre_name']}'" for g in top_genres]) if top_genres else "''"}) THEN 3
                       WHEN s.artist IN ({', '.join([f"'{a['artist']}'" for a in favorite_artists[:5]]) if favorite_artists else "''"}) THEN 2
                       ELSE 1
                   END as recommendation_score
            FROM songs s
            LEFT JOIN song_genres sg ON s.sid = sg.sid
            LEFT JOIN genres g ON sg.gid = g.gid
            WHERE ({criteria_sql}) {exclude_clause}
            GROUP BY s.sid
            ORDER BY recommendation_score DESC, RAND()
            LIMIT {limit * 3}
        """
    else:
        # Fallback: Get random popular songs if no user data available
        exclude_clause = ""
        if played_song_ids:
            exclude_list = ', '.join([f"'{sid}'" for sid in played_song_ids])
            exclude_clause = f"WHERE s.sid NOT IN ({exclude_list})"
        
        recommendation_sql = f"""
            SELECT DISTINCT s.*, GROUP_CONCAT(g.genre_name SEPARATOR '; ') as genre
            FROM songs s
            LEFT JOIN song_genres sg ON s.sid = sg.sid
            LEFT JOIN genres g ON sg.gid = g.gid
            {exclude_clause}
            GROUP BY s.sid
            ORDER BY RAND()
            LIMIT {limit * 2}
        """
    print('recommendation_sql', recommendation_sql)
    # Execute recommendation query
    recommendations = run(recommendation_sql, fetch=True)
    print('recommendations', recommendations)
    # Step 7: Apply additional filtering and scoring
    if recommendations:
        # Score and rank recommendations
        scored_recommendations = []
        
        for song in recommendations:
            score = 0
            
            # Genre matching score
            if top_genres and song.get('genre'):
                song_genres = [g.strip() for g in song['genre'].split(';')]
                top_genre_names = [g['genre_name'] for g in top_genres]
                genre_matches = len(set(song_genres) & set(top_genre_names))
                score += genre_matches * 3
            
            # Artist matching score
            if favorite_artists:
                artist_names = [a['artist'] for a in favorite_artists]
                if song['artist'] in artist_names:
                    score += 2
            
            # Duration preference score
            if duration_stats and duration_stats.get('avg_duration'):
                avg_dur = duration_stats['avg_duration']
                duration_diff = abs(song['duration'] - avg_dur)
                if duration_diff < 30:  # Within 30 seconds
                    score += 1
            
            scored_recommendations.append((song, score))
        
        # Sort by score and randomize within score groups
        scored_recommendations.sort(key=lambda x: x[1], reverse=True)
        
        # Select final recommendations
        final_recommendations = []
        for song, score in scored_recommendations[:limit]:
            final_recommendations.append(song)
        
        return final_recommendations
    
    return []