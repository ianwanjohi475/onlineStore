import "server-only";
import { createRequire } from "node:module";
import { createClient, type Client } from "@libsql/client/http";

/**
 * Turso (libSQL / hosted SQLite) backend.
 *
 * Active when TURSO_DATABASE_URL is set. Remote databases use the pure-HTTP
 * client — no native binary, so it runs on Vercel's serverless runtime without
 * "Cannot find module '@libsql/linux-x64-gnu'" surprises. `file:` URLs (local
 * tests only) load the native SQLite client on demand.
 *
 * The schema is deliberately plain SQL with no vendor-specific features, so the
 * same statements run on local SQLite or Postgres-with-minor-tweaks if the shop
 * ever outgrows the free tier.
 */

/** Undo the usual copy-paste accidents: quotes, spaces, line breaks, `NAME=` prefixes. */
function clean(v: string | undefined): string {
  return (v ?? "")
    .trim()
    .replace(/^(?:export\s+)?[A-Z][A-Z0-9_]*\s*=\s*/, "")
    .replace(/^["'`\s]+|["'`\s]+$/g, "")
    .trim();
}
const isJwt = (v: string) => /^eyJ[\w-]+\.[\w-]+\.[\w-]+$/.test(v);
const looksLikeDbUrl = (v: string) => /^(libsql|https?|wss?|file):/i.test(v) || /\.turso\.io\b/i.test(v);

/** First env var (by name) holding a value, plus any `*_DATABASE_URL` a Vercel
 *  integration may have created with a custom prefix. */
function findEnv(names: string[], pattern: RegExp, accept: (v: string) => boolean): { key: string; value: string } | null {
  for (const key of names) {
    const value = clean(process.env[key]);
    if (value && accept(value)) return { key, value };
  }
  for (const [key, raw] of Object.entries(process.env)) {
    const value = clean(raw);
    if (pattern.test(key) && value && accept(value)) return { key, value };
  }
  return null;
}

function resolveConfig() {
  let url = findEnv(["TURSO_DATABASE_URL", "TURSO_URL", "LIBSQL_URL", "LIBSQL_DATABASE_URL", "DATABASE_URL"], /(TURSO|LIBSQL).*_URL$/, looksLikeDbUrl);
  let token = findEnv(
    ["TURSO_AUTH_TOKEN", "TURSO_TOKEN", "LIBSQL_AUTH_TOKEN", "DATABASE_AUTH_TOKEN", url ? url.key.replace(/(DATABASE_)?URL$/, "AUTH_TOKEN") : ""].filter(Boolean),
    /(TURSO|LIBSQL).*TOKEN$/,
    (v) => isJwt(v.replace(/^Bearer\s+/i, "").replace(/\s+/g, "")),
  );
  // The two values pasted into each other's boxes → swap them back.
  if (!url && isJwt(clean(process.env.TURSO_DATABASE_URL).replace(/\s+/g, "")) && looksLikeDbUrl(clean(process.env.TURSO_AUTH_TOKEN))) {
    url = { key: "TURSO_AUTH_TOKEN", value: clean(process.env.TURSO_AUTH_TOKEN) };
    token = { key: "TURSO_DATABASE_URL", value: clean(process.env.TURSO_DATABASE_URL) };
  }

  let problem = "";
  let value = url?.value ?? "";
  if (!value && clean(process.env.TURSO_DATABASE_URL)) {
    problem = "TURSO_DATABASE_URL doesn't look like a database URL. Copy the URL that starts with libsql:// from your database page in Turso.";
  }
  if (value && !/^[a-z]+:/i.test(value)) value = `libsql://${value}`; // bare hostname
  if (/app\.turso\.tech|turso\.tech\//i.test(value)) {
    problem = "TURSO_DATABASE_URL is the Turso dashboard link. Use the database URL instead — it starts with libsql:// and ends with .turso.io.";
    value = "";
  }
  if (value && !value.startsWith("file:")) {
    try {
      const u = new URL(value.replace(/^libsql:/i, "https:"));
      value = `${/^https?:/i.test(value) && u.hostname.match(/^(localhost|127\.)/) ? u.protocol : "libsql:"}//${u.host}`;
    } catch {
      problem = "TURSO_DATABASE_URL isn't a valid URL. It should look like libsql://your-db-yourname.turso.io";
      value = "";
    }
  }
  const authToken = token ? token.value.replace(/^Bearer\s+/i, "").replace(/\s+/g, "") : clean(process.env.TURSO_AUTH_TOKEN) || undefined;
  if (value && !value.startsWith("file:") && /\.turso\.io$/i.test(new URL(value.replace(/^libsql:/, "https:")).hostname) && !authToken) {
    problem = "TURSO_AUTH_TOKEN is missing. Create a token for this database in Turso and add it in Vercel.";
  }
  return { url: value, authToken, urlKey: url?.key ?? null, tokenKey: token?.key ?? (authToken ? "TURSO_AUTH_TOKEN" : null), problem };
}

export const TURSO_CONFIG = resolveConfig();
export const TURSO_ON = !!TURSO_CONFIG.url;

/** Turn a libSQL/network error into something a shop owner can act on. */
export function explainDbError(e: unknown): string {
  const msg = (e instanceof Error ? `${e.message} ${(e as { code?: string }).code ?? ""} ${(e as { cause?: Error }).cause?.message ?? ""}` : String(e)).replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]");
  if (/\b401\b|unauthori[sz]ed|invalid.*token|jwt|authenticat|authoriz/i.test(msg)) return "Turso rejected the token — it's wrong, expired, or belongs to a different database. In Turso open this database → Create token (full access), then replace TURSO_AUTH_TOKEN in Vercel and redeploy.";
  if (/\b404\b|not found|does not exist/i.test(msg)) return "Turso can't find that database. Copy the URL again from your database page in Turso (starts with libsql://) into TURSO_DATABASE_URL.";
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo/i.test(msg)) return "That database address doesn't exist — TURSO_DATABASE_URL is probably mistyped.";
  if (/read.?only|SQLITE_READONLY|BLOCKED/i.test(msg)) return "The token is read-only. Create a new token with full access and replace TURSO_AUTH_TOKEN.";
  if (/forbidden|\b403\b/i.test(msg)) return "Turso refused access — the token is read-only or was made for a different database. Create a new full-access token for this database and replace TURSO_AUTH_TOKEN.";
  if (/archived|sleep|paused|\b5\d\d\b/i.test(msg)) return "Turso didn't respond (the database may be paused or Turso is busy). Open it in the Turso dashboard, then check again.";
  if (/fetch failed|ECONN|ETIMEDOUT|network|socket/i.test(msg)) return "Couldn't reach Turso from Vercel. Check again in a minute.";
  return `Connection failed: ${msg.trim().slice(0, 180)}`;
}

const g = globalThis as unknown as { __svTurso?: Client; __svTursoReady?: Promise<void> };

export function db(): Client {
  if (!g.__svTurso) {
    const config = { url: TURSO_CONFIG.url, authToken: TURSO_CONFIG.authToken };
    if (config.url.startsWith("file:")) {
      // Native SQLite — local testing only, so it's never bundled for Vercel.
      const mod = "@libsql/client/sqlite3";
      const local = createRequire(`${process.cwd()}/`)(mod) as { createClient: typeof createClient };
      g.__svTurso = local.createClient(config);
    } else {
      g.__svTurso = createClient(config);
    }
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
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     name TEXT,
     phone TEXT,
     password_hash TEXT NOT NULL,
     created_at TEXT NOT NULL,
     session_version INTEGER NOT NULL DEFAULT 1
   )`,
  `CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (json_extract(data, '$.userId'))`,
  `CREATE TABLE IF NOT EXISTS password_resets (
     token_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     expires_at INTEGER NOT NULL
   )`,
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
