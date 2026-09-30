import { NextResponse } from "next/server";
import { hashPassword, passwordProblem } from "@/lib/auth/password";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { setUserCookie } from "@/lib/auth/session";
import { createUser, toPublic } from "@/lib/store/users";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

/** POST /api/auth/signup — create a customer account and sign in. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const limit = rateLimit(`signup:${clientIp(req)}`, 20, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many sign-ups from this connection. Try again later." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const name = String(body?.name ?? "").trim().slice(0, 80);
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
  const phone = String(body?.phone ?? "").replace(/[^\d+ ]/g, "").trim().slice(0, 20);
  const password = body?.password;

  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  const pwIssue = passwordProblem(password);
  if (pwIssue) return NextResponse.json({ error: pwIssue }, { status: 400 });

  const user = await createUser({ name, email, phone, passwordHash: await hashPassword(password as string) });
  if (!user) return NextResponse.json({ error: "An account with this email already exists. Please sign in." }, { status: 409 });

  await setUserCookie(user.id, user.sessionVersion);
  return NextResponse.json({ user: toPublic(user) }, { status: 201 });
}
