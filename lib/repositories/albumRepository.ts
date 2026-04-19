import { getPool } from "@/lib/db";
import { Album, Track } from "@/lib/types";

function buildAlbums(albumRows: any[], trackRows: any[]): Album[] {
    const byAlbum: Record<number, Track[]> = {};
    for (const t of trackRows) {
        (byAlbum[t.album_id] ||= []).push({ id: t.id, number: t.number, title: t.title, lyrics: t.lyrics, video: t.video_url });
    }
    return albumRows.map((a) => ({ id: a.id, title: a.title, artist: a.artist, year: a.year, image: a.image, description: a.description, tracks: byAlbum[a.id] || [] }));
}

async function withTracks(albumRows: any[]): Promise<Album[]> {
    if (albumRows.length === 0) return [];
    const pool = getPool();
    const ids = albumRows.map((a) => a.id);
    const tr = await pool.query("SELECT * FROM tracks WHERE album_id = ANY($1) ORDER BY number", [ids]);
    return buildAlbums(albumRows, tr.rows);
}

export async function findAll(): Promise<Album[]> {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM albums");
    return withTracks(res.rows);
}

export async function findById(id: number): Promise<Album | null> {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM albums WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    return (await withTracks(res.rows))[0];
}

export async function findByArtist(artist: string): Promise<Album[]> {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM albums WHERE LOWER(artist) = LOWER($1)", [artist]);
    return withTracks(res.rows);
}

export async function searchByArtist(term: string): Promise<Album[]> {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM albums WHERE artist ILIKE $1", [`%${term}%`]);
    return withTracks(res.rows);
}

export async function searchByDescription(term: string): Promise<Album[]> {
    const pool = getPool();
    const res = await pool.query("SELECT * FROM albums WHERE description ILIKE $1", [`%${term}%`]);
    return withTracks(res.rows);
}

export async function create(album: Omit<Album, "id">, tracks?: Track[]): Promise<number> {
    const pool = getPool();
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const res = await client.query(
            "INSERT INTO albums (title, artist, description, year, image) VALUES ($1,$2,$3,$4,$5) RETURNING id",
            [album.title, album.artist, album.description ?? null, album.year, album.image ?? null]
        );
        const albumId: number = res.rows[0].id;
        for (const t of tracks ?? []) {
            if (!t.title || t.number == null) continue;
            await client.query(
                "INSERT INTO tracks (album_id, title, number, lyrics, video_url) VALUES ($1,$2,$3,$4,$5)",
                [albumId, t.title, t.number, t.lyrics ?? null, t.video ?? null]
            );
        }
        await client.query("COMMIT");
        return albumId;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function update(id: number, album: Partial<Album>, tracks?: Track[]): Promise<void> {
    const pool = getPool();
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        await client.query(
            "UPDATE albums SET title=$1, artist=$2, description=$3, year=$4, image=$5 WHERE id=$6",
            [album.title, album.artist, album.description ?? null, album.year, album.image ?? null, id]
        );
        for (const t of tracks ?? []) {
            if (t.id == null) continue;
            await client.query(
                "UPDATE tracks SET number=$1, title=$2, lyrics=$3, video_url=$4 WHERE id=$5 AND album_id=$6",
                [t.number, t.title, t.lyrics ?? null, t.video ?? null, t.id, id]
            );
        }
        await client.query("COMMIT");
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function remove(id: number): Promise<boolean> {
    const pool = getPool();
    const res = await pool.query("DELETE FROM albums WHERE id=$1 RETURNING id", [id]);
    return (res.rowCount ?? 0) > 0;
}
