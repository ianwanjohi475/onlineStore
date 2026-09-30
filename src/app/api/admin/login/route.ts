import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, createSession } from "@/lib/admin/auth";
import { checkAdminPassword, credentialVersion } from "@/lib/admin/credentials";
import { clientIp, rateLimit, resetLimit, sameOrigin } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const WINDOW_MS = 15 * 60 * 1000;

/** POST /api/admin/login — sign in to the admin. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Please sign in from the admin page." }, { status: 403 });
  const key = `admin-login:${clientIp(req)}`;
  const limit = rateLimit(key, 8, WINDOW_MS);
  if (!limit.ok) {
    return NextResponse.json(
      { error: `Too many attempts. Please wait ${Math.ceil(limit.retryAfter / 60)} minutes and try again.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!(await checkAdminPassword(password ?? ""))) {
    return NextResponse.json({ error: "Incorrect password. Please try again." }, { status: 401 });
  }

  resetLimit(key);
  (await cookies()).set(ADMIN_COOKIE, await createSession(await credentialVersion()), adminCookieOptions);
  return NextResponse.json({ ok: true });
}

/** DELETE /api/admin/login — sign out. */
export async function DELETE() {
  (await cookies()).delete(ADMIN_COOKIE);
  return NextResponse.json({ ok: true });
}
