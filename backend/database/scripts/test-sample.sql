-- ─────────────────────────────────────────────
-- 1) INSERT USERS
INSERT INTO users (uid, username, name, age, password, email, country) VALUES
  ('u1', 'eloise',   'Eloise Li', 25, 'pass123', 'eloise@example.com', 'Canada'),
  ('u2', 'amy',      'Amy Wang',  30, 'amyPW',   'amy@example.com',    'USA'),
  ('u3', 'chris',    'Chris Yu',  28, 'chrisPW', 'chris@example.com',  'China');

-- ─────────────────────────────────────────────
-- 2) INSERT SONGS & GENRES
INSERT INTO songs (sid, name, artist, duration, audio_path, audio_download_path) VALUES
  ('sA', 'Ocean Breeze',  'DJ Wave',      120.0, '/audio/ocean.mp3',  '/download/ocean.mp3'),
  ('sB', 'Sunset Glow',    'DJ Wave',      180.0, '/audio/sunset.mp3', '/download/sunset.mp3'),
  ('sC', 'Night Sky',      'Star Gazer',   240.0, '/audio/night.mp3',  '/download/night.mp3');

INSERT INTO genres (genre_name) VALUES
  ('Ambient'),
  ('Electronic'),
  ('Chill');

-- Link songs to genres
-- Assume AUTO_INCREMENT gave gid=1 Ambient, gid=2 Electronic, gid=3 Chill
INSERT INTO song_genres (sid, gid) VALUES
  ('sA', 1),  -- Ocean Breeze → Ambient
  ('sA', 3),  -- Ocean Breeze → Chill
  ('sB', 2),  -- Sunset Glow  → Electronic
  ('sC', 1),  -- Night Sky     → Ambient
  ('sC', 2),  -- Night Sky     → Electronic
  ('sC', 3);  -- Night Sky     → Chill

-- ─────────────────────────────────────────────
-- 3) INSERT PLAYLISTS & USER_PLAYLISTS
INSERT INTO playlists (pid, name, description, private) VALUES
  ('p1', 'My Favourites', 'All-time favs', FALSE),
  ('p2', 'Chill Vibes',   'Relaxing tunes', TRUE);

-- Each user has membership/preferences in playlists
INSERT INTO user_playlists (uid, pid, is_favourite, shared_at) VALUES
  ('u1', 'p1', TRUE,  '2025-07-20 10:00:00'),
  ('u2', 'p1', FALSE, '2025-07-20 11:00:00'),
  ('u1', 'p2', FALSE, '2025-07-19 18:30:00');

-- Add songs into playlists
INSERT INTO playlist_songs (pid, sid, added_at) VALUES
  ('p1', 'sA', '2025-07-20 10:05:00'),
  ('p1', 'sB', '2025-07-20 10:06:00'),
  ('p2', 'sC', '2025-07-19 18:35:00');

-- ─────────────────────────────────────────────
-- 4) INSERT USER TRACK ACTIONS
-- New schema: primary key (uid, sid), includes rating
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating) VALUES
  ('u1', 'sA', '2025-07-20 12:00:00', 2, TRUE,  5),
  ('u1', 'sB', '2025-07-19 18:30:00', 3, FALSE, 4),
  ('u2', 'sA', '2025-07-20 13:00:00', 1, FALSE, 3);

-- ─────────────────────────────────────────────
-- 5) INSERT USER MATCHES
INSERT INTO user_matches (user1_id, user2_id, similarity_score, matched, liked_by_user1, liked_by_user2, matched_at) VALUES
  ('u1', 'u2', 0.75, TRUE,  TRUE,  TRUE,  '2025-07-20 14:00:00'),
  ('u1', 'u3', 0.40, FALSE, TRUE,  FALSE, '2025-07-19 09:00:00');

-- ─────────────────────────────────────────────
-- 6) INSERT RECOMMENDATIONS
INSERT INTO user_recommendations (uid, recommended_uid, recommendation_type, confidence_score) VALUES
  ('u1', 'u3', 'genre_based',    0.65),
  ('u2', 'u1', 'playlist_based', 0.80);

INSERT INTO playlist_recommendations (uid, pid, recommendation_reason, confidence_score) VALUES
  ('u1', 'p2', 'Matches your chill taste', 0.70),
  ('u3', 'p1', 'Popular among peers',    0.55);

-- ─────────────────────────────────────────────
-- 7) SANITY CHECKS

-- a) Fetch all users
SELECT uid, username, name, age, email, country
FROM users;

-- b) Fetch user total listen duration for u1
--    Expected: 2*120 + 3*180 = 240 + 540 = 780 seconds
SELECT
  SUM(s.duration * uta.total_plays) AS total_duration_seconds
FROM user_track_actions uta
JOIN songs s ON uta.sid = s.sid
WHERE uta.uid = 'u1';

-- c) Fetch user favourites for u1
SELECT uid, sid, favourite, rating
FROM user_track_actions
WHERE uid = 'u1' AND favourite = TRUE;

-- d) Fetch recent plays for u1 (limit 2)
SELECT uid, sid, last_listened
FROM user_track_actions
WHERE uid = 'u1'
ORDER BY last_listened DESC
LIMIT 2;

-- e) Fetch match candidates for u1 (exclude existing matches)
SELECT u.uid, u.username
FROM users u
WHERE u.uid != 'u1'
  AND u.uid NOT IN (
    SELECT user2_id FROM user_matches WHERE user1_id = 'u1'
    UNION
    SELECT user1_id FROM user_matches WHERE user2_id = 'u1'
  );

-- f) Fetch user recommendations for u1
SELECT recommended_uid, recommendation_type, confidence_score
FROM user_recommendations
WHERE uid = 'u1';

-- g) Fetch playlist recommendations for u1
SELECT pid, recommendation_reason, confidence_score
FROM playlist_recommendations
WHERE uid = 'u1';

-- ─────────────────────────────────────────────
-- TEST: Paginated & Filtered Songs (no search)
-- Function: get_song_paginated_filtered(page, page_size, search=None)
-- Example: page=1, page_size=2, no filtering
SELECT s.*,
       GROUP_CONCAT(g.genre_name SEPARATOR '; ') AS genre
FROM songs AS s
LEFT JOIN song_genres AS sg ON s.sid = sg.sid
LEFT JOIN genres      AS g  ON sg.gid = g.gid
GROUP BY s.sid
LIMIT 2
OFFSET 0;

-- Example: page=2, page_size=2, no filtering
SELECT s.*,
       GROUP_CONCAT(g.genre_name SEPARATOR '; ') AS genre
FROM songs AS s
LEFT JOIN song_genres AS sg ON s.sid = sg.sid
LEFT JOIN genres      AS g  ON sg.gid = g.gid
GROUP BY s.sid
LIMIT 2
OFFSET 2;

-- ─────────────────────────────────────────────
-- TEST: Paginated & Filtered Songs (with search)
-- Function: get_song_paginated_filtered(page, page_size, search)
-- Example: page=1, page_size=5, search by name containing 'Ocean'
SELECT s.*,
       GROUP_CONCAT(g.genre_name SEPARATOR '; ') AS genre
FROM songs AS s
LEFT JOIN song_genres AS sg ON s.sid = sg.sid
LEFT JOIN genres      AS g  ON sg.gid = g.gid
WHERE s.name    LIKE '%Ocean%'
   OR s.artist  LIKE '%Ocean%'
   OR g.genre_name LIKE '%Ocean%'
GROUP BY s.sid
LIMIT 5
OFFSET 0;

-- Example: page=1, page_size=5, search by artist containing 'Wave'
SELECT s.*,
       GROUP_CONCAT(g.genre_name SEPARATOR '; ') AS genre
FROM songs AS s
LEFT JOIN song_genres AS sg ON s.sid = sg.sid
LEFT JOIN genres      AS g  ON sg.gid = g.gid
WHERE s.name    LIKE '%Wave%'
   OR s.artist  LIKE '%Wave%'
   OR g.genre_name LIKE '%Wave%'
GROUP BY s.sid
LIMIT 5
OFFSET 0;

-- Example: page=1, page_size=5, search by genre containing 'Electronic'
SELECT s.*,
       GROUP_CONCAT(g.genre_name SEPARATOR '; ') AS genre
FROM songs AS s
LEFT JOIN song_genres AS sg ON s.sid = sg.sid
LEFT JOIN genres      AS g  ON sg.gid = g.gid
WHERE s.name    LIKE '%Electronic%'
   OR s.artist  LIKE '%Electronic%'
   OR g.genre_name LIKE '%Electronic%'
GROUP BY s.sid
LIMIT 5
OFFSET 0;
