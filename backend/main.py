# main.py
from fastapi import FastAPI
from api import users


app = FastAPI()
app.include_router(users.router)

@app.get("/test")
def read_root():
    return {"message": "Welcome to the FastAPI application!"}
