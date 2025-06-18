-- Constraints for all tables

-- Users table constraints
ALTER TABLE users
    ADD CONSTRAINT unique_username UNIQUE (username),
    ADD CONSTRAINT unique_email UNIQUE (email),
    ADD CONSTRAINT check_age CHECK (age >= 0),
    ADD CONSTRAINT check_username CHECK (LENGTH(username) >= 3),
    ADD CONSTRAINT check_password CHECK (LENGTH(password) >= 8),
    ADD CONSTRAINT check_country CHECK (
        country IN (
            'USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Japan', 'China',
            'India', 'Brazil', 'Mexico', 'Spain', 'Italy', 'Russia', 'South Korea'
            -- Add more countries as needed
        )
    );

-- Songs table constraints
ALTER TABLE songs
    ADD CONSTRAINT check_duration CHECK (duration > 0),
    ADD CONSTRAINT check_song_name CHECK (LENGTH(name) > 0),
    ADD CONSTRAINT check_artist CHECK (LENGTH(artist) > 0),
    ADD CONSTRAINT check_genre CHECK (
        genre IN (
            'Pop', 'Rock', 'Hip Hop', 'Jazz', 'Classical', 'Electronic', 'R&B',
            'Country', 'Folk', 'Blues', 'Metal', 'Reggae', 'Latin', 'Alternative'
            -- Add more genres as needed
        )
    );

-- Playlists table constraints
ALTER TABLE playlists
    ADD CONSTRAINT check_playlist_name CHECK (LENGTH(name) > 0),
    ADD CONSTRAINT check_description CHECK (LENGTH(description) <= 1000),
    ADD CONSTRAINT fk_user FOREIGN KEY(uid) REFERENCES users(uid);

-- Listened table constraints
ALTER TABLE listened
    ADD CONSTRAINT check_rating CHECK (rating >= 1 AND rating <= 5),
    ADD CONSTRAINT check_total_plays CHECK (total_plays >= 0),
    ADD CONSTRAINT unique_user_song UNIQUE (uid, sid),
    ADD CONSTRAINT fk_user FOREIGN KEY(uid) REFERENCES users(uid),
    ADD CONSTRAINT fk_song FOREIGN KEY(sid) REFERENCES songs(sid),
    ADD CONSTRAINT fk_playlist FOREIGN KEY(pid) REFERENCES playlists(pid);

-- Playlist_songs table constraints
ALTER TABLE playlist_songs
    ADD CONSTRAINT check_added_at CHECK (added_at <= CURRENT_TIMESTAMP),
    ADD CONSTRAINT fk_playlist FOREIGN KEY(pid) REFERENCES playlists(pid),
    ADD CONSTRAINT fk_song FOREIGN KEY(sid) REFERENCES songs(sid);

-- Add composite indexes for better query performance
