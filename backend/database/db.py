from sqlalchemy import create_engine, text
from pathlib import Path
from database import db_config
from sqlalchemy.orm import sessionmaker

# Build DB URL
SQLALCHEMY_DATABASE_URL = (
    f"mysql+mysqlconnector://{db_config.DB_USER}:{db_config.DB_PASSWORD}"
    f"@{db_config.DB_HOST}:{db_config.DB_PORT}/{db_config.DB_NAME}"
)

SCHEMA_PATH = Path(__file__).resolve().parent / "scripts/create_tables.sql"
DUMMY_DATA_PATH = Path(__file__).resolve().parent / "scripts/insert-dummy-data.sql"

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


def run_transaction(operations: list) -> bool:
    """
    Execute multiple SQL operations in a single transaction.
    
    Args:
        operations: List of tuples (sql, params, fetch, fetchone)
                   where sql is the SQL string, params is the parameters dict,
                   fetch and fetchone are boolean flags for result handling
    
    Returns:
        bool: True if all operations succeed, False if any fail (transaction rolled back)
    """
    try:
        with engine.begin() as conn:
            results = []
            for sql, params, fetch, fetchone in operations:
                result = conn.execute(text(sql), params or {})
                
                if fetchone:
                    row = result.fetchone()
                    if row is None:
                        results.append(None)
                    else:
                        results.append(dict(zip(result.keys(), row)))
                elif fetch:
                    rows = result.fetchall()
                    results.append([dict(zip(result.keys(), r)) for r in rows])
                else:
                    results.append(None)
            
            return True
    except Exception as e:
        print(f"Transaction error: {e}")
        return False


def run_script(file_path: str):
    with open(file_path, "r") as f:
        sql = f.read()
    with engine.begin() as conn:
        for statement in sql.split(";"):
            if statement.strip():
                conn.execute(text(statement.strip()))
    
    print("📄 Script ran: ", file_path)

def create_views_and_indexes():
    ddl = """
    CREATE OR REPLACE VIEW song_play_counts AS
    SELECT
    uta.sid,
    s.name       AS song_name,
    s.artist     AS artist,
    COALESCE(SUM(uta.total_plays), 0) AS total_plays
    FROM user_track_actions AS uta
    JOIN songs AS s ON s.sid = uta.sid
    GROUP BY uta.sid, s.name, s.artist;
    """
    # use begin() guarantee auto-submission
    with engine.begin() as conn:
        conn.execute(text(ddl))

# Run schema on startup
run_script(SCHEMA_PATH)
run_script(DUMMY_DATA_PATH)
create_views_and_indexes()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Dependency to get ORM session for FastAPI endpoints.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_conn():
    with engine.connect() as conn:
        yield conn

