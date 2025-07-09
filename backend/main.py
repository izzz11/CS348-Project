# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import users, playlists, songs, playlist_songs, user_actions, matching
from database.scripts.insert_songs_from_csv import populate_songs_if_empty

# Run DB seeding logic
populate_songs_if_empty()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Your frontend dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(playlists.router)
app.include_router(songs.router)
app.include_router(playlist_songs.router)
app.include_router(user_actions.router)
app.include_router(matching.router)

@app.get("/test")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
