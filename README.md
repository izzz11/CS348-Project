# CS 348 Project - 🎵 **TuneMatch: A Music-Based Matching App (WIP)**

We’re building **TuneMatch**, a simple app that connects people based on their music taste.

### 🧰 Tech Stack (planned):

* **MySQL** for the database
* **Fast API** for the backend
* **Next.js** for the frontend

---

## Milestone 1: Project Proposal

### 🔧 Database Setup and Data Loading

The system supports three core tables: `Songs`, `Users`, and `Playlists`.

#### 1. **Songs Table**
- **Source**: Songs are fetched online via the Spotify API or scraped datasets.
- **Stored Fields**:
  - `id`, `name`, `artist_name`, `duration`, `file_path` (path to audio URL `.mp3`)
- **Sample Data**: Initially, we preload **100 songs** as a test dataset in **Milestone 1**.
- **Loading Mechanism**:
  - Executing `main.py` will:
    - Check for the existence of the `songs` table.
    - If it does not exist, it automatically calls the function from `insert_songs_from_csv.py` to load the sample songs from a CSV file.
  - This ensures **idempotent setup**—running it multiple times won’t duplicate data.

#### 2. **Users Table**
- **Created dynamically** when a user **registers** or **logs in** via the frontend.
- **Stored Fields**:
  - `uid`, `username`, `password` (hashed)
- The `users` table is continuously updated as new users join or update credentials.

#### 3. **Playlists Table**
- **Created by users** via the interface when they decide to build custom playlists.
- **Stored Fields**:
  - `uid`, `pid`, `name`, `description`, `private`
  - A junction table handles the association between playlists and songs.
- Users select from the current pool of 100 songs to populate their playlists.

---

### ▶️ How to Run Your Working Database-Driven Application

To launch the full-stack TuneMatch app locally, follow these steps:

---

#### 🖥 Backend Setup (FastAPI + MySQL)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. (Optional but recommended) Create a Python virtual environment:
   ```bash
   python3 -m venv env
   source venv/bin/activate    # On Windows: .\env\Scripts\activate
   ```

3. Install all required Python dependencies:
   ```bash
   pip install -r requirement.txt
   ```
4. Set Up Database:
   ```
   docker-compose up -d
   ```
   to set up mysql local db.

   > Make sure to delete app.db if you want a fresh database

5. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

   > ⚠️ If you encounter dependency issues, ensure your virtual environment is activated and Python version is compatible.

---

#### 🌐 Frontend Setup (React)

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install all required Node.js packages:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:3000
   ```

   > You should now see the TuneMatch interface and can interact with the app.

---

### ✅ Current Features Supported (Backend, part of Frontend)

- 🔐 **User Registration/Login**: Secure account creation and access.
- 🎶 **Load and View Songs**: Browse preloaded song list with metadata.
- 💾 **Create/Delete Playlists**: Personalized playlists with custom names and privacy.
- ➕ **Add/Remove Songs from Playlist**
- ⭐ **Favourite Songs**
- 🔊 **Fetch and Play MP3 files** via stored file paths

---

### 📂 SQL Setup

All SQL files for setting up the database are located in:

`backend/database/scripts/`  
- `create_tables.sql`: defines the schema and creates all necessary tables  
- `constraints.sql`: includes foreign key and other constraints  
- `triggers.sql`: contains trigger definitions (if any)


### 📄 Query Logic

Most SQL query logic (such as select statements) is implemented in Python files located in:

`backend/database/utils/`  
- Files ending with `_repo.py` handle operations for playlists, songs, and users.

---

### Test Files for Task 5

The required files for **Task 5** — `test-sample.sql` (containing SQL statements) and `test-sample.out` (showing execution results on the sample database) — are located in:

```bash
backend/database/schema/scripts/test-sample.sql
backend/database/schema/scripts/test-sample.out
```
These files operate on the **sample database**, not the full dataset.

---
### Database Testing Note

If you need to test the database, you can run the following command in your terminal to access MySQL inside the Docker container:

```bash
docker exec -it musicdb mysql -u musicuser -pmusicpass musicdb
```

This command will open a MySQL prompt connected to the `musicdb` database, allowing you to run queries directly for testing.
