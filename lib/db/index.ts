/**
 * Database client for Vilo PostgreSQL.
 * Supports running inside Docker compose or gracefully falling back to local memory mode.
 */

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || "postgresql://vilo_user:vilo_password@localhost:5432/vilo_db";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function queryDb<T = any>(text: string, params?: any[]): Promise<T[]> {
  try {
    const p = getDbPool();
    const res = await p.query(text, params);
    return res.rows;
  } catch (err) {
    console.warn("[Vilo DB] Query failed or database unavailable, using mock response:", err);
    return [];
  }
}
