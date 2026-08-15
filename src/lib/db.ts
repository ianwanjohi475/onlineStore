import "server-only";
import { Pool, type PoolClient } from "pg";

/**
 * Postgres / CockroachDB connection. Active only when DATABASE_URL is set;
 * otherwise the app falls back to the local JSON file store (see store.ts).
 * The pool is cached on globalThis so dev HMR doesn't open new pools.
 */
export const DB_URL = process.env.DATABASE_URL;
export const hasDb = !!DB_URL;

const g = globalThis as unknown as { __svePgPool?: Pool };

export function getPool(): Pool {
  if (!g.__svePgPool) {
    g.__svePgPool = new Pool({
      connectionString: DB_URL,
      // CockroachDB Cloud (and most managed Postgres) use publicly-trusted certs,
      // so verifying against the system CA bundle is enough for sslmode=verify-full.
      ssl: { rejectUnauthorized: true },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return g.__svePgPool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function q<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const res = await getPool().query(text, params);
  return res.rows as T[];
}

/** Run a set of statements inside a single transaction. */
export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}
