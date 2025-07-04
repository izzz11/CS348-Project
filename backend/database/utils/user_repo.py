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
