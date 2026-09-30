import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, IDLE_MS, adminCookieOptions, createSession, readSession } from "@/lib/admin/auth";
import { credentialVersion, passwordSource } from "@/lib/admin/credentials";

export const runtime = "nodejs";

async function current() {
  const s = await readSession((await cookies()).get(ADMIN_COOKIE)?.value);
  return s && s.version === (await credentialVersion()) ? s : null;
}

/** GET — session status (used by the admin's idle timer). */
export async function GET() {
  const s = await current();
  if (!s) return NextResponse.json({ active: false }, { status: 401 });
  return NextResponse.json({ active: true, expiresAt: s.expiresAt, idleMinutes: IDLE_MS / 60000, defaultPassword: (await passwordSource()) === "default" });
}

/** POST — the admin is active: extend the session by another 15 minutes. */
export async function POST() {
  const s = await current();
  if (!s) return NextResponse.json({ active: false }, { status: 401 });
  const token = await createSession(s.version, s.issuedAt);
  (await cookies()).set(ADMIN_COOKIE, token, adminCookieOptions);
  return NextResponse.json({ active: true, expiresAt: Date.now() + IDLE_MS });
}
