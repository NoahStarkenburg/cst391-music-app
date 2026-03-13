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
    return NextResponse.json({ error: 'Invalid playlist or track ID' }, { status: 400 });
  }

  try {
    const pool = getPool();
    const res = await pool.query(
      'DELETE FROM playlist_songs WHERE playlist_id = $1 AND track_id = $2 RETURNING *',
      [playlistId, trackIdNum]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ error: 'Song not found in playlist' }, { status: 404 });
    }

    return NextResponse.json({ message: `Track ${trackIdNum} removed from playlist ${playlistId}` });
  } catch (error) {
    console.error(`DELETE /api/playlists/${id}/songs/${trackId} error:`, error);
    return NextResponse.json({ error: 'Failed to remove song' }, { status: 500 });
  }
}
