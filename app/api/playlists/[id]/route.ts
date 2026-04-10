import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { Playlist, PlaylistSong } from '@/lib/types';

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

    const playlistRes = await pool.query(
      'SELECT * FROM playlists WHERE id = $1',
      [playlistId]
    );
    if (playlistRes.rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const playlist: Playlist = playlistRes.rows[0];

    const songsRes = await pool.query(
      `SELECT ps.id, ps.playlist_id, ps.track_id, ps.added_at, ps.position,
              t.title as track_title, t.number as track_number,
              a.title as album_title, a.artist
       FROM playlist_songs ps
       JOIN tracks t ON ps.track_id = t.id
       JOIN albums a ON t.album_id = a.id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position ASC`,
      [playlistId]
    );

    playlist.songs = songsRes.rows as PlaylistSong[];

    return NextResponse.json(playlist);
  } catch (error) {
    console.error(`GET /api/playlists/${playlistId} error:`, error);
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

    const existing = await pool.query('SELECT id FROM playlists WHERE id = $1', [playlistId]);
    if (existing.rows.length === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const result = await pool.query(
      `UPDATE playlists
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           is_public = COALESCE($3, is_public)
       WHERE id = $4
       RETURNING *`,
      [name ?? null, description ?? null, is_public ?? null, playlistId]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(`PUT /api/playlists/${playlistId} error:`, error);
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
    const result = await pool.query(
      'DELETE FROM playlists WHERE id = $1 RETURNING id, name',
      [playlistId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Playlist "${result.rows[0].name}" deleted`,
      id: result.rows[0].id
    });
  } catch (error) {
    console.error(`DELETE /api/playlists/${playlistId} error:`, error);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
