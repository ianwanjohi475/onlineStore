import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Customer sessions: an httpOnly cookie holding "userId.version.expiry.signature"
 * (HMAC-SHA256). It can't be forged without the server secret, expires after 30
 * days, and is invalidated everywhere when the password changes (version bump).
 */
export const USER_COOKIE = "sv_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

// Never a value from the public source code on the live site: a configured
// secret, else a server-only token / platform project ID (stable across all
// server instances, unknown to outsiders).
const SECRET =
  process.env.AUTH_SECRET ||
  process.env.ADMIN_SESSION_SECRET ||
  process.env.ADMIN_PASSWORD ||
  process.env.TURSO_AUTH_TOKEN ||
  process.env.BLOB_READ_WRITE_TOKEN ||
  (process.env.VERCEL_PROJECT_ID ? `vercel:${process.env.VERCEL_PROJECT_ID}:${process.env.VERCEL_GIT_REPO_ID ?? ""}` : "sirvert-local-dev-only");

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
