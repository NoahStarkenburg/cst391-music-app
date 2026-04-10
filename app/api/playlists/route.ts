import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { Playlist } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const pool = getPool();
    const url = new URL(request.url);
    const showAll = url.searchParams.get('all') === 'true';

    let playlistsData;
    if (showAll) {
      playlistsData = await pool.query(
        'SELECT * FROM playlists ORDER BY created_at DESC'
      );
    } else {
      playlistsData = await pool.query(
        'SELECT * FROM playlists WHERE is_public = true ORDER BY created_at DESC'
      );
    }

    const playlists: Playlist[] = playlistsData.rows;

    if (playlists.length > 0) {
      const playlistIds = playlists.map(p => p.id);
      const countsRes = await pool.query(
        `SELECT playlist_id, COUNT(*) as song_count
         FROM playlist_songs
         WHERE playlist_id = ANY($1)
         GROUP BY playlist_id`,
        [playlistIds]
      );
      const counts: Record<number, number> = {};
      for (const row of countsRes.rows) {
        counts[row.playlist_id] = parseInt(row.song_count);
      }
      for (const playlist of playlists) {
        (playlist as Playlist & { song_count: number }).song_count = counts[playlist.id] || 0;
      }
    }

    return NextResponse.json(playlists);
  } catch (error) {
    console.error('GET /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, is_public } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Playlist name is required' }, { status: 400 });
    }

    const pool = getPool();
    const result = await pool.query(
      `INSERT INTO playlists (name, description, is_public)
       VALUES ($1, $2, $3) RETURNING *`,
      [name.trim(), description ?? null, is_public ?? false]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error('POST /api/playlists error:', error);
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
