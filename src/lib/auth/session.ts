import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Customer sessions: an httpOnly cookie holding "userId.version.expiry.signature"
 * (HMAC-SHA256). It can't be forged without the server secret, expires after 30
 * days, and is invalidated everywhere when the password changes (version bump).
 */
export const USER_COOKIE = "sv_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Never fall back to a value that's in the public source code: use a configured
// secret, else a server-only token, else a random per-server key (sessions then
// just need a fresh sign-in after a redeploy — safe, never forgeable).
const SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  process.env.TURSO_AUTH_TOKEN ||
  process.env.BLOB_READ_WRITE_TOKEN ||
  (process.env.VERCEL === "1" ? randomBytes(32).toString("hex") : "sirvert-local-dev-only");

function sign(payload: string) {
  return createHmac("sha256", `customer:${SECRET}`).update(payload).digest("base64url");
}

export function createUserToken(userId: string, version: number): string {
  const payload = `${userId}.${version}.${Date.now() + TTL_MS}`;
  return `${payload}.${sign(payload)}`;
}

export function readUserToken(token?: string | null): { userId: string; version: number } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, version, exp, sig] = parts;
  const expected = Buffer.from(sign(`${userId}.${version}.${exp}`));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  if (!(Number(exp) > Date.now())) return null;
  return { userId, version: Number(version) };
}

export async function setUserCookie(userId: string, version: number) {
  (await cookies()).set(USER_COOKIE, createUserToken(userId, version), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production" && process.env.COOKIE_INSECURE !== "1",
    path: "/",
    maxAge: TTL_MS / 1000,
  });
}

export async function clearUserCookie() {
  (await cookies()).delete(USER_COOKIE);
}
