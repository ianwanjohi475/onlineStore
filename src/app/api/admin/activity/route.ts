import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { listActivity } from "@/lib/store/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/admin/activity?kind=&q=&before=&limit= — the store's activity log (admin only). */
export async function GET(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const u = new URL(req.url);
  const items = await listActivity({
    kind: u.searchParams.get("kind") ?? undefined,
    q: u.searchParams.get("q") ?? undefined,
    before: Number(u.searchParams.get("before")) || undefined,
    limit: Number(u.searchParams.get("limit")) || 50,
  }).catch(() => []);
  return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
}
