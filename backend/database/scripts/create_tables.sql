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

CREATE TABLE IF NOT EXISTS genres (
    gid INT AUTO_INCREMENT PRIMARY KEY,
    genre_name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS songs (
    sid VARCHAR(255) PRIMARY KEY,
    name VARCHAR(100),
    artist VARCHAR(100),
    duration FLOAT,
    audio_path VARCHAR(1024),
    audio_download_path VARCHAR(1024)
);

CREATE TABLE IF NOT EXISTS song_genres (
    sid VARCHAR(255),
    gid INT,
    PRIMARY KEY (sid, gid),
    FOREIGN KEY (sid) REFERENCES songs(sid),
    FOREIGN KEY (gid) REFERENCES genres(gid)
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
    is_favourite BOOLEAN DEFAULT FALSE,
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

-- User matching system
CREATE TABLE IF NOT EXISTS user_matches (
    user1_id VARCHAR(36),
    user2_id VARCHAR(36),
    similarity_score FLOAT DEFAULT 0.0,
    matched BOOLEAN DEFAULT FALSE,
    liked_by_user1 BOOLEAN DEFAULT FALSE,
    liked_by_user2 BOOLEAN DEFAULT FALSE,
    matched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(uid),
    FOREIGN KEY (user2_id) REFERENCES users(uid)
);





