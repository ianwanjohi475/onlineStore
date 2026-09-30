import "server-only";
import { createHash } from "node:crypto";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getSecret, setSecret } from "@/lib/store/secrets";
import { constantTimeEqual } from "./auth";

/**
 * The admin password. Priority: the password set in Admin → Settings → Security
 * (stored as an scrypt hash) → the ADMIN_PASSWORD environment variable → the
 * default "admin123" (change it after your first sign-in).
 */
export const DEFAULT_ADMIN_PASSWORD = "admin123";
const KEY = "adminPasswordHash";

let cache: { hash: string | null; at: number } | null = null;

async function storedHash(): Promise<string | null> {
  if (cache && Date.now() - cache.at < 30_000) return cache.hash;
  const hash = await getSecret(KEY).catch(() => null);
  cache = { hash, at: Date.now() };
  return hash;
}

export async function passwordSource(): Promise<"custom" | "env" | "default"> {
  if (await storedHash()) return "custom";
  return process.env.ADMIN_PASSWORD ? "env" : "default";
}

/** Changes whenever the password changes → older sessions stop working. */
export async function credentialVersion(): Promise<string> {
  const basis = (await storedHash()) ?? `env:${process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD}`;
  return createHash("sha256").update(basis).digest("hex").slice(0, 12);
}

export async function checkAdminPassword(pw: string): Promise<boolean> {
  const input = String(pw ?? "").slice(0, 200);
  const hash = await storedHash();
  if (hash) return verifyPassword(input, hash);
  return constantTimeEqual(input, process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD);
}

export async function setAdminPassword(pw: string): Promise<void> {
  await setSecret(KEY, await hashPassword(pw));
  cache = null;
}
