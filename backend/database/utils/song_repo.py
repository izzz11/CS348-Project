
from database.db import run

def get_all_songs():
    sql = "SELECT * FROM songs"
    return run(sql, fetch=True)

def search_by_genre(genre_substr: str):
    sql = """
        SELECT * FROM songs
        WHERE genre LIKE :genre
    """
    return run(sql, {"genre": f"%{genre_substr}%"}, fetch=True)

def search_by_artist(artist_name: str):
    sql = """
        SELECT * FROM songs
        WHERE artist LIKE :artist
    """
    return run(sql, {"artist": f"%{artist_name}%"}, fetch=True)

def search_by_name(keyword: str):
    sql = """
        SELECT * FROM songs
        WHERE name LIKE :keyword
    """
    return run(sql, {"keyword": f"%{keyword}%"}, fetch=True)

def search_by_duration(min_sec: float = 0, max_sec: float = 1000):
    sql = """
        SELECT * FROM songs
        WHERE duration BETWEEN :min_sec AND :max_sec
    """
    return run(sql, {"min_sec": min_sec, "max_sec": max_sec}, fetch=True)