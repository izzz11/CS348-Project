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

            # Create a mapping of genre names to IDs
            genre_map = {}
            
            # Insert songs without genre information
            insert_song_sql = """
                INSERT INTO songs (sid, name, artist, duration, audio_path, audio_download_path)
                VALUES (:sid, :name, :artist, :duration, :audio_path, :audio_download_path)
            """

            # Process each row
            for _, row in df.iterrows():
                # Insert song
                conn.execute(text(insert_song_sql), {
                    "sid": str(row["id"]),
                    "name": row["name"],
                    "artist": row["artist_name"],
                    "duration": float(row["duration"]),
                    "audio_path": row["audio"],
                    "audio_download_path": row["audiodownload"]
                })
                
                # Process genres for this song
                if pd.notna(row["genres"]):
                    genres = row["genres"].split(";")
                    for genre_name in genres:
                        genre_name = genre_name.strip()
                        if not genre_name:
                            continue
                            
                        # Check if genre exists in our map
                        if genre_name not in genre_map:
                            # Check if genre exists in database
                            result = conn.execute(
                                text("SELECT gid FROM genres WHERE genre_name = :genre_name"),
                                {"genre_name": genre_name}
                            )
                            genre_id = result.scalar()
                            
                            # If genre doesn't exist, insert it
                            if not genre_id:
                                result = conn.execute(
                                    text("INSERT INTO genres (genre_name) VALUES (:genre_name)"),
                                    {"genre_name": genre_name}
                                )
                                # Get the ID of the newly inserted genre
                                result = conn.execute(
                                    text("SELECT gid FROM genres WHERE genre_name = :genre_name"),
                                    {"genre_name": genre_name}
                                )
                                genre_id = result.scalar()
                            
                            genre_map[genre_name] = genre_id
                        
                        # Insert into song_genres junction table
                        conn.execute(
                            text("INSERT INTO song_genres (sid, gid) VALUES (:sid, :gid)"),
                            {"sid": str(row["id"]), "gid": genre_map[genre_name]}
                        )

            print("✅ Songs table populated.")
            print("✅ Genres table populated.")
            print("✅ Song-Genre relationships established.")
        else:
            print("✅ Songs table already has data.")