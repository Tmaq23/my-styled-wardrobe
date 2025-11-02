type RateLimitRecord = {
  count: number;
  expiresAt: number;
};

type RateLimitStore = Map<string, RateLimitRecord>;

interface RateLimitConfig {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
  resetAt: number;
}

const globalStore = globalThis as unknown as {
  __rateLimitStore?: RateLimitStore;
};

const store: RateLimitStore = globalStore.__rateLimitStore ?? new Map();

if (!globalStore.__rateLimitStore) {
  globalStore.__rateLimitStore = store;
}

export function consumeRateLimit({ key, limit, windowMs }: RateLimitConfig): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  if (!record || record.expiresAt <= now) {
    const expiresAt = now + windowMs;
    store.set(key, { count: 1, expiresAt });

    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: expiresAt,
    };
  }

  if (record.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((record.expiresAt - now) / 1000),
      resetAt: record.expiresAt,
    };
  }

  record.count += 1;
  store.set(key, record);

  return {
    allowed: true,
    remaining: Math.max(0, limit - record.count),
    resetAt: record.expiresAt,
  };
}


