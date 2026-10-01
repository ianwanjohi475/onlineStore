import "server-only";
import { randomBytes } from "node:crypto";
import { TURSO_ON, db, ensureSchema } from "@/lib/db/turso";

/**
 * Uploaded images kept inside the Turso database — used when no Vercel Blob
 * store is connected, so photo and banner uploads still work with only a
 * database. Served from /media/<id>.<ext> with long-lived caching.
 */
export const MEDIA_DB_ON = TURSO_ON;
export const MAX_DB_MEDIA_BYTES = 3 * 1024 * 1024;

const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

export async function saveMedia(bytes: Buffer, type: string): Promise<string> {
  await ensureSchema();
  const id = randomBytes(12).toString("hex");
  await db().execute({
    sql: "INSERT INTO media (id, type, size, created_at, data) VALUES (?, ?, ?, ?, ?)",
    args: [id, type, bytes.length, new Date().toISOString(), new Uint8Array(bytes)],
  });
  return `/media/${id}.${EXT[type] ?? "bin"}`;
}

export async function readMedia(id: string): Promise<{ type: string; data: Uint8Array } | null> {
  if (!MEDIA_DB_ON || !/^[a-f0-9]{24}$/.test(id)) return null;
  await ensureSchema();
  const r = await db().execute({ sql: "SELECT type, data FROM media WHERE id = ?", args: [id] });
  const row = r.rows[0];
  if (!row) return null;
  const data = row.data as unknown;
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data instanceof Uint8Array ? data : null;
  return bytes ? { type: String(row.type), data: bytes } : null;
}
