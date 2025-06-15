# db.py
from sqlalchemy import create_engine
from pathlib import Path
from sqlalchemy import text

SQLALCHEMY_DATABASE_URL = "sqlite:///./app.db"
DB_PATH = Path(__file__).resolve().parent.parent / "app.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "scripts/create_tables.sql"


engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # allows the connection to be shared across threads
)


def run(sql: str, params: dict = None, fetch: bool = False):
    with engine.begin() as conn:
        result = conn.execute(text(sql), params or {})
        if fetch:
            rows = result.fetchall()
            result.close()
            return rows
        else:
            result.close()



def run_script(file_path: str):
    """
    Execute a full SQL script (e.g. schema.sql).
    """
    with open(file_path, "r") as f:
        sql = f.read()
    with engine.begin() as conn:
        for statement in sql.split(";"):
            if statement.strip():
                conn.execute(text(statement.strip()))

# Dependency for getting DB session in endpoints
def get_db_conn():
    with engine.connect() as conn:
        yield conn  # Connection is automatically closed after request

# Run the schema script to create tables if they don't exist
run_script(SCHEMA_PATH)



