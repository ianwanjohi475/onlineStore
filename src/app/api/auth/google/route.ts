import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_CLIENT_ID, verifyGoogleCredential } from "@/lib/auth/google";
import { clientIp, rateLimit, resetLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { setUserCookie } from "@/lib/auth/session";
import { createUser, findUserByEmail, toPublic } from "@/lib/store/users";
import { logActivity } from "@/lib/store/activity";

export const runtime = "nodejs";

/**
 * POST /api/auth/google — sign in or sign up with a Google account.
 * Existing customer with the same (Google-verified) email → signed in.
 * New email → an account is created from the Google profile.
 */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!GOOGLE_CLIENT_ID) return NextResponse.json({ error: "Google sign-in isn't available yet." }, { status: 503 });
  if (!rateLimit(`google:${clientIp(req)}`, 30, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }

  const body = (await req.json().catch(() => null)) as { credential?: unknown } | null;
  const profile = await verifyGoogleCredential(String(body?.credential ?? ""));
  if (!profile) return NextResponse.json({ error: "Google sign-in failed. Please try again." }, { status: 401 });

  let user = await findUserByEmail(profile.email);
  let created = false;
  if (!user) {
    // Random, unusable password: this account signs in with Google (or sets a
    // password later through "Forgot password").
    user = await createUser({ name: profile.name.slice(0, 80), email: profile.email, phone: "", passwordHash: `google$${randomBytes(24).toString("hex")}` });
    if (!user) user = await findUserByEmail(profile.email); // created concurrently
    created = true;
  }
  if (!user) return NextResponse.json({ error: "Could not sign you in. Please try again." }, { status: 500 });

  resetLimit(`login:acct:${user.email}`);
  await logActivity("customer", created ? "success" : "info", created ? `New customer account via Google: ${user.name} (${user.email})` : `${user.name} signed in with Google`, { ref: user.email, req });
  await setUserCookie(user.id, user.sessionVersion);
  return NextResponse.json({ user: toPublic(user), created }, { status: created ? 201 : 200 });
}
