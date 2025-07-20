-- ─────────────────────────────────────────────
-- USERS
-- Register a user
INSERT INTO users (uid, username, password, email)
VALUES ('u1', 'eloise', 'password', 'eloise@example.com');

INSERT INTO users (uid, username, password, email)
VALUES ('u2', 'Amy', 'AmysPassword', 'amy@example.com');


-- Fetch all users
SELECT * FROM users;

-- ─────────────────────────────────────────────
-- SONGS
-- Add a sample song
INSERT INTO songs (sid, name, genre, artist, duration, audio_path, audio_download_path)
VALUES ('s1', 'Calm Waves', 'Ambient', 'DJ Ocean', 180.5, '/audio/calm.mp3', '/download/calm.mp3');

-- Fetch all songs
SELECT * FROM songs;

-- Fetch by genre
SELECT * FROM songs WHERE genre = 'Ambient';

-- Fetch by artist
SELECT * FROM songs WHERE artist = 'DJ Ocean';

-- Fetch by name
SELECT * FROM songs WHERE name LIKE '%Calm%';

-- Fetch by duration
SELECT * FROM songs WHERE duration <= 200;

-- ─────────────────────────────────────────────
-- PLAYLISTS
-- Create a playlist
INSERT INTO playlists (pid, uid, name, description)
VALUES ('p1', 'u1', 'My Chill Playlist', 'Relax and study');

-- Get playlists for user
SELECT * FROM playlists WHERE uid = 'u1';

-- Get playlist by pid
SELECT * FROM playlists WHERE pid = 'p1';

-- Update playlist name
UPDATE playlists SET name = 'Updated Chill Playlist' WHERE pid = 'p1';

-- ─────────────────────────────────────────────
-- Add songs to playlist
INSERT INTO playlist_songs (pid, sid)
VALUES ('p1', 's1');

-- Get songs in playlist
SELECT s.* FROM songs s
JOIN playlist_songs ps ON s.sid = ps.sid
WHERE ps.pid = 'p1';

-- Remove song from playlist
DELETE FROM playlist_songs WHERE pid = 'p1' AND sid = 's1';


-- Delete playlist
DELETE FROM playlists WHERE pid = 'p1';


-- Get 10 most recent plays for user u1
-- Add user track actions for testing recent plays
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
VALUES ('u1', 's1', '2024-05-01 10:00:00', 5, TRUE, 4);

-- Add more plays for variety
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
VALUES ('u1', 's1', '2024-05-02 12:00:00', 6, FALSE, 3);


SELECT s.* FROM songs s
JOIN track_actions t ON s.sid = t.sid
WHERE t.uid = 'u1' AND t.last_listened IS NOT NULL
ORDER BY t.last_listened DESC
LIMIT 10;

