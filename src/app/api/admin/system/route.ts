import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { TURSO_ON, db, ensureSchema } from "@/lib/db/turso";
import { EMAIL_ON } from "@/lib/email/send";
import { GOOGLE_CLIENT_ID } from "@/lib/auth/google";

export const runtime = "nodejs";

/** GET — where the store's data lives and whether it's reachable (admin only). */
export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  const storage: "turso" | "blob" | "temporary" = TURSO_ON ? "turso" : process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "temporary";
  let ok = true;
  let error = "";
  if (TURSO_ON) {
    try {
      await ensureSchema();
      await db().execute("SELECT 1");
    } catch (e) {
      ok = false;
      error = e instanceof Error ? e.message.replace(/\b(eyJ[\w-]+\.[\w-]+\.[\w-]+)\b/g, "[token]").slice(0, 200) : "Connection failed";
    }
  }
  return NextResponse.json(
    { storage, ok, error, email: EMAIL_ON, google: !!GOOGLE_CLIENT_ID, host: TURSO_ON ? (process.env.TURSO_DATABASE_URL!.startsWith("file:") ? "local file" : new URL(process.env.TURSO_DATABASE_URL!.replace(/^libsql:/, "https:")).hostname) : null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
