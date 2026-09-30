import { NextResponse } from "next/server";
import { dummyHash, verifyPassword } from "@/lib/auth/password";
import { clientIp, rateLimit, resetLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { setUserCookie } from "@/lib/auth/session";
import { findUserByEmail, toPublic } from "@/lib/store/users";

export const runtime = "nodejs";

const WINDOW = 15 * 60 * 1000;

/** POST /api/auth/login — sign in with email + password. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
  const password = String(body?.password ?? "").slice(0, 128);

  // Limit guesses per connection AND per account (stops distributed guessing on one account).
  const ipKey = `login:ip:${clientIp(req)}`;
  const acctKey = `login:acct:${email}`;
  const byIp = rateLimit(ipKey, 60, WINDOW);
  const byAcct = rateLimit(acctKey, 8, WINDOW);
  if (!byIp.ok || !byAcct.ok) {
    const retry = Math.max(byIp.retryAfter, byAcct.retryAfter);
    return NextResponse.json({ error: "Too many sign-in attempts. Please wait 15 minutes." }, { status: 429, headers: { "Retry-After": String(retry) } });
  }

  const user = email ? await findUserByEmail(email) : null;
  // Always run a hash check so unknown emails take the same time as wrong passwords.
  const ok = user ? await verifyPassword(password, user.passwordHash) : (await verifyPassword(password, await dummyHash()), false);
  if (!user || !ok) return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });

  resetLimit(acctKey);
  await setUserCookie(user.id, user.sessionVersion);
  return NextResponse.json({ user: toPublic(user) });
}
