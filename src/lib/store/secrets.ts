import "server-only";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";
import { TURSO_ON, db, ensureSchema } from "@/lib/db/turso";

/**
 * Tiny key/value store for server-only secrets (e.g. the admin password hash).
 * Turso → `meta` table; Vercel Blob → a file at an unguessable path; otherwise
 * data/secrets.json (owner-only permissions). Never sent to the browser.
 */
const BLOB_ON = !!process.env.BLOB_READ_WRITE_TOKEN;
const BLOB_KEY = `private/secrets-${createHash("sha256").update(`secrets:${process.env.BLOB_READ_WRITE_TOKEN ?? ""}`).digest("hex").slice(0, 40)}.json`;
const FILE = path.join(process.cwd(), "data", "secrets.json");
let mem: Record<string, string> | null = null;

async function loadAll(): Promise<Record<string, string>> {
  if (BLOB_ON) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
      const b = blobs.find((x) => x.pathname === BLOB_KEY);
      if (b) {
        const res = await fetch(b.url, { cache: "no-store" });
        if (res.ok) return (mem = (await res.json()) as Record<string, string>);
      }
    } catch {
      /* fall through */
    }
    return mem ?? {};
  }
  try {
    if (fs.existsSync(FILE)) return (mem = JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, string>);
  } catch {
    /* unreadable */
  }
  return mem ?? {};
}

export async function getSecret(key: string): Promise<string | null> {
  if (TURSO_ON) {
    await ensureSchema();
    const r = await db().execute({ sql: "SELECT value FROM meta WHERE key = ?", args: [`secret:${key}`] });
    return r.rows[0] ? String(r.rows[0].value) : null;
  }
  return (await loadAll())[key] ?? null;
}

export async function setSecret(key: string, value: string): Promise<void> {
  if (TURSO_ON) {
    await ensureSchema();
    await db().execute({
      sql: "INSERT INTO meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
      args: [`secret:${key}`, value],
    });
    return;
  }
  const all = { ...(await loadAll()), [key]: value };
  mem = all;
  if (BLOB_ON) {
    await put(BLOB_KEY, JSON.stringify(all), { access: "public", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 0 });
    return;
  }
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(all, null, 2), { mode: 0o600 });
  } catch {
    /* read-only FS — memory only */
  }
}
