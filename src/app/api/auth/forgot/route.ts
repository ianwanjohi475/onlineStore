import { NextResponse } from "next/server";
import { clientIp, rateLimit, sameOrigin } from "@/lib/auth/rate-limit";
import { EMAIL_ON, resetEmail, sendEmail, siteUrl } from "@/lib/email/send";
import { createResetToken, findUserByEmail } from "@/lib/store/users";
import { logActivity } from "@/lib/store/activity";

export const runtime = "nodejs";

/** POST /api/auth/forgot — email a one-time password reset link.
 *  Always answers the same way, so it can't be used to check who has an account. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const email = String(body?.email ?? "").trim().toLowerCase().slice(0, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  const byIp = rateLimit(`forgot:ip:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const byEmail = rateLimit(`forgot:email:${email}`, 3, 60 * 60 * 1000);
  const generic = {
    ok: true,
    emailEnabled: EMAIL_ON,
    message: EMAIL_ON
      ? "If an account exists for that email, we've sent a reset link. Check your inbox (and spam)."
      : "If an account exists for that email, our team can send you a reset link — chat with us on WhatsApp.",
  };
  if (!byIp.ok) return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  if (!byEmail.ok) return NextResponse.json(generic);

  const user = await findUserByEmail(email);
  if (user) await logActivity("customer", "info", `Password reset requested by ${user.email}`, { ref: user.email, req });
  if (user && EMAIL_ON) {
    const token = await createResetToken(user.id);
    const mail = resetEmail(user.name.split(" ")[0] || "there", `${siteUrl(req)}/account/reset?token=${token}`);
    await sendEmail(user.email, mail.subject, mail.html, mail.text);
  }
  return NextResponse.json(generic);
}
