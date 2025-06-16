## How to Run Locally

Temporary for setting up local environment:

**frontend:**
Requirements: node, npm
```
cd frontend
npm i
npm run dev
```

**backend (FastAPI)**
Requirements: python, pip
```
cd backend
pip install -r requirement.txt
uvicorn main:app --reload
```


**database ()**
run '''docker-compose up -d''' to set up mysql local db
Make sure to delete app.db if you want a fresh database
