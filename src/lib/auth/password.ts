import "server-only";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, keylen: number, opts: { N: number; r: number; p: number; maxmem: number }) => Promise<Buffer>;

// scrypt is memory-hard, so stolen hashes are very expensive to brute-force.
const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;
const MAXMEM = 64 * 1024 * 1024;

/** Hash a password → "scrypt$N$r$p$salt$hash" (salt + hash base64). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password.normalize("NFKC"), salt, KEYLEN, { N, r: R, p: P, maxmem: MAXMEM });
  return ["scrypt", N, R, P, salt.toString("base64"), hash.toString("base64")].join("$");
}

/** Constant-time check of a password against a stored hash. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [alg, n, r, p, saltB64, hashB64] = stored.split("$");
    if (alg !== "scrypt") return false;
    const expected = Buffer.from(hashB64, "base64");
    const actual = await scrypt(password.normalize("NFKC"), Buffer.from(saltB64, "base64"), expected.length, {
      N: Number(n), r: Number(r), p: Number(p), maxmem: MAXMEM,
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** A real hash to compare against when the email doesn't exist, so a login for
 *  an unknown email takes as long as a wrong password (no account probing by timing). */
let dummy: Promise<string> | null = null;
export function dummyHash() {
  dummy ??= hashPassword(randomBytes(12).toString("hex"));
  return dummy;
}

/** Password rules: 8–128 chars with at least one letter and one number. */
export function passwordProblem(pw: unknown): string | null {
  if (typeof pw !== "string" || pw.length < 8) return "Password must be at least 8 characters.";
  if (pw.length > 128) return "Password is too long.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Use at least one letter and one number.";
  return null;
}
