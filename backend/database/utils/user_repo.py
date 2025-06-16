from database.db import run

def get_all_users():
    sql = """
    SELECT uid, username, password
    FROM users
    """
    result = run(sql, fetch=True)
    print("result", result)
    return result


def get_by_username(username: str):
    sql = """
    SELECT uid, username, password
    FROM users
    WHERE username = :username
    """
    result = run(sql, {"username": username}, fetchone=True)
    return result


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
    print("rowwww ", row)
    return row
