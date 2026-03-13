import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import fs from 'fs';
import path from 'path';

let pool: Pool | undefined;
let pgliteDb: PGlite | undefined;
let pgliteInitialized = false;

const USE_PGLITE = !process.env.POSTGRES_URL && !process.env.DATABASE_URL;

async function getPGlite(): Promise<PGlite> {
  if (pgliteDb && pgliteInitialized) return pgliteDb;
  if (pgliteDb) {
    while (!pgliteInitialized) await new Promise(r => setTimeout(r, 50));
    return pgliteDb;
  }

  pgliteDb = new PGlite();
  await pgliteDb.waitReady;

  const baseSql = fs.readFileSync(path.join(process.cwd(), 'musicDbPostgresSQL.sql'), 'utf8');
  await pgliteDb.exec(baseSql);

  const playlistSqlPath = path.join(process.cwd(), 'playlistDb.sql');
  if (fs.existsSync(playlistSqlPath)) {
    const playlistSql = fs.readFileSync(playlistSqlPath, 'utf8');
    await pgliteDb.exec(playlistSql);
  }

  console.log('[PGlite] Database initialized with music + playlist data');
  pgliteInitialized = true;
  return pgliteDb;
}

function createPGlitePool(): Pool {
  return {
    query: async (text: string, params?: unknown[]) => {
      const db = await getPGlite();
      const result = await db.query(text, params as any[]);
      return { rows: result.rows, rowCount: result.rows.length } as any;
    },
    connect: async () => {
      const db = await getPGlite();
      return {
        query: async (text: string, params?: unknown[]) => {
          const result = await db.query(text, params as any[]);
          return { rows: result.rows, rowCount: result.rows.length } as any;
        },
        release: () => {},
      } as any;
    },
  } as any;
}

export function getPool(): Pool {
  if (USE_PGLITE) {
    if (!pool) {
      pool = createPGlitePool();
    }
    return pool;
  }

  if (!pool) {
    const URL = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;
    if (!URL) throw new Error('POSTGRES_URL (or DATABASE_URL) not set');
    pool = new Pool({
      connectionString: URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return pool;
}
