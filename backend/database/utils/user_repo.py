# database/user_repo.py
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
    result = run(sql, {"username": username}, fetch=True)
    return result 

def create_user(username: str, password: str):
    import uuid

    uid = str(uuid.uuid4())  # Generate a unique user ID
    print(uid)
    sql = """
    INSERT INTO users (uid, username, password)
    VALUES (:uid, :username, :password)
    RETURNING uid, username, password
    """

    params = {
        "uid": uid,  # Python variable `uid` passed safely
        "username": username,
        "password": password
    }

    result = run(sql, params, fetch=True)
    return result

