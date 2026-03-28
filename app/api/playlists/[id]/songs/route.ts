import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/playlists/:id/songs - Add a song to a playlist
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { track_id } = body;

    if (!track_id || isNaN(parseInt(track_id))) {
      return NextResponse.json({ error: 'Valid track_id is required' }, { status: 400 });
    }

    const pool = getPool();

    // Check playlist exists
    const playlistCheck = await pool.query('SELECT id FROM playlists WHERE id = $1', [playlistId]);
    if (playlistCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    // Check track exists
    const trackCheck = await pool.query('SELECT id FROM tracks WHERE id = $1', [track_id]);
    if (trackCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Check if song already in playlist
    const dupeCheck = await pool.query(
      'SELECT id FROM playlist_songs WHERE playlist_id = $1 AND track_id = $2',
      [playlistId, track_id]
    );
    if (dupeCheck.rows.length > 0) {
      return NextResponse.json({ error: 'Song already in playlist' }, { status: 409 });
    }

    // Get next position
    const posRes = await pool.query(
      'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM playlist_songs WHERE playlist_id = $1',
      [playlistId]
    );
    const nextPosition = posRes.rows[0].next_pos;

    // Insert
    const result = await pool.query(
      `INSERT INTO playlist_songs (playlist_id, track_id, position)
       VALUES ($1, $2, $3) RETURNING *`,
      [playlistId, track_id, nextPosition]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error(`POST /api/playlists/${playlistId}/songs error:`, error);
    return NextResponse.json({ error: 'Failed to add song to playlist' }, { status: 500 });
  }
}
