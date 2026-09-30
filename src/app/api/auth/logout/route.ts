import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth/rate-limit";
import { clearUserCookie } from "@/lib/auth/session";

/** POST /api/auth/logout — end the session on this device. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await clearUserCookie();
  return NextResponse.json({ ok: true });
}
