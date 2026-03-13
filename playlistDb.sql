DROP TABLE IF EXISTS "playlist_songs" CASCADE;
DROP TABLE IF EXISTS "playlists" CASCADE;

CREATE TABLE "playlists" (
  "id" SERIAL PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "description" varchar(500) DEFAULT NULL,
  "owner_user_id" integer DEFAULT NULL,
  "is_public" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "playlist_songs" (
  "id" SERIAL PRIMARY KEY,
  "playlist_id" integer NOT NULL,
  "track_id" integer NOT NULL,
  "position" integer NOT NULL DEFAULT 0,
  "added_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "fk_playlist" FOREIGN KEY ("playlist_id") REFERENCES "playlists" ("id") ON DELETE CASCADE,
  CONSTRAINT "fk_track" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE,
  CONSTRAINT "unique_playlist_track" UNIQUE ("playlist_id", "track_id")
);

CREATE INDEX "idx_playlist_songs_playlist" ON "playlist_songs" ("playlist_id");
CREATE INDEX "idx_playlist_songs_track" ON "playlist_songs" ("track_id");

INSERT INTO "playlists" ("name", "description", "is_public") VALUES
  ('Classic Beatles Hits', 'The best Beatles songs all in one place', true),
  ('Chill Vibes', 'Slower Beatles tracks for relaxing', true),
  ('My Private Mix', 'Personal favorites', false);

INSERT INTO "playlist_songs" ("playlist_id", "track_id", "position") VALUES
  (1, 2, 1),
  (1, 5, 2),
  (1, 161, 3),
  (1, 167, 4),
  (1, 114, 5),
  (2, 3, 1),
  (2, 32, 2),
  (2, 36, 3),
  (2, 128, 4),
  (3, 1, 1),
  (3, 92, 2),
  (3, 183, 3);
