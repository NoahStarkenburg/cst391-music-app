import { getPool } from "@/lib/db";

export async function findAll(): Promise<string[]> {
    const pool = getPool();
    const res = await pool.query("SELECT DISTINCT artist FROM albums ORDER BY artist");
    return res.rows.map((r: any) => r.artist);
}
