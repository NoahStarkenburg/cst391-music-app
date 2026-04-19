import { getPool } from "@/lib/db";
import { Playlist, PlaylistSong } from "@/lib/types";

export async function findAll(includePrivate = false): Promise<Playlist[]> {
    const pool = getPool();
    const q = includePrivate
        ? "SELECT * FROM playlists ORDER BY created_at DESC"
        : "SELECT * FROM playlists WHERE is_public = true ORDER BY created_at DESC";
    const res = await pool.query(q);
    const playlists: Playlist[] = res.rows;
    if (playlists.length > 0) {
        const ids = playlists.map((p) => p.id);
        const counts = await pool.query(
            "SELECT playlist_id, COUNT(*) as song_count FROM playlist_songs WHERE playlist_id = ANY($1) GROUP BY playlist_id",
            [ids]
        );
        const countMap: Record<number, number> = {};
        for (const r of counts.rows) countMap[r.playlist_id] = parseInt(r.song_count);
        for (const p of playlists) (p as any).song_count = countMap[p.id] || 0;
    }
    return playlists;
}

export async function findById(id: number): Promise<Playlist | null> {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM playlists WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    const playlist: Playlist = res.rows[0];
    const songsRes = await pool.query(
        `SELECT ps.id, ps.playlist_id, ps.track_id, ps.added_at, ps.position,
                t.title as track_title, t.number as track_number,
                a.title as album_title, a.artist
         FROM playlist_songs ps
         JOIN tracks t ON ps.track_id = t.id
         JOIN albums a ON t.album_id = a.id
         WHERE ps.playlist_id = $1
         ORDER BY ps.position ASC`,
        [id]
    );
    playlist.songs = songsRes.rows as PlaylistSong[];
    return playlist;
}

export async function create(name: string, description: string | null, isPublic: boolean): Promise<Playlist> {
    const pool = getPool();
    const res = await pool.query(
        "INSERT INTO playlists (name, description, is_public) VALUES ($1,$2,$3) RETURNING *",
        [name, description ?? null, isPublic]
    );
    return res.rows[0];
}

export async function update(id: number, name?: string, description?: string | null, isPublic?: boolean): Promise<Playlist | null> {
    const pool = getPool();
    const check = await pool.query("SELECT id FROM playlists WHERE id = $1", [id]);
    if (check.rows.length === 0) return null;
    const res = await pool.query(
        "UPDATE playlists SET name=COALESCE($1,name), description=COALESCE($2,description), is_public=COALESCE($3,is_public) WHERE id=$4 RETURNING *",
        [name ?? null, description ?? null, isPublic ?? null, id]
    );
    return res.rows[0];
}

export async function remove(id: number): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query("DELETE FROM playlists WHERE id=$1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
}

export async function addSong(playlistId: number, trackId: number): Promise<PlaylistSong> {
    const pool = getPool();
    const posRes = await pool.query(
        "SELECT COALESCE(MAX(position),0)+1 as next_pos FROM playlist_songs WHERE playlist_id=$1",
        [playlistId]
    );
    const res = await pool.query(
        "INSERT INTO playlist_songs (playlist_id, track_id, position) VALUES ($1,$2,$3) RETURNING *",
        [playlistId, trackId, posRes.rows[0].next_pos]
    );
    return res.rows[0];
}

export async function removeSong(playlistId: number, trackId: number): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query(
        "DELETE FROM playlist_songs WHERE playlist_id=$1 AND track_id=$2 RETURNING id",
        [playlistId, trackId]
    );
    if ((res.rowCount ?? 0) === 0) return false;
    await pool.query(
        `WITH ranked AS (SELECT id, ROW_NUMBER() OVER (ORDER BY position) as new_pos FROM playlist_songs WHERE playlist_id=$1)
         UPDATE playlist_songs SET position=ranked.new_pos FROM ranked WHERE playlist_songs.id=ranked.id`,
        [playlistId]
    );
    return true;
}

export async function songExists(playlistId: number, trackId: number): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query("SELECT id FROM playlist_songs WHERE playlist_id=$1 AND track_id=$2", [playlistId, trackId]);
    return res.rows.length > 0;
}

export async function trackExists(trackId: number): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query("SELECT id FROM tracks WHERE id=$1", [trackId]);
    return res.rows.length > 0;
}
