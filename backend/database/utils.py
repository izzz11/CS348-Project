# database/utils.py
from sqlalchemy import text
from db import engine

def run(sql: str, params: dict = None):
    """
    Execute a raw SQL statement and return the first Result.
    """
    with engine.connect() as conn:
        result = conn.execute(text(sql), params or {})
        return result