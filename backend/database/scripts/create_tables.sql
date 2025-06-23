-- CREATE TABLES IF THEY DO NOT EXIST
-- Target: MySQL database for a music streaming application

CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(36) PRIMARY KEY,
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
    duration FLOAT,
    audio_path VARCHAR(1024),
    audio_download_path VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS playlists (
    pid VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100),
    description TEXT,
    private BOOLEAN DEFAULT FALSE
);

-- Might need a better name
CREATE TABLE IF NOT EXISTS user_playlists (
    uid VARCHAR(36),
    pid VARCHAR(36),
    shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (uid, pid),
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (pid) REFERENCES playlists(pid)
);

CREATE TABLE IF NOT EXISTS user_track_actions (
    uid VARCHAR(36),
    sid VARCHAR(255),
    last_listened TIMESTAMP,
    total_plays INT,
    favourite BOOLEAN,
    rating INT,
    PRIMARY KEY (uid, sid),
    FOREIGN KEY (uid) REFERENCES users(uid),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);

CREATE TABLE IF NOT EXISTS playlist_songs (
    pid VARCHAR(36),
    sid VARCHAR(36),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pid, sid),
    FOREIGN KEY (pid) REFERENCES playlists(pid),
    FOREIGN KEY (sid) REFERENCES songs(sid)
);



