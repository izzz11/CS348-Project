import pandas as pd
import sys
import os
from sqlalchemy import create_engine, text
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../")))

from database.db_config import DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME

# Create SQLAlchemy engine
DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

def populate_songs_if_empty():
    with engine.begin() as conn:
        # Check if songs table has any records
        result = conn.execute(text("SELECT COUNT(*) FROM songs"))
        count = result.scalar()

        if count == 0:
            print("🟡 Songs table is empty. Inserting data...")
            df = pd.read_csv("jamendo_data/jamendo_tracks.csv")
            df = df[["id", "name", "genres", "artist_name", "duration", "shareurl"]]
            df.columns = ["sid", "name", "genre", "artist", "duration", "other_info"]
            df["year"] = 0
            df["language"] = "unknown"

            insert_sql = """
                INSERT INTO songs (sid, name, genre, artist, year, language, duration, other_info)
                VALUES (:sid, :name, :genre, :artist, :year, :language, :duration, :other_info)
            """

            for _, row in df.iterrows():
                conn.execute(text(insert_sql), {
                    "sid": str(row["sid"]),
                    "name": row["name"],
                    "genre": row["genre"],
                    "artist": row["artist"],
                    "year": 0,
                    "language": "unknown",
                    "duration": float(row["duration"]),
                    "other_info": row["other_info"]
                })

            print("✅ Songs table populated.")
        else:
            print("✅ Songs table already has data.")