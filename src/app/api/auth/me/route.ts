import { NextResponse } from "next/server";
import { hashPassword, passwordProblem, verifyPassword } from "@/lib/auth/password";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { setUserCookie } from "@/lib/auth/session";
import { currentUser, toPublic, updateUser } from "@/lib/store/users";

export const runtime = "nodejs";
const noStore = { "Cache-Control": "no-store" };

/** GET /api/auth/me — the signed-in customer (or null). */
export async function GET() {
  const user = await currentUser();
  return NextResponse.json({ user: user ? toPublic(user) : null }, { headers: noStore });
}

/** PATCH /api/auth/me — update name/phone, or change password (needs the current one). */
export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  if (body.newPassword !== undefined) {
    if (!rateLimit(`pwchange:${user.id}:${clientIp(req)}`, 5, 15 * 60 * 1000).ok) {
      return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes." }, { status: 429 });
    }
    if (!(await verifyPassword(String(body.currentPassword ?? ""), user.passwordHash))) {
      return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
    }
    const issue = passwordProblem(body.newPassword);
    if (issue) return NextResponse.json({ error: issue }, { status: 400 });
    // New hash + bumped version signs out every other device.
    const updated = await updateUser(user.id, { passwordHash: await hashPassword(String(body.newPassword)), sessionVersion: user.sessionVersion + 1 });
    if (updated) await setUserCookie(updated.id, updated.sessionVersion);
    return NextResponse.json({ user: updated ? toPublic(updated) : null });
  }

  const name = body.name !== undefined ? String(body.name).trim().slice(0, 80) : user.name;
  const phone = body.phone !== undefined ? String(body.phone).replace(/[^\d+ ]/g, "").trim().slice(0, 20) : user.phone;
  if (name.length < 2) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  const updated = await updateUser(user.id, { name, phone });
  return NextResponse.json({ user: updated ? toPublic(updated) : null });
}
