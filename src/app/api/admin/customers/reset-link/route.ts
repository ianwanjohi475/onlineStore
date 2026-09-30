import { NextResponse } from "next/server";
import { isAuthed, unauthorized } from "@/lib/admin/guard";
import { siteUrl } from "@/lib/email/send";
import { createResetToken, findUserByEmail } from "@/lib/store/users";

export const runtime = "nodejs";

/** POST /api/admin/customers/reset-link — admin creates a one-time reset link
 *  to send a customer (e.g. on WhatsApp) when email isn't set up. */
export async function POST(req: Request) {
  if (!(await isAuthed())) return unauthorized();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(body?.email ?? "").trim().toLowerCase();
  const user = email ? await findUserByEmail(email) : null;
  if (!user) return NextResponse.json({ error: "No customer account uses that email." }, { status: 404 });
  const token = await createResetToken(user.id);
  return NextResponse.json({ link: `${siteUrl(req)}/account/reset?token=${token}`, name: user.name, phone: user.phone, expiresInMinutes: 30 });
}
