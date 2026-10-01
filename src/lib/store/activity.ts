import "server-only";
import { TURSO_ON, db, ensureSchema } from "@/lib/db/turso";
import { clientIp } from "@/lib/auth/rate-limit";

/**
 * Store activity log — everything that happens, newest first, for the admin
 * dashboard: new accounts, sign-ins, orders, payments, M-Pesa prompts and
 * results, admin changes and security events. Never stores passwords, tokens
 * or keys. Logging can never break the request that triggered it.
 */
export type ActivityKind = "order" | "payment" | "mpesa" | "customer" | "security" | "admin";
export type ActivityLevel = "info" | "success" | "warning" | "error";

export interface Activity {
  id: number;
  at: string;
  kind: ActivityKind;
  level: ActivityLevel;
  message: string;
  ref: string | null;
  ip: string | null;
}

export const ACTIVITY_KINDS: ActivityKind[] = ["order", "payment", "mpesa", "customer", "security", "admin"];
const KEEP = 5000;

const g = globalThis as unknown as { __svActivity?: Activity[]; __svActivitySeq?: number };
const mem = () => (g.__svActivity ??= []);

export async function logActivity(
  kind: ActivityKind,
  level: ActivityLevel,
  message: string,
  opts: { ref?: string | null; req?: Request } = {},
): Promise<void> {
  const entry = {
    at: new Date().toISOString(),
    kind,
    level,
    message: message.slice(0, 500),
    ref: opts.ref ? String(opts.ref).slice(0, 120) : null,
    ip: opts.req ? clientIp(opts.req).slice(0, 64) : null,
  };
  try {
    if (TURSO_ON) {
      await ensureSchema();
      const r = await db().execute({
        sql: "INSERT INTO activity (at, kind, level, message, ref, ip) VALUES (?, ?, ?, ?, ?, ?)",
        args: [entry.at, entry.kind, entry.level, entry.message, entry.ref, entry.ip],
      });
      const id = Number(r.lastInsertRowid ?? 0);
      if (id % 100 === 0) await db().execute({ sql: "DELETE FROM activity WHERE id <= ?", args: [id - KEEP] });
      return;
    }
    const list = mem();
    g.__svActivitySeq = (g.__svActivitySeq ?? 0) + 1;
    list.unshift({ id: g.__svActivitySeq, ...entry });
    if (list.length > 1000) list.length = 1000;
  } catch (e) {
    console.error("[activity] could not log:", e instanceof Error ? e.message : e);
  }
}

export async function listActivity(opts: { kind?: string; q?: string; before?: number; limit?: number } = {}): Promise<Activity[]> {
  const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
  const kind = ACTIVITY_KINDS.includes(opts.kind as ActivityKind) ? (opts.kind as ActivityKind) : null;
  const q = (opts.q ?? "").trim().slice(0, 80).toLowerCase();
  if (TURSO_ON) {
    await ensureSchema();
    const where: string[] = [];
    const args: (string | number)[] = [];
    if (kind) { where.push("kind = ?"); args.push(kind); }
    if (opts.before) { where.push("id < ?"); args.push(opts.before); }
    if (q) { where.push("(lower(message) LIKE ? ESCAPE '\\' OR lower(ref) LIKE ? ESCAPE '\\')"); const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`; args.push(like, like); }
    const r = await db().execute({
      sql: `SELECT id, at, kind, level, message, ref, ip FROM activity ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY id DESC LIMIT ?`,
      args: [...args, limit],
    });
    return r.rows.map((x) => ({
      id: Number(x.id), at: String(x.at), kind: String(x.kind) as ActivityKind, level: String(x.level) as ActivityLevel,
      message: String(x.message), ref: x.ref == null ? null : String(x.ref), ip: x.ip == null ? null : String(x.ip),
    }));
  }
  return mem()
    .filter((a) => (!kind || a.kind === kind) && (!opts.before || a.id < opts.before) && (!q || a.message.toLowerCase().includes(q) || (a.ref ?? "").toLowerCase().includes(q)))
    .slice(0, limit);
}
