-- We use this account to test

-- USERS
INSERT IGNORE INTO users (uid, username, password, email, name, age, country) VALUES
('u1', 'pop_rock_alex', 'password123', 'test@example.com', 'Alex Johnson', 25, 'Canada'),
('u2', 'jazz_sarah', 'password123', 'test@example.com', 'Sarah Chen', 28, 'Canada'),
('u3', 'metal_mike', 'password123', 'test@example.com', 'Mike Rodriguez', 22, 'Spain'),
('u4', 'hiphop_jess', 'password123', 'test@example.com', 'Jessica Williams', 24, 'USA'),
('u5', 'electro_dave', 'password123', 'test@example.com', 'David Kim', 26, 'South Korea'),
('u6', 'folk_emma', 'password123', 'test@example.com', 'Emma Thompson', 30, 'UK');

-- PLAYLISTS
INSERT IGNORE INTO playlists (pid, name, description, private) VALUES
('p1', 'Pop & Rock Hits', 'Alex\'s favourite pop and rock songs', FALSE),
('p2', 'Smooth Jazz', 'Sarah\'s jazz and blues collection', FALSE),
('p3', 'Metal Madness', 'Mike\'s heavy metal playlist', FALSE),
('p4', 'Hip Hop Vibes', 'Jessica\'s hip hop and R&B jams', FALSE),
('p5', 'Electro Party', 'Dave\'s electronic and dance tracks', FALSE),
('p6', 'Folk & Indie', 'Emma\'s folk and indie picks', FALSE);

-- USER_PLAYLISTS
INSERT IGNORE INTO user_playlists (uid, pid, is_favourite) VALUES
('u1', 'p1', TRUE),
('u2', 'p2', TRUE),
('u3', 'p3', TRUE),
('u4', 'p4', TRUE),
('u5', 'p5', TRUE),
('u6', 'p6', TRUE);

-- PLAYLIST_SONGS: Add 3 different songs to each playlist using real SIDs
INSERT INTO playlist_songs (pid, sid)
SELECT 'p1', sid FROM (SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 0) AS sub
WHERE NOT EXISTS (SELECT 1 FROM playlist_songs WHERE pid = 'p1' AND sid = sub.sid);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p2', sid FROM (SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 3) AS sub
WHERE NOT EXISTS (SELECT 1 FROM playlist_songs WHERE pid = 'p2' AND sid = sub.sid);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p3', sid FROM (SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 6) AS sub
WHERE NOT EXISTS (SELECT 1 FROM playlist_songs WHERE pid = 'p3' AND sid = sub.sid);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p4', sid FROM (SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 9) AS sub
WHERE NOT EXISTS (SELECT 1 FROM playlist_songs WHERE pid = 'p4' AND sid = sub.sid);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p5', sid FROM (SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 12) AS sub
WHERE NOT EXISTS (SELECT 1 FROM playlist_songs WHERE pid = 'p5' AND sid = sub.sid);

INSERT INTO playlist_songs (pid, sid)
SELECT 'p6', sid FROM (SELECT sid FROM songs ORDER BY sid LIMIT 3 OFFSET 15) AS sub
WHERE NOT EXISTS (SELECT 1 FROM playlist_songs WHERE pid = 'p6' AND sid = sub.sid);

-- USER TRACK ACTIONS: Mark one song in each playlist as favourite for each user
INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u1', sid, NOW(), 12, TRUE, 5 FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 0) AS sub
WHERE NOT EXISTS (SELECT 1 FROM user_track_actions WHERE uid = 'u1' AND sid = sub.sid);

INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u2', sid, NOW(), 8, TRUE, 4 FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 3) AS sub
WHERE NOT EXISTS (SELECT 1 FROM user_track_actions WHERE uid = 'u2' AND sid = sub.sid);

INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u3', sid, NOW(), 15, TRUE, 5 FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 6) AS sub
WHERE NOT EXISTS (SELECT 1 FROM user_track_actions WHERE uid = 'u3' AND sid = sub.sid);

INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u4', sid, NOW(), 10, TRUE, 5 FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 9) AS sub
WHERE NOT EXISTS (SELECT 1 FROM user_track_actions WHERE uid = 'u4' AND sid = sub.sid);

INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u5', sid, NOW(), 20, TRUE, 4 FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 12) AS sub
WHERE NOT EXISTS (SELECT 1 FROM user_track_actions WHERE uid = 'u5' AND sid = sub.sid);

INSERT INTO user_track_actions (uid, sid, last_listened, total_plays, favourite, rating)
SELECT 'u6', sid, NOW(), 18, TRUE, 5 FROM (SELECT sid FROM songs ORDER BY sid LIMIT 1 OFFSET 15) AS sub
WHERE NOT EXISTS (SELECT 1 FROM user_track_actions WHERE uid = 'u6' AND sid = sub.sid);

-- You can add more user_track_actions for variety, e.g. mark more songs as played or favourited for each user.