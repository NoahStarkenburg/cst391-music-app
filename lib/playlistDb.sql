-- Milestone 4: Playlist Feature Database Schema
-- Run this against your Neon PostgreSQL database

-- Playlists table
CREATE TABLE IF NOT EXISTS "playlists" (
  "id" SERIAL PRIMARY KEY,
  "name" VARCHAR(200) NOT NULL,
  "description" VARCHAR(500) DEFAULT NULL,
  "owner_user_id" INTEGER DEFAULT NULL,
  "is_public" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Playlist songs join table (many-to-many between playlists and tracks)
CREATE TABLE IF NOT EXISTS "playlist_songs" (
  "id" SERIAL PRIMARY KEY,
  "playlist_id" INTEGER NOT NULL,
  "track_id" INTEGER NOT NULL,
  "added_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "position" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "playlist_id_FK" FOREIGN KEY ("playlist_id")
    REFERENCES "playlists" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "track_id_FK" FOREIGN KEY ("track_id")
    REFERENCES "tracks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "unique_playlist_track" UNIQUE ("playlist_id", "track_id")
);

CREATE INDEX IF NOT EXISTS "playlist_songs_playlist_idx" ON "playlist_songs" ("playlist_id");
CREATE INDEX IF NOT EXISTS "playlist_songs_track_idx" ON "playlist_songs" ("track_id");

-- Seed some sample playlists
INSERT INTO "playlists" ("name", "description", "owner_user_id", "is_public") VALUES
  ('Beatles Greatest Hits', 'The best tracks from across all Beatles albums', NULL, true),
  ('Chill Beatles', 'Mellow and relaxing Beatles songs', NULL, true),
  ('My Private Mix', 'Personal favorites collection', NULL, false);

-- Add some songs to the playlists
-- Greatest Hits playlist (id=1)
INSERT INTO "playlist_songs" ("playlist_id", "track_id", "position") VALUES
  (1, 161, 1),  -- Come Together
  (1, 162, 2),  -- Something
  (1, 167, 3),  -- Here Comes the Sun
  (1, 92, 4),   -- Yesterday
  (1, 73, 5),   -- Can't Buy Me Love
  (1, 183, 6),  -- Let It Be
  (1, 2, 7),    -- Eleanor Rigby
  (1, 96, 8);   -- Lucy in the Sky with Diamonds

-- Chill Beatles playlist (id=2)
INSERT INTO "playlist_songs" ("playlist_id", "track_id", "position") VALUES
  (2, 36, 1),   -- In My Life
  (2, 128, 2),  -- Blackbird
  (2, 167, 3),  -- Here Comes the Sun
  (2, 92, 4),   -- Yesterday
  (2, 5, 5);    -- Here, There and Everywhere

-- Private Mix playlist (id=3)
INSERT INTO "playlist_songs" ("playlist_id", "track_id", "position") VALUES
  (3, 140, 1),  -- Helter Skelter
  (3, 14, 2),   -- Tomorrow Never Knows
  (3, 1, 3);    -- Taxman

-- Reset sequence
SELECT setval('playlists_id_seq', (SELECT COALESCE(MAX(id),1) FROM "playlists"));
SELECT setval('playlist_songs_id_seq', (SELECT COALESCE(MAX(id),1) FROM "playlist_songs"));
