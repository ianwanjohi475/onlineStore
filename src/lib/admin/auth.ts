/**
 * Admin sessions.
 *
 * The cookie holds "issuedAt.expiresAt.version.signature" (HMAC-SHA256), so it
 * can't be guessed or forged without the server secret. Sessions end after
 * 15 minutes without activity (sliding expiry) and never last more than 12
 * hours. `version` changes whenever the admin password changes, which signs
 * out every other device. Uses Web Crypto so it runs in the proxy and in
 * route handlers alike.
 */

export const ADMIN_COOKIE = "sv_admin";
export const IDLE_MS = 15 * 60 * 1000;
export const MAX_SESSION_MS = 12 * 60 * 60 * 1000;

// Never a value from the public source code on the live site: a configured
// secret, else a server-only platform token/ID.
const SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.AUTH_SECRET ||
  process.env.ADMIN_PASSWORD ||
  process.env.TURSO_AUTH_TOKEN ||
  process.env.BLOB_READ_WRITE_TOKEN ||
  (process.env.VERCEL_PROJECT_ID ? `vercel:${process.env.VERCEL_PROJECT_ID}:${process.env.VERCEL_GIT_REPO_ID ?? ""}` : "sirvert-local-dev-only");

const encoder = new TextEncoder();
let keyPromise: Promise<CryptoKey> | null = null;

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Length-safe, constant-time string comparison (mitigates timing attacks). */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

async function sign(payload: string): Promise<string> {
  keyPromise ??= crypto.subtle.importKey("raw", encoder.encode(`admin:${SESSION_SECRET}`), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", await keyPromise, encoder.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

/** New session token (or a refreshed one keeping the original `issuedAt`). */
export async function createSession(version: string, issuedAt = Date.now()): Promise<string> {
  const payload = `${issuedAt}.${Date.now() + IDLE_MS}.${version}`;
  return `${payload}.${await sign(payload)}`;
}

export interface AdminSession {
  issuedAt: number;
  expiresAt: number;
  version: string;
}

/** Signature valid, not idle-expired, within the absolute limit. */
export async function readSession(token?: string | null): Promise<AdminSession | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [iat, exp, version, sig] = parts;
  if (!constantTimeEqual(sig, await sign(`${iat}.${exp}.${version}`))) return null;
  const issuedAt = Number(iat);
  const expiresAt = Number(exp);
  const now = Date.now();
  if (!Number.isFinite(expiresAt) || expiresAt <= now) return null;
  if (!Number.isFinite(issuedAt) || now - issuedAt > MAX_SESSION_MS) return null;
  return { issuedAt, expiresAt, version };
}

export async function verifySession(token?: string | null): Promise<boolean> {
  return (await readSession(token)) !== null;
}

export const adminCookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  path: "/",
  secure: process.env.VERCEL === "1" || (process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1"),
  maxAge: MAX_SESSION_MS / 1000,
};
