import { NextResponse } from "next/server";

/* ------------------------------------------------------------------ */
/*  In-memory rate limiter (per-instance, no Redis needed)             */
/* ------------------------------------------------------------------ */

interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();

// Periodically prune expired entries to prevent memory leak
const PRUNE_INTERVAL = 60_000; // every 60s
if (typeof globalThis !== "undefined" && !(globalThis as Record<string, unknown>).__rateLimitPruner) {
  (globalThis as Record<string, unknown>).__rateLimitPruner = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key);
    }
  }, PRUNE_INTERVAL);
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

/**
 * Check rate limit for a given request.
 * Returns `null` if allowed, or a 429 NextResponse if rate-limited.
 */
export function rateLimit(req: Request, config: RateLimitConfig): NextResponse | null {
  const ip = getClientIp(req);
  const now = Date.now();
  const key = `${ip}:${config.maxRequests}:${config.windowMs}`;

  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    // Start a fresh window
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    return NextResponse.json(
      { error: config.message || "Terlalu banyak percobaan, coba lagi nanti." },
      { status: 429 }
    );
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Pre-configured limiters for common endpoints                       */
/* ------------------------------------------------------------------ */

export const rateLimitSignIn = (req: Request) =>
  rateLimit(req, { maxRequests: 5, windowMs: 5 * 60_000 }); // 5 per 5 min

export const rateLimitSignUp = (req: Request) =>
  rateLimit(req, { maxRequests: 3, windowMs: 10 * 60_000 }); // 3 per 10 min

export const rateLimitForgotPassword = (req: Request) =>
  rateLimit(req, { maxRequests: 3, windowMs: 10 * 60_000 }); // 3 per 10 min

export const rateLimitCheckSlug = (req: Request) =>
  rateLimit(req, { maxRequests: 20, windowMs: 60_000 }); // 20 per 1 min
