/**
 * Admin authentication.
 *
 * The session cookie is an HMAC-signed, expiring token — NOT a static string —
 * so it can't be guessed or forged without the server secret. The secret is
 * ADMIN_SESSION_SECRET (or ADMIN_PASSWORD) from the environment; set a strong
 * ADMIN_PASSWORD in production. Everything here uses Web Crypto so it runs in
 * both the Edge middleware and Node route handlers.
 */

export const ADMIN_COOKIE = "sv_admin";

const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "sirvert-dev-secret-change-me";

const encoder = new TextEncoder();

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Length-safe, constant-time string comparison (mitigates timing attacks). */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

/** Create a signed session token that expires after `ttlMs`. */
export async function createSession(ttlMs = 7 * 24 * 60 * 60 * 1000): Promise<string> {
  const exp = String(Date.now() + ttlMs);
  return `${exp}.${await sign(exp)}`;
}

/** Verify a session token: correct signature AND not expired. */
export async function verifySession(token?: string | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!constantTimeEqual(sig, await sign(exp))) return false;
  const expMs = Number(exp);
  return Number.isFinite(expMs) && expMs > Date.now();
}

/** Constant-time password check against ADMIN_PASSWORD (default "admin123"). */
export function checkPassword(pw: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return constantTimeEqual(String(pw ?? ""), expected);
}
