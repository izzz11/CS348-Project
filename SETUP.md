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
pip install -r requirements.txt
uvicorn main:app --reload
```


**database ()**
Make sure to delete app.db if you want a fresh database
