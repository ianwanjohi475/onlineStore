import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { TURSO_CONFIG, TURSO_ON, db, ensureSchema, explainDbError } from "@/lib/db/turso";
import { EMAIL_ON } from "@/lib/email/send";
import { GOOGLE_CLIENT_ID } from "@/lib/auth/google";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET — simple on/off status of the store's connections (admin only).
 *  Details of any failure go to the server logs, never to the browser. */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  let database = false;
  if (TURSO_ON) {
    try {
      if (TURSO_CONFIG.problem) throw new Error(TURSO_CONFIG.problem);
      await ensureSchema();
      // a write proves the connection is fully usable (not read-only)
      await db().execute({
        sql: "INSERT INTO meta (key, value) VALUES ('healthcheck', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        args: [new Date().toISOString()],
      });
      database = true;
    } catch (e) {
      console.error("[system] database check failed:", e instanceof Error && e.message === TURSO_CONFIG.problem ? e.message : explainDbError(e));
    }
  } else {
    console.warn("[system] database not configured", TURSO_CONFIG.problem || "(no database variables found)");
  }
  return NextResponse.json({ database, google: !!GOOGLE_CLIENT_ID, email: EMAIL_ON }, { headers: { "Cache-Control": "no-store" } });
}
