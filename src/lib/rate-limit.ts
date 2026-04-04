import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function createLimiter(redis: Redis, requests: number, windowSeconds: number) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds} s`),
    ephemeralCache: new Map(),
  });
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  /** Seconds until the window resets */
  reset: number;
}

async function check(
  limiter: Ratelimit,
  key: string,
): Promise<RateLimitResult> {
  const { success, remaining, reset } = await limiter.limit(key);
  return { success, remaining, reset: Math.ceil((reset - Date.now()) / 1000) };
}

export function getIp(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "127.0.0.1";
}

// Fail-open wrapper — if Redis isn't configured or throws, allow the request
async function safeCheck(
  fn: () => Promise<RateLimitResult>,
): Promise<RateLimitResult> {
  try {
    return await fn();
  } catch {
    return { success: true, remaining: -1, reset: 0 };
  }
}

/** 5 attempts per 15 minutes, keyed by IP + email */
export async function checkLoginRateLimit(
  ip: string,
  email: string,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { success: true, remaining: -1, reset: 0 };
  const limiter = createLimiter(redis, 5, 15 * 60);
  return safeCheck(() => check(limiter, `login:${ip}:${email.toLowerCase()}`));
}

/** 3 attempts per hour, keyed by IP */
export async function checkRegisterRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { success: true, remaining: -1, reset: 0 };
  const limiter = createLimiter(redis, 3, 60 * 60);
  return safeCheck(() => check(limiter, `register:${ip}`));
}

/** 3 attempts per hour, keyed by IP */
export async function checkForgotPasswordRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { success: true, remaining: -1, reset: 0 };
  const limiter = createLimiter(redis, 3, 60 * 60);
  return safeCheck(() => check(limiter, `forgot-password:${ip}`));
}

/** 5 attempts per 15 minutes, keyed by IP */
export async function checkResetPasswordRateLimit(
  ip: string,
): Promise<RateLimitResult> {
  const redis = getRedis();
  if (!redis) return { success: true, remaining: -1, reset: 0 };
  const limiter = createLimiter(redis, 5, 15 * 60);
  return safeCheck(() => check(limiter, `reset-password:${ip}`));
}

export function rateLimitResponse(resetSeconds: number): Response {
  const minutes = Math.max(1, Math.ceil(resetSeconds / 60));
  return new Response(
    JSON.stringify({
      error: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(resetSeconds),
      },
    },
  );
}
