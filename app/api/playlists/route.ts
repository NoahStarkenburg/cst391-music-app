import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getPool();
    const res = await pool.query(
      `SELECT p.*,
        (SELECT COUNT(*)::int FROM playlist_songs ps WHERE ps.playlist_id = p.id) as song_count
       FROM playlists p
       ORDER BY p.created_at DESC`
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('GET /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const pool = getPool();
    const res = await pool.query(
      `INSERT INTO playlists (name, description, is_public)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, description ?? null, is_public ?? true]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
