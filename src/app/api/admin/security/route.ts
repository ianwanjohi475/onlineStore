import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, createSession } from "@/lib/admin/auth";
import { checkAdminPassword, credentialVersion, passwordSource, setAdminPassword } from "@/lib/admin/credentials";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { passwordProblem } from "@/lib/auth/password";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { logActivity } from "@/lib/store/activity";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAuthed())) return unauthorized();
  return NextResponse.json({ source: await passwordSource() });
}

/** PUT — change the admin password (signs out every other admin session). */
export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAuthed())) return unauthorized();
  if (!rateLimit(`admin-pw:${clientIp(req)}`, 5, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Please wait 15 minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => ({}))) as { currentPassword?: string; newPassword?: string };
  if (!(await checkAdminPassword(body.currentPassword ?? ""))) {
    return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 });
  }
  const issue = passwordProblem(body.newPassword);
  if (issue) return NextResponse.json({ error: issue }, { status: 400 });
  if (body.newPassword === "admin123") return NextResponse.json({ error: "Please choose a password other than the default." }, { status: 400 });

  await setAdminPassword(body.newPassword!);
  (await cookies()).set(ADMIN_COOKIE, await createSession(await credentialVersion()), adminCookieOptions);
  await logActivity("security", "success", "Admin password changed", { req });
  return NextResponse.json({ ok: true, source: "custom" });
}
