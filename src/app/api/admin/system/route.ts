import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { TURSO_CONFIG, TURSO_ON, db, ensureSchema, explainDbError } from "@/lib/db/turso";
import { EMAIL_ON } from "@/lib/email/send";
import { GOOGLE_CLIENT_ID } from "@/lib/auth/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — where the store's data lives and whether it's reachable (admin only).
 *  Reports variable NAMES only — never their values. */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  const storage: "turso" | "blob" | "temporary" = TURSO_ON ? "turso" : process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "temporary";
  let ok = true;
  let error = TURSO_ON ? "" : TURSO_CONFIG.problem;
  let host: string | null = null;
  if (TURSO_ON) {
    try {
      host = TURSO_CONFIG.url.startsWith("file:") ? "local file" : new URL(TURSO_CONFIG.url.replace(/^libsql:/, "https:")).hostname;
      if (TURSO_CONFIG.problem) throw new Error(TURSO_CONFIG.problem);
      await ensureSchema();
      await db().execute("SELECT 1");
      // Prove the token can write too (a read-only token would lose every order).
      await db().execute({
        sql: "INSERT INTO meta (key, value) VALUES ('healthcheck', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        args: [new Date().toISOString()],
      });
    } catch (e) {
      ok = false;
      error = e instanceof Error && e.message === TURSO_CONFIG.problem ? e.message : explainDbError(e);
      console.error("[system] Turso check failed:", e instanceof Error ? e.message.replace(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[token]") : e);
    }
  }
  return NextResponse.json(
    {
      storage,
      ok,
      error,
      email: EMAIL_ON,
      google: !!GOOGLE_CLIENT_ID,
      host,
      urlVar: TURSO_CONFIG.urlKey,
      tokenVar: TURSO_CONFIG.tokenKey,
      deployment: process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "production" ? "production" : "development"),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
