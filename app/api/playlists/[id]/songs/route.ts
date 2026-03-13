import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

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
    const { track_id, position } = body;

    if (track_id == null) {
      return NextResponse.json({ error: 'track_id is required' }, { status: 400 });
    }

    const pool = getPool();

    const playlistCheck = await pool.query('SELECT id FROM playlists WHERE id = $1', [playlistId]);
    if (playlistCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const trackCheck = await pool.query('SELECT id FROM tracks WHERE id = $1', [track_id]);
    if (trackCheck.rows.length === 0) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    let pos = position;
    if (pos == null) {
      const maxPos = await pool.query(
        'SELECT COALESCE(MAX(position), 0) + 1 as next_pos FROM playlist_songs WHERE playlist_id = $1',
        [playlistId]
      );
      pos = maxPos.rows[0].next_pos;
    }

    const res = await pool.query(
      `INSERT INTO playlist_songs (playlist_id, track_id, position)
       VALUES ($1, $2, $3) RETURNING *`,
      [playlistId, track_id, pos]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: unknown) {
    const pgError = error as { code?: string };
    if (pgError.code === '23505') {
      return NextResponse.json({ error: 'Track already in playlist' }, { status: 409 });
    }
    console.error(`POST /api/playlists/${id}/songs error:`, error);
    return NextResponse.json({ error: 'Failed to add song' }, { status: 500 });
  }
}
