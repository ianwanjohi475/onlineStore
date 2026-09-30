import "server-only";

/**
 * Small fixed-window rate limiter (per warm server instance). Blocks password
 * guessing and sign-up spam. Keys look like "login:ip:1.2.3.4".
 */
const buckets = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  b.n += 1;
  return b.n > max ? { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) } : { ok: true, retryAfter: 0 };
}

export function resetLimit(key: string) {
  buckets.delete(key);
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  return (xff ? xff.split(",")[0] : req.headers.get("x-real-ip"))?.trim() || "unknown";
}

/** Reject cross-site form posts (CSRF): if the browser sent an Origin, it must be ours. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // same-origin fetches from older browsers / server-to-server
  try {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
