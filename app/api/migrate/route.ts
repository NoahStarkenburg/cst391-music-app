import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// One-time migration endpoint to create playlist tables on production database
export async function GET() {
  try {
    const pool = getPool();

    // Create playlists table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "playlists" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(100) NOT NULL,
        "description" varchar(500) DEFAULT NULL,
        "owner_user_id" integer DEFAULT NULL,
        "is_public" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create playlist_songs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "playlist_songs" (
        "id" SERIAL PRIMARY KEY,
        "playlist_id" integer NOT NULL,
        "track_id" integer NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        "added_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "fk_playlist" FOREIGN KEY ("playlist_id") REFERENCES "playlists" ("id") ON DELETE CASCADE,
        CONSTRAINT "fk_track" FOREIGN KEY ("track_id") REFERENCES "tracks" ("id") ON DELETE CASCADE,
        CONSTRAINT "unique_playlist_track" UNIQUE ("playlist_id", "track_id")
      )
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS "idx_playlist_songs_playlist" ON "playlist_songs" ("playlist_id")`);
    await pool.query(`CREATE INDEX IF NOT EXISTS "idx_playlist_songs_track" ON "playlist_songs" ("track_id")`);

    // Insert sample data only if empty
    const check = await pool.query('SELECT COUNT(*) as cnt FROM playlists');
    if (parseInt(check.rows[0].cnt) === 0) {
      await pool.query(`
        INSERT INTO "playlists" ("name", "description", "is_public") VALUES
          ('Classic Beatles Hits', 'The best Beatles songs all in one place', true),
          ('Chill Vibes', 'Slower Beatles tracks for relaxing', true),
          ('My Private Mix', 'Personal favorites', false)
      `);
      await pool.query(`
        INSERT INTO "playlist_songs" ("playlist_id", "track_id", "position") VALUES
          (1, 2, 1), (1, 5, 2), (1, 161, 3), (1, 167, 4), (1, 114, 5),
          (2, 3, 1), (2, 32, 2), (2, 36, 3), (2, 128, 4),
          (3, 1, 1), (3, 92, 2), (3, 183, 3)
      `);
    }

    return NextResponse.json({ message: 'Migration complete: playlists and playlist_songs tables created with sample data' });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 });
  }
}
