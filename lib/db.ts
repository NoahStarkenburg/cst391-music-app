import { Pool } from 'pg';

let pool: Pool | undefined;

export function getPool(): Pool {
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
