-- insert_songs.sql
-- Inserts sample data extracted from the provided HTML tables
USE your_database_name;

INSERT INTO songs (sid, name, genre, artist, year, language, duration, other_info) VALUES
  -- A Perfect Circle
  ('CHRRADIO_398-17', 'The Doomed', 'Rock', 'A Perfect Circle', 2018, 'Unknown', 4*60+41,
    'BPM: 141.9; details: details...'),

  -- Tom Jones
  ('TOMJONES_GH1-14', 'I (Who Have Nothing)', 'Rock 1980s', 'Tom Jones', 1992, 'Unknown', 3*60+0,
    'BPM: 130.2; details: details...'),

  -- Color Me Badd (two versions)
  ('POWERTRK_111-05', 'I Adore Mi Amor', 'Slow', 'Color Me Badd', 1991, 'Unknown', 4*60+51,
    'BPM: 92.0; details: details...'),
  ('THEN____02B-10', 'I Adore Mi Amor', 'Rock 1980s', 'Color Me Badd', 1991, 'Unknown', 4*60+50,
    'BPM: 92.0; details: details...'),

  -- Cypress Hill
  ('CYPRSHIL_BSR-02', 'I Ain''t Goin'' Out Like That [Radio Edit]', 'Rock 1990s', 'Cypress Hill', 1993, 'Unknown', 4*60+26,
    'BPM: 100.8; details: details...'),

  -- The Temptations
  ('TEMPTTNS_G1B-09', 'I Ain''t Got Nothin''', 'Rock 1960s', 'The Temptations', 1965, 'Unknown', 3*60+35,
    'BPM: 92.8; details: details...'),

  -- The Black Crowes
  ('CHRRADIO_197-14', 'I Ain''t Hiding', 'Rock', 'The Black Crowes', 2009, 'Unknown', 3*60+47,
    'BPM: 121.4; details: details...'),

  -- 2Pac
  ('HOTTRACK_030-12', 'I Ain''t Mad at Cha', 'Rap', '2Pac', 1996, 'Unknown', 4*60+51,
    'BPM: 85.1; details: details...'),

  -- Shania Twain (two disc-tracks)
  ('CHRRADIO_094-19', 'I Ain''t No Quitter', 'Country', 'Shania Twain', 2005, 'Unknown', 3*60+29,
    'BPM: 160.5; details: details...'),
  ('SHANIATW_GH1-21', 'I Ain''t No Quitter', 'Country', 'Shania Twain', 2004, 'Unknown', 3*60+30,
    'BPM: 160.5; details: details...'),

  -- Lynyrd Skynyrd
  ('LSKYNYRD_GH1-03', 'I Ain''t the One', 'Rock 1980s', 'Lynyrd Skynyrd', 1989, 'Unknown', 3*60+52,
    'BPM: 93.0; details: details...'),

  -- Papa Roach
  ('CHRRADIO_197-12', 'I Almost Told You That I Loved You', 'Rock', 'Papa Roach', 2009, 'Unknown', 3*60+8,
    'BPM: 93.0; details: details...'),

  -- Live (one of the two entries)
  ('LIVE_____THC-03', 'I Alone', 'Rock 1990s', 'Live', 1994, 'Unknown', 3*60+50,
    'BPM: 90.5; details: details...'),

  -- Mark Snow
  ('TVGREHIT_006-51', 'T J Hooker', 'TV Theme', 'Mark Snow', 1985, 'Unknown', 1*60+3,
    'BPM: 144.0; details: details...'),

  -- Travis Tritt
  ('POWERTRK_041-16', 'T-R-O-U-B-L-E', 'Country', 'Travis Tritt', 1993, 'Unknown', 3*60+0,
    'BPM: 180.0; details: details...'),

  -- The Beaches
  ('CHRRADIO_402-16', 'T-Shirt', 'Rock', 'The Beaches', 2018, 'Unknown', 3*60+3,
    'BPM: 114.0; details: details...'),

  -- Migos
  ('CHRRADIO_377-06', 'T-Shirt [Clean]', 'Urban', 'Migos', 2017, 'Unknown', 4*60+1,
    'BPM: 139.1; details: details...'),

  -- Shontelle (two versions)
  ('CHRRADIO_177-05', 'T-Shirt', 'CHR', 'Shontelle', 2008, 'Unknown', 3*60+55,
    'BPM: 87.0; details: details...'),
  ('RHYTMR08_012-13', 'T-Shirt [Josh Harris Radio Mix]', 'Dance 2000s', 'Shontelle', 2008, 'Unknown', 3*60+20,
    'BPM: 120.0; details: details...'),

  -- Thomas Rhett
  ('CHRRADIO_357-19', 'T-Shirt [Single Edit]', 'Country', 'Thomas Rhett', 2016, 'Unknown', 3*60+25,
    'BPM: 96.0; details: details...'),

  -- Live (again)
  ('LIVE_____THC-09', 'T.B.D.', 'Rock 1990s', 'Live', 1994, 'Unknown', 4*60+29,
    'BPM: 156.9; details: details...'),

  -- Will.i.am ft. Jennifer Lopez & Mick Jagger
  ('CHRRADIO_254-01', 'T.H.E. (The Hardest Ever)', 'CHR', 'Will.i.am Featuring Jennifer Lopez & Mick Jagger', 2012, 'Unknown', 4*60+6,
    'BPM: 106.0; details: details...'),

  -- Alabama
  ('POWERTRK_132-11', 'T.L.C. A.S.A.P.', 'Country', 'Alabama', 1994, 'Unknown', 3*60+30,
    'BPM: 148.5; details: details...'),

  -- AC/DC (two entries)
  ('ACDC_____LV1-13', 'T.N.T. [Live]', 'Rock 1980s', 'AC/DC', 1992, 'Unknown', 3*60+47,
    'BPM: 128.4; details: details...'),
  ('POWERTRK_148-05', 'T.N.T.', 'Rock 1970s', 'AC/DC', 1976, 'Unknown', 3*60+31,
    'BPM: 127.3; details: details...'),

  -- Raffi
  ('RAFFI____GH1-08', 'Y A Un Rot Sur Le Pont D''avignon', 'Kids', 'Raffi', 1979, 'Unknown', 2*60+9,
    'BPM: 95.4; details: details...'),

  -- Compay Segundo
  ('BUENAVSC_STD-06', '?Y Tu Que Has Hecho?', 'Easy', 'Compay Segundo', 1997, 'Unknown', 3*60+14,
    'BPM: 146.5; details: details...'),

  -- Paulina Rubio
  ('LATINMIX_001-07', 'Y Yo Sigo Aqui', 'Latin', 'Paulina Rubio', 2004, 'Unknown', 3*60+57,
    'BPM: 126.0; details: details...'),

  -- Sesame Street
  ('SESAMEST_01B-06', 'Y''all Fall Down', 'Kids', 'Sesame Street', 1970, 'Unknown', 1*60+42,
    'BPM: 105.9; details: details...'),

  -- Village People (first of many variants)
  ('BLAMBOOG_001-12', 'Y.M.C.A.', 'Disco', 'Village People', 1975, 'Unknown', 3*60+22,
    'BPM: 126.3; details: details...'),

  -- (…repeat the same pattern for each of the additional “Y.M.C.A.” rows you have…)  

  -- Birdman ft. Nicki Minaj
  ('CHRRADIO_249-09', 'Y.U. Mad', 'Urban', 'Birdman Featuring Nicki Minaj', 2011, 'Unknown', 3*60+6,
    'BPM: 153.1; details: details...'),

  -- Albina & Gipsy Kings
  ('HOTSTUFF_015-01', 'Ya Mama Ya Mama', 'TBD', 'Albina & Gipsy Kings', 1998, 'Unknown', 4*60+2,
    'BPM: 102.6; details: details...'),

  -- Fatboy Slim
  ('CHANGELS_ST1-12', 'Ya Mama', 'Dance 2000s', 'Fatboy Slim', 2000, 'Unknown', 4*60+29,
    'BPM: 118.7; details: details...'),

  -- Uzma
  ('ROUGHGDE_ASU-06', 'Yab Yum [Sabres Of Paradise Remix]', 'World', 'Uzma', 2003, 'Unknown', 4*60+31,
    'BPM: 125.6; details: details...');

-- End of insert_songs.sql
