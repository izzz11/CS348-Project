# main.py
from fastapi import FastAPI
import models
from db import engine
from routers import users

# create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(users.router, prefix="/users", tags=["users"])
