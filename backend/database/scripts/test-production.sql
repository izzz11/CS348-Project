USE musicdb;
-- We first insert some test data into the database so that we can test the functionality of the production database of songs.
-- ─────────────────────────────────────────────
-- USERS
INSERT IGNORE INTO users (uid, username, password, email, name, age, country) VALUES
('u1', 'eloise', 'password1', 'eloise@example.com', 'Eloise Kim', 22, 'Canada'),
('u2', 'amy', 'password2', 'amy@example.com', 'Amy Smith', 25, 'USA'),
('u3', 'liam', 'password3', 'liam@example.com', 'Liam Chen', 28, 'UK'),
('u4', 'emma', 'password4', 'emma@example.com', 'Emma Zhao', 31, 'Australia'),
('u5', 'noah', 'password5', 'noah@example.com', 'Noah Patel', 27, 'India'),
('u6', 'olivia', 'password6', 'olivia@example.com', 'Olivia Singh', 24, 'Canada'),
('u7', 'ethan', 'password7', 'ethan@example.com', 'Ethan Garcia', 30, 'Mexico'),
('u8', 'ava', 'password8', 'ava@example.com', 'Ava Nguyen', 23, 'Vietnam'),
('u9', 'mason', 'password9', 'mason@example.com', 'Mason Dubois', 29, 'France'),
('u10', 'mia', 'password10', 'mia@example.com', 'Mia Müller', 26, 'Germany');

-- TEST USERS
SELECT * FROM users;

-- ─────────────────────────────────────────────
-- PLAYLISTS
INSERT IGNORE INTO playlists (pid, name, description, private) VALUES
('p1', 'Chill Mix', 'Relax and study vibes', FALSE),
('p2', 'Workout Boost', 'Pump-up jams', TRUE),
('p3', 'Morning Jazz', 'Coffee and jazz to start the day', FALSE),
('p4', 'Top EDM', 'Most streamed electronic hits', TRUE),
('p5', 'Focus Flow', 'For deep work sessions', FALSE),
('p6', 'Global Beats', 'Hits from around the world', FALSE);

-- TEST PLAYLISTS
SELECT * FROM playlists;

-- ─────────────────────────────────────────────
-- USER_PLAYLISTS
INSERT IGNORE INTO user_playlists (uid, pid, is_favourite) VALUES
('u1', 'p1', TRUE),
('u2', 'p2', FALSE),
('u3', 'p3', TRUE),
('u4', 'p4', FALSE),
('u5', 'p5', TRUE),
('u6', 'p6', FALSE);

-- TEST USER-PLAYLIST CONNECTIONS
SELECT u.username, p.name AS playlist, up.is_favourite
FROM user_playlists up
JOIN users u ON up.uid = u.uid
JOIN playlists p ON up.pid = p.pid;

-- ─────────────────────────────────────────────
-- PLAYLIST_SONGS
INSERT INTO playlist_songs (pid, sid)
SELECT 'p1', sid FROM (
    SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 0
) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM playlist_songs WHERE pid = 'p1' AND sid = sub.sid
);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p2', sid FROM (
    SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 3
) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM playlist_songs WHERE pid = 'p2' AND sid = sub.sid
);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p3', sid FROM (
    SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 6
) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM playlist_songs WHERE pid = 'p3' AND sid = sub.sid
);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p4', sid FROM (
    SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 9
) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM playlist_songs WHERE pid = 'p4' AND sid = sub.sid
);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p5', sid FROM (
    SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 12
) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM playlist_songs WHERE pid = 'p5' AND sid = sub.sid
);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p6', sid FROM (
    SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 15
) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM playlist_songs WHERE pid = 'p6' AND sid = sub.sid
);

-- TEST SONGS IN PLAYLISTS
SELECT p.name AS playlist, s.name AS song, s.artist
FROM playlist_songs ps
JOIN playlists p ON ps.pid = p.pid
JOIN songs s ON ps.sid = s.sid
ORDER BY ps.pid, ps.added_at;

-- ─────────────────────────────────────────────
-- USER TRACK ACTIONS
-- u1 track action
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u1', sid, NOW(), 12, TRUE, 5
FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 0) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM user_track_actions WHERE uid = 'u1' AND sid = sub.sid
);

-- u2
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u2', sid, NOW(), 6, FALSE, 4
FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 3) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM user_track_actions WHERE uid = 'u2' AND sid = sub.sid
);

-- u3
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u3', sid, NOW(), 8, TRUE, 5
FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 6) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM user_track_actions WHERE uid = 'u3' AND sid = sub.sid
);

-- u4
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u4', sid, NOW(), 3, FALSE, 3
FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 9) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM user_track_actions WHERE uid = 'u4' AND sid = sub.sid
);

-- u5
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u5', sid, NOW(), 14, TRUE, 4
FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 12) AS sub
WHERE NOT EXISTS (
    SELECT 1 FROM user_track_actions WHERE uid = 'u5' AND sid = sub.sid
);


-- TEST TRACK ACTIONS
SELECT u.username, s.name AS song_name, uta.total_plays, uta.favourite, uta.rating
FROM user_track_actions uta
JOIN users u ON uta.uid = u.uid
JOIN songs s ON uta.sid = s.sid
ORDER BY uta.last_listened DESC;

-- ─────────────────────────────────────────────
-- SONG FETCH TEST STATEMENTS
SELECT * FROM songs LIMIT 10;

SELECT * FROM songs WHERE genre = 'Ambient' LIMIT 10;

SELECT * FROM songs WHERE artist = 'Grace Kelly' LIMIT 10;

SELECT * FROM songs WHERE name LIKE '%Calm%' LIMIT 10;

SELECT * FROM songs WHERE duration <= 200 LIMIT 10;
