type RateLimitEntry = {
  count: number;
  resetTime: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
};

const RATE_LIMIT_MAX_REQUESTS = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;
const requestLog = new Map<string, RateLimitEntry>();

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of requestLog.entries()) {
    if (value.resetTime <= now) {
      requestLog.delete(key);
    }
  }
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const identifier = ip || "unknown";

  cleanupExpiredEntries(now);

  const currentEntry = requestLog.get(identifier);

  if (!currentEntry) {
    requestLog.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      success: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
    };
  }

  if (currentEntry.resetTime <= now) {
    requestLog.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });

    return {
      success: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
    };
  }

  if (currentEntry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      success: false,
      remaining: 0,
    };
  }

  currentEntry.count += 1;
  requestLog.set(identifier, currentEntry);

  return {
    success: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - currentEntry.count,
  };
}
