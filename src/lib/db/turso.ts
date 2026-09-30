import "server-only";
import { createClient, type Client } from "@libsql/client";

/**
 * Turso (libSQL / hosted SQLite) backend.
 *
 * Active when TURSO_DATABASE_URL is set. It speaks HTTP, so it works on Vercel's
 * serverless runtime where a plain SQLite file cannot (read-only filesystem).
 *
 * The schema is deliberately plain SQL with no vendor-specific features, so the
 * same statements run on local SQLite or Postgres-with-minor-tweaks if the shop
 * ever outgrows the free tier.
 */

export const TURSO_ON = !!process.env.TURSO_DATABASE_URL;

const g = globalThis as unknown as { __svTurso?: Client; __svTursoReady?: Promise<void> };

export function db(): Client {
  if (!g.__svTurso) {
    g.__svTurso = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return g.__svTurso;
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS products (
     slug TEXT PRIMARY KEY,
     category TEXT,
     position INTEGER DEFAULT 0,
     stock INTEGER,
     in_stock INTEGER DEFAULT 1,
     data TEXT NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS categories (slug TEXT PRIMARY KEY, position INTEGER DEFAULT 0, data TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS brands (slug TEXT PRIMARY KEY, position INTEGER DEFAULT 0, data TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS testimonials (id TEXT PRIMARY KEY, position INTEGER DEFAULT 0, data TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS orders (
     id TEXT PRIMARY KEY,
     number TEXT,
     created_at TEXT NOT NULL,
     status TEXT,
     payment_status TEXT,
     total REAL DEFAULT 0,
     customer_email TEXT,
     customer_phone TEXT,
     archived INTEGER DEFAULT 0,
     data TEXT NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_number ON orders (number)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_email ON orders (customer_email)`,
  `CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (customer_phone)`,
  `CREATE INDEX IF NOT EXISTS idx_products_category ON products (category)`,
  `CREATE TABLE IF NOT EXISTS settings (id TEXT PRIMARY KEY, data TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS suspended_customers (email TEXT PRIMARY KEY)`,
  `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
];

/** Create tables/indexes once per process. Safe to call on every request. */
export function ensureSchema(): Promise<void> {
  if (!g.__svTursoReady) {
    g.__svTursoReady = (async () => {
      for (const stmt of SCHEMA) await db().execute(stmt);
    })().catch((e) => {
      g.__svTursoReady = undefined; // let a later request retry
      throw e;
    });
  }
  return g.__svTursoReady;
}
