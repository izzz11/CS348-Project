-- CREATE TABLES IF THEY DO NOT EXIST
-- Target: SQLite database for a music streaming application

CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(255) PRIMARY KEY,
    username VARCHAR(50),
    name VARCHAR(100) NULL,
    age INT NULL,
    password VARCHAR(100),
    email VARCHAR(100) NULL,
    country VARCHAR(50) NULL
);

CREATE TABLE IF NOT EXISTS songs (
    sid VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100),
    genre VARCHAR(50),
    artist VARCHAR(100),
    year INT,
    language VARCHAR(50),
    duration FLOAT,
    other_info TEXT
);

CREATE TABLE IF NOT EXISTS filepaths (
    id VARCHAR(255) PRIMARY KEY,
    sid VARCHAR(20),
    filepath VARCHAR(255),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);

CREATE TABLE IF NOT EXISTS playlists (
    pid VARCHAR(255) PRIMARY KEY,
    uid VARCHAR(20),
    name VARCHAR(100),
    description TEXT,
    private BOOLEAN DEFAULT FALSE,
    shared_with VARCHAR(100),
    FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE IF NOT EXISTS listened (
    id VARCHAR(255) PRIMARY KEY,
    last_listened TIMESTAMP,
    uid VARCHAR(20),
    total_plays INT,
    favourite BOOLEAN,
    rating INT,
    pid VARCHAR(20),
    sid VARCHAR(20),
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (pid) REFERENCES playlists(pid),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    id VARCHAR(255) PRIMARY KEY,
    pid VARCHAR(20),
    sid VARCHAR(20),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pid) REFERENCES playlists(pid),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);
