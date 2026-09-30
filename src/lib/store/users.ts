import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { list, put } from "@vercel/blob";
import { TURSO_ON, db, ensureSchema } from "@/lib/db/turso";
import { USER_COOKIE, readUserToken } from "@/lib/auth/session";
import { cookies } from "next/headers";

/**
 * Customer accounts. Stored in the `users` table on Turso (recommended), or in
 * a private-path blob / local file as a fallback. Password hashes never leave
 * this module — callers get a `PublicUser`.
 */
export interface UserRecord {
  id: string;
  email: string;
  name: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
  sessionVersion: number;
  /** fallback storage only (Turso uses the password_resets table) */
  resetHash?: string;
  resetExpires?: number;
}

export type PublicUser = Pick<UserRecord, "id" | "email" | "name" | "phone" | "createdAt">;

export function toPublic(u: UserRecord): PublicUser {
  return { id: u.id, email: u.email, name: u.name, phone: u.phone, createdAt: u.createdAt };
}

export const normEmail = (e: string) => e.trim().toLowerCase();

/* ── Turso ─────────────────────────────────────────────────── */
function rowToUser(r: Record<string, unknown>): UserRecord {
  return {
    id: String(r.id),
    email: String(r.email),
    name: String(r.name ?? ""),
    phone: String(r.phone ?? ""),
    passwordHash: String(r.password_hash),
    createdAt: String(r.created_at),
    sessionVersion: Number(r.session_version ?? 1),
  };
}

/* ── Blob / file fallback (whole list in one JSON document) ─ */
const BLOB_ON = !!process.env.BLOB_READ_WRITE_TOKEN;
// Unguessable path derived from the secret token, so the file can't be found by URL.
const BLOB_KEY = `private/users-${createHash("sha256").update(`users:${process.env.BLOB_READ_WRITE_TOKEN ?? ""}`).digest("hex").slice(0, 40)}.json`;
const FILE = path.join(process.cwd(), "data", "users.json");
let memUsers: UserRecord[] | null = null;

async function loadAll(): Promise<UserRecord[]> {
  if (BLOB_ON) {
    try {
      const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 });
      const b = blobs.find((x) => x.pathname === BLOB_KEY);
      if (b) {
        const res = await fetch(b.url, { cache: "no-store" });
        if (res.ok) return (memUsers = (await res.json()) as UserRecord[]);
      }
      return memUsers ?? [];
    } catch {
      return memUsers ?? [];
    }
  }
  try {
    if (fs.existsSync(FILE)) return (memUsers = JSON.parse(fs.readFileSync(FILE, "utf8")) as UserRecord[]);
  } catch {
    /* unreadable — fall back to memory */
  }
  return memUsers ?? [];
}

async function saveAll(users: UserRecord[]) {
  memUsers = users;
  if (BLOB_ON) {
    await put(BLOB_KEY, JSON.stringify(users), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    return;
  }
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(users, null, 2), { mode: 0o600 });
  } catch {
    /* read-only FS — memory only */
  }
}

/* ── Public API ────────────────────────────────────────────── */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const e = normEmail(email);
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({ sql: "SELECT * FROM users WHERE email = ? LIMIT 1", args: [e] });
    return res.rows[0] ? rowToUser(res.rows[0] as unknown as Record<string, unknown>) : null;
  }
  return (await loadAll()).find((u) => u.email === e) ?? null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({ sql: "SELECT * FROM users WHERE id = ? LIMIT 1", args: [id] });
    return res.rows[0] ? rowToUser(res.rows[0] as unknown as Record<string, unknown>) : null;
  }
  return (await loadAll()).find((u) => u.id === id) ?? null;
}

/** Create an account. Returns null if the email is already registered. */
export async function createUser(input: { email: string; name: string; phone: string; passwordHash: string }): Promise<UserRecord | null> {
  const user: UserRecord = {
    id: randomUUID(),
    email: normEmail(input.email),
    name: input.name,
    phone: input.phone,
    passwordHash: input.passwordHash,
    createdAt: new Date().toISOString(),
    sessionVersion: 1,
  };
  if (TURSO_ON) {
    await ensureSchema();
    try {
      await db().execute({
        sql: "INSERT INTO users (id, email, name, phone, password_hash, created_at, session_version) VALUES (?,?,?,?,?,?,?)",
        args: [user.id, user.email, user.name, user.phone, user.passwordHash, user.createdAt, 1],
      });
    } catch (e) {
      if (String(e).includes("UNIQUE")) return null;
      throw e;
    }
    return user;
  }
  const all = await loadAll();
  if (all.some((u) => u.email === user.email)) return null;
  await saveAll([...all, user]);
  return user;
}

export async function updateUser(id: string, patch: Partial<Pick<UserRecord, "name" | "phone" | "passwordHash" | "sessionVersion">>): Promise<UserRecord | null> {
  const current = await findUserById(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  if (TURSO_ON) {
    await db().execute({
      sql: "UPDATE users SET name = ?, phone = ?, password_hash = ?, session_version = ? WHERE id = ?",
      args: [next.name, next.phone, next.passwordHash, next.sessionVersion, id],
    });
    return next;
  }
  const all = await loadAll();
  await saveAll(all.map((u) => (u.id === id ? next : u)));
  return next;
}

/** The signed-in customer for this request, or null. */
export async function currentUser(): Promise<UserRecord | null> {
  const token = readUserToken((await cookies()).get(USER_COOKIE)?.value);
  if (!token) return null;
  const user = await findUserById(token.userId);
  if (!user || user.sessionVersion !== token.version) return null;
  return user;
}

/* ── Password reset tokens ─────────────────────────────────── */
const RESET_TTL_MS = 30 * 60 * 1000;
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

/** Create a one-time reset token (valid 30 min). Only its hash is stored. */
export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  const hash = sha256(token);
  const expires = Date.now() + RESET_TTL_MS;
  if (TURSO_ON) {
    await ensureSchema();
    await db().batch(
      [
        { sql: "DELETE FROM password_resets WHERE user_id = ? OR expires_at < ?", args: [userId, Date.now()] },
        { sql: "INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?,?,?)", args: [hash, userId, expires] },
      ],
      "write",
    );
    return token;
  }
  const all = await loadAll();
  await saveAll(all.map((u) => (u.id === userId ? { ...u, resetHash: hash, resetExpires: expires } : u)));
  return token;
}

/** Use a reset token: sets the new password, signs out every device, and
 *  burns the token. Returns the updated user, or null if invalid/expired. */
export async function consumeResetToken(token: string, passwordHash: string): Promise<UserRecord | null> {
  if (!token || token.length > 200) return null;
  const hash = sha256(token);
  let userId: string | null = null;
  if (TURSO_ON) {
    await ensureSchema();
    const res = await db().execute({ sql: "SELECT user_id, expires_at FROM password_resets WHERE token_hash = ?", args: [hash] });
    const row = res.rows[0];
    if (!row || Number(row.expires_at) < Date.now()) return null;
    userId = String(row.user_id);
    await db().execute({ sql: "DELETE FROM password_resets WHERE user_id = ?", args: [userId] });
  } else {
    const all = await loadAll();
    const u = all.find((x) => x.resetHash === hash);
    if (!u || !u.resetExpires || u.resetExpires < Date.now()) return null;
    userId = u.id;
    await saveAll(all.map((x) => (x.id === u.id ? { ...x, resetHash: undefined, resetExpires: undefined } : x)));
  }
  const user = await findUserById(userId);
  if (!user) return null;
  return updateUser(user.id, { passwordHash, sessionVersion: user.sessionVersion + 1 });
}
