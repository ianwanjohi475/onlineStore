import "server-only";

/**
 * Transactional email via Resend (https://resend.com — free tier: 3,000 emails/month).
 * Set RESEND_API_KEY and RESEND_FROM (e.g. "SIR VERT <orders@yourdomain.com>").
 * Returns false when email isn't configured or sending failed.
 */
export const EMAIL_ON = !!process.env.RESEND_API_KEY;

export async function sendEmail(to: string, subject: string, html: string, text: string): Promise<boolean> {
  if (!EMAIL_ON) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "SIR VERT ENTERPRISE <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Base URL for links in emails: SITE_URL if set, else the request's own origin. */
export function siteUrl(req: Request) {
  return (process.env.SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function resetEmail(name: string, link: string) {
  const subject = "Reset your SIR VERT ENTERPRISE password";
  const text = `Hi ${name},\n\nUse this link to set a new password (valid for 30 minutes):\n${link}\n\nIf you didn't ask for this, you can ignore this email.\n\nSIR VERT ENTERPRISE`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#111">
  <h2 style="color:#0b57d0">Reset your password</h2>
  <p>Hi ${esc(name)},</p>
  <p>Tap the button below to set a new password. The link works for 30 minutes.</p>
  <p><a href="${esc(link)}" style="display:inline-block;background:#0b57d0;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Set a new password</a></p>
  <p style="color:#666;font-size:13px">If you didn't ask for this, ignore this email — your password stays the same.</p>
  <p style="color:#666;font-size:13px">SIR VERT ENTERPRISE · +254 799 239 739</p></div>`;
  return { subject, text, html };
}
