-- WRITE MORE SCRIPTS FOR QUERY & INSERT & OTHER OPERATIONS
-- This script creates the necessary tables for the music streaming application, should be inserted into the ".db"  file
-- TODO: we will be using SQLite

CREATE TABLE users (
    uid VARCHAR(20) PRIMARY KEY,
    username VARCHAR(50),
    name VARCHAR(100),
    age INT,
    password VARCHAR(100),
    email VARCHAR(100),
    country VARCHAR(50)
);

CREATE TABLE songs (
    sid VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100),
    genre VARCHAR(50),
    artist VARCHAR(100),
    year INT,
    language VARCHAR(50),
    duration FLOAT,
    other_info TEXT
);

CREATE TABLE filepaths (
    id VARCHAR(20) PRIMARY KEY,
    sid VARCHAR(20),
    filepath VARCHAR(255),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);

CREATE TABLE listened (
    id VARCHAR(20) PRIMARY KEY,
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

CREATE TABLE playlists (
    pid VARCHAR(20) PRIMARY KEY,
    uid VARCHAR(20),
    name VARCHAR(100),
    description TEXT,
    private BOOLEAN DEFAULT FALSE,
    shared_with VARCHAR(100),
    FOREIGN KEY (uid) REFERENCES users(uid)
);

CREATE TABLE playlist_songs (
    id VARCHAR(20) PRIMARY KEY,
    pid VARCHAR(20),
    sid VARCHAR(20),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pid) REFERENCES playlists(pid),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);
