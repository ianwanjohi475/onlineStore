import { NextResponse } from "next/server";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { clientIp, rateLimit, resetLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { setUserCookie } from "@/lib/auth/session";
import { consumeResetToken, toPublic } from "@/lib/store/users";
import { logActivity } from "@/lib/store/activity";

export const runtime = "nodejs";

/** POST /api/auth/reset — set a new password using a one-time reset token. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!rateLimit(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const issue = passwordProblem(body?.password);
  if (issue) return NextResponse.json({ error: issue }, { status: 400 });

  const user = await consumeResetToken(String(body?.token ?? ""), await hashPassword(String(body?.password)));
  if (!user) return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });

  resetLimit(`login:acct:${user.email}`); // the owner proved access — lift any sign-in lock
  await setUserCookie(user.id, user.sessionVersion);
  await logActivity("customer", "info", `${user.email} set a new password with a reset link`, { ref: user.email, req });
  return NextResponse.json({ user: toPublic(user) });
}
