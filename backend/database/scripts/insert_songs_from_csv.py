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
            df = df[["id", "name", "genres", "artist_name", "duration", "audio", "audiodownload"]]

            # Remove rows with NaN in 'audiodownload'
            df = df[df["audiodownload"].notna()]

            df.columns = ["sid", "name", "genre", "artist", "duration", "audio_path", "audio_download_path"]
            
            

            insert_sql = """
                INSERT INTO songs (sid, name, genre, artist, duration, audio_path, audio_download_path)
                VALUES (:sid, :name, :genre, :artist, :duration, :audio_path, :audio_download_path)
            """


            for _, row in df.iterrows():
                conn.execute(text(insert_sql), {
                    "sid": str(row["sid"]),
                    "name": row["name"],
                    "genre": row["genre"],
                    "artist": row["artist"],
                    "duration": float(row["duration"]),
                    "audio_path": row["audio_path"],
                    "audio_download_path": row["audio_download_path"]
                })

            print("✅ Songs table populated.")
        else:
            print("✅ Songs table already has data.")