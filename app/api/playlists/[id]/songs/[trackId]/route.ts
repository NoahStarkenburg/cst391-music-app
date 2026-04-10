import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const runtime = 'nodejs';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; trackId: string }> }
) {
  const { id, trackId } = await context.params;
  const playlistId = parseInt(id, 10);
  const trackIdNum = parseInt(trackId, 10);

  if (isNaN(playlistId) || isNaN(trackIdNum)) {
    return NextResponse.json({ error: 'Invalid playlist ID or track ID' }, { status: 400 });
  }

  try {
    const pool = getPool();

    const result = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND track_id = $2 RETURNING id',
      [playlistId, trackIdNum]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Song not found in playlist' }, { status: 404 });
    }

    await pool.query(
      `WITH ranked AS (
         SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_pos
         FROM playlist_songs
         WHERE playlist_id = $1
       )
       UPDATE playlist_songs SET position = ranked.new_pos
       FROM ranked WHERE playlist_songs.id = ranked.id`,
      [playlistId]
    );

    return NextResponse.json({ message: `Track ${trackIdNum} removed from playlist ${playlistId}` });
  } catch (error) {
    console.error(`DELETE /api/playlists/${playlistId}/songs/${trackIdNum} error:`, error);
    return NextResponse.json({ error: 'Failed to remove song from playlist' }, { status: 500 });
  }
}
