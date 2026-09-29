import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createSession } from "@/lib/admin/auth";

export const runtime = "nodejs";

/** Best-effort in-memory brute-force limiter (per IP, per warm instance). */
const attempts = new Map<string, { n: number; until: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && rec.until > now && rec.n >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  if (!checkPassword(password ?? "")) {
    if (!rec || rec.until < now) attempts.set(ip, { n: 1, until: now + WINDOW_MS });
    else rec.n += 1;
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  attempts.delete(ip);
  (await cookies()).set(ADMIN_COOKIE, await createSession(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
