/**
 * Lightweight in-memory rate limiter.
 * For multi-instance production, swap for Redis/Upstash.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + opts.windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: opts.limit - 1, resetAt };
  }
  if (existing.count >= opts.limit) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return {
    ok: true,
    remaining: opts.limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function clientKey(req: Request, suffix: string) {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = fwd || req.headers.get("x-real-ip") || "local";
  return `${suffix}:${ip}`;
}
