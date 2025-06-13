# database/user_repo.py
from database.utils import run

def get_by_username(username: str):
    sql = """
    SELECT id, uid, username, password
      FROM users
     WHERE username = :username
    """
    result = run(sql, {"username": username})
    return result.fetchone()   # or None
