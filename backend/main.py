# main.py
from fastapi import FastAPI
from api import users, playlists


app = FastAPI()
app.include_router(users.router)
app.include_router(playlists.router)

@app.get("/test")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
