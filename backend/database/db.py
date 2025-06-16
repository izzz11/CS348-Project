from sqlalchemy import create_engine, text
from pathlib import Path
from database import db_config

# Build DB URL
SQLALCHEMY_DATABASE_URL = (
    f"mysql+mysqlconnector://{db_config.DB_USER}:{db_config.DB_PASSWORD}"
    f"@{db_config.DB_HOST}:{db_config.DB_PORT}/{db_config.DB_NAME}"
)

SCHEMA_PATH = Path(__file__).resolve().parent / "scripts/create_tables.sql"

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False)


from sqlalchemy import text
from database.db import engine  # 假设你是从这里导入的

def run(sql: str, params: dict = None, fetch=False, fetchone=False):
    with engine.begin() as conn:
        result = conn.execute(text(sql), params or {})
        if fetchone:
            row = result.fetchone()
            if row is None:
                return None
            return dict(zip(result.keys(), row))  # ✅ Fix here
        elif fetch:
            rows = result.fetchall()
            return [dict(zip(result.keys(), r)) for r in rows]  # ✅ Fix here
        return None



def run_script(file_path: str):
    with open(file_path, "r") as f:
        sql = f.read()
    with engine.begin() as conn:
        for statement in sql.split(";"):
            if statement.strip():
                conn.execute(text(statement.strip()))


def get_db_conn():
    with engine.connect() as conn:
        yield conn


# Run schema on startup
run_script(SCHEMA_PATH)
