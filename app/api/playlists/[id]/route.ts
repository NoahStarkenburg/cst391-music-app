import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const pool = getPool();

    const playlistRes = await pool.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);
    if (playlistRes.rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const songsRes = await pool.query(
      `SELECT ps.position, ps.added_at,
              t.id as track_id, t.title as track_title, t.number as track_number,
              a.id as album_id, a.title as album_title, a.artist, a.image
       FROM playlist_songs ps
       JOIN tracks t ON ps.track_id = t.id
       JOIN albums a ON t.album_id = a.id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position`,
      [playlistId]
    );

    return NextResponse.json({
      ...playlistRes.rows[0],
      songs: songsRes.rows,
    });
  } catch (error) {
    console.error(`GET /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
  }
}

export async function PUT(
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
    const { name, description, is_public } = body;

    const pool = getPool();
    const res = await pool.query(
      `UPDATE playlists
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public)
       WHERE id = $4 RETURNING *`,
      [name, description, is_public, playlistId]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);
  } catch (error) {
    console.error(`PUT /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const playlistId = parseInt(id, 10);
  if (isNaN(playlistId)) {
    return NextResponse.json({ error: 'Invalid playlist ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const res = await pool.query('DELETE FROM playlists WHERE id = $1 RETURNING id', [playlistId]);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({ message: `Playlist ${playlistId} deleted` });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id} error:`, error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
