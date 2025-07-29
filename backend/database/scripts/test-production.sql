-- ─────────────────────────────────────────────
-- FEATURE: User Track Actions  
-- Using production song IDs for non-zero listening time
INSERT IGNORE INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating) VALUES  
  ('u1', '1009672', '2025-07-28 12:00:00', 5, TRUE, 5),  
  ('u1', '1012294', '2025-07-29 08:30:00', 2, FALSE, 3),  
  ('u2', '1009672', '2025-07-28 15:45:00', 3, TRUE, 4);

-- ─────────────────────────────────────────────
-- FEATURE: Songs  
-- Songs have been inserted into our database in advance.

-- ─────────────────────────────────────────────
-- FEATURE: Song Genres  
INSERT IGNORE INTO song_genres (sid, gid)  
  SELECT 's1', gid FROM genres WHERE genre_name = 'Pop'  
UNION ALL SELECT 's2', gid FROM genres WHERE genre_name = 'Rock'  
UNION ALL SELECT 's3', gid FROM genres WHERE genre_name = 'Jazz'  
UNION ALL SELECT 's4', gid FROM genres WHERE genre_name = 'Classical'  
UNION ALL SELECT 's5', gid FROM genres WHERE genre_name = 'Pop'  
UNION ALL SELECT 's6', gid FROM genres WHERE genre_name = 'Electronic';

-- ─────────────────────────────────────────────
-- FEATURE: Users  
INSERT IGNORE INTO users (uid, username, password, email, name, age, country) VALUES  
  ('u1', 'eloise', 'password1', 'eloise@example.com', 'Eloise Kim', 22, 'Canada'),  
  ('u2', 'amy', 'password2', 'amy@example.com', 'Amy Smith', 25, 'USA'),  
  ('u3', 'liam', 'password3', 'liam@example.com', 'Liam Chen', 28, 'UK');

-- ─────────────────────────────────────────────
-- FEATURE: Playlists  
INSERT IGNORE INTO playlists (pid, name, description, private) VALUES  
  ('p1', 'Chill Mix', 'Relaxing tunes', FALSE),  
  ('p2', 'Workout Mix', 'Pump up tracks', TRUE);

-- ─────────────────────────────────────────────
-- FEATURE: User Playlists  
INSERT IGNORE INTO user_playlists (uid, pid, is_favourite) VALUES  
  ('u1', 'p1', TRUE),  
  ('u2', 'p2', FALSE);

-- ─────────────────────────────────────────────
-- FEATURE: Playlist Songs  
INSERT IGNORE INTO playlist_songs (pid, sid) VALUES  
  ('p1', 's1'),  
  ('p1', 's3'),  
  ('p2', 's2');

-- ─────────────────────────────────────────────
-- FEATURE: User Track Actions  
INSERT IGNORE INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating) VALUES  
  ('u1', 's1', '2025-07-28 12:00:00', 5, TRUE, 5),  
  ('u1', 's3', '2025-07-29 08:30:00', 2, FALSE, 3),  
  ('u2', 's2', '2025-07-28 15:45:00', 3, TRUE, 4);

-- ─────────────────────────────────────────────
-- FEATURE: Matching System  
INSERT IGNORE INTO user_matches (user1_id, user2_id, similarity_score, matched, liked_by_user1, liked_by_user2) VALUES  
  ('u1', 'u2', 0.75, FALSE, TRUE, FALSE),  
  ('u2', 'u1', 0.75, FALSE, FALSE, TRUE);

-- Re-enable foreign key checks after data load
SET FOREIGN_KEY_CHECKS=1;

-- ─────────────────────────────────────────────
-- FEATURE: TEST QUERIES BASIC  
-- Fetch all users
SELECT * FROM users;  
-- Fetch all songs
SELECT * FROM songs;  
-- Fetch playlists for u1 (via user_playlists)
SELECT p.*
FROM playlists p
JOIN user_playlists up ON p.pid = up.pid
WHERE up.uid = 'u1';
-- Fetch songs in p1
SELECT s.*
FROM songs s
JOIN playlist_songs ps ON s.sid = ps.sid
WHERE ps.pid = 'p1';
-- Fetch favorites for u1
SELECT * FROM user_track_actions WHERE uid = 'u1' AND favourite = TRUE;
-- Fetch matches for u1
SELECT * FROM user_matches WHERE user1_id = 'u1';

-- ─────────────────────────────────────────────
-- ADVANCED FEATURE TESTS

-- 1. Recently Played Songs (History)
SELECT s.*
FROM songs s
JOIN user_track_actions t ON s.sid = t.sid
WHERE t.uid = 'u1' AND t.last_listened IS NOT NULL
ORDER BY t.last_listened DESC
LIMIT 5;

-- 2. Global Dashboard: Top Songs
SELECT s.sid, s.name, s.artist, SUM(t.total_plays) AS plays
FROM songs s
JOIN user_track_actions t ON s.sid = t.sid
GROUP BY s.sid, s.name, s.artist
ORDER BY plays DESC
LIMIT 3;

-- 3. User Analytics Dashboard: total listening time & favorites
-- Total listening seconds for u1
SELECT COALESCE(SUM(s.duration * t.total_plays), 0) AS total_listening_seconds
FROM user_track_actions t
JOIN songs s ON t.sid = s.sid
WHERE t.uid = 'u1';
-- Number of playlists for u1
SELECT COUNT(*) AS total_playlists
FROM user_playlists
WHERE uid = 'u1';
-- Number of favorite songs for u1
SELECT COUNT(*) AS favorite_songs
FROM user_track_actions
WHERE uid = 'u1' AND favourite = TRUE;
-- Top 3 favorite genres for u1
SELECT g.genre_name, COUNT(*) AS cnt
FROM user_track_actions t
JOIN song_genres sg ON t.sid = sg.sid
JOIN genres g ON sg.gid = g.gid
WHERE t.uid = 'u1' AND t.favourite = TRUE
GROUP BY g.genre_name
ORDER BY cnt DESC
LIMIT 3;

-- 4. Active Playlist Listeners Test (inline aggregate)
SELECT ps.pid, u.username, SUM(t.total_plays) AS total_listens
FROM playlist_songs ps
JOIN user_track_actions t ON ps.sid = t.sid
JOIN users u ON t.uid = u.uid
GROUP BY ps.pid, u.username;

-- 5. Transactional "Favourite a Song"
START TRANSACTION;
UPDATE user_track_actions
SET favourite = TRUE
WHERE uid = 'u1' AND sid = 's2';
INSERT IGNORE INTO playlist_songs (pid, sid)
VALUES ('p1', 's2');
COMMIT;
-- Verify
SELECT * FROM user_track_actions WHERE uid='u1' AND sid='s2';
SELECT * FROM playlist_songs WHERE pid='p1' AND sid='s2';

-- 6. Paginated Song Retrieval
SELECT s.sid, s.name, GROUP_CONCAT(g.genre_name SEPARATOR '; ') AS genres
FROM songs s
LEFT JOIN song_genres sg ON s.sid = sg.sid
LEFT JOIN genres g ON sg.gid = g.gid
GROUP BY s.sid
ORDER BY s.sid
LIMIT 2 OFFSET 1;

-- 7. Match Users by Taste
SELECT um.user2_id AS candidate_uid, u.username, um.similarity_score
FROM user_matches um
JOIN users u ON um.user2_id = u.uid
WHERE um.user1_id = 'u1' AND um.matched = FALSE;

-- END OF TEST-SAMPLE.SQL
