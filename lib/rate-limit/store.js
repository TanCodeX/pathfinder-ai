export const DEFAULT_BUCKET_TTL_MS = 10 * 60 * 1000;
const DEFAULT_REDIS_PREFIX = "pathfinder:rate-limit";
const redisClientCache = new Map();

function normalizeBucket(bucket) {
  const tokens = Number(bucket.tokens);
  const lastRefillAt = Number(bucket.lastRefillAt);
  const limitPerMinute = Number(bucket.limitPerMinute);
  const burstCapacity = Number(bucket.burstCapacity);

  return {
    tokens: Number.isFinite(tokens) ? tokens : 0,
    lastRefillAt: Number.isFinite(lastRefillAt) ? lastRefillAt : Date.now(),
    limitPerMinute: Number.isFinite(limitPerMinute) ? limitPerMinute : 0,
    burstCapacity: Number.isFinite(burstCapacity) ? burstCapacity : 0,
  };
}

function getRedisKey(prefix, bucketKey) {
  return `${prefix}:${bucketKey}`;
}

function getMemoryStoreExpiration(bucket, bucketTtlMs, now) {
  return now - bucket.lastRefillAt > bucketTtlMs;
}

async function getRedisClient(redisUrl) {
  let clientPromise = redisClientCache.get(redisUrl);

  if (!clientPromise) {
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl });

    client.on("error", (error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[rate-limit] Redis client error", error);
      }
    });

    clientPromise = client.connect().then(() => client);
    redisClientCache.set(redisUrl, clientPromise);
  }

  try {
    return await clientPromise;
  } catch (error) {
    redisClientCache.delete(redisUrl);
    throw error;
  }
}

export function createMemoryRateLimitStore({
  bucketTtlMs = DEFAULT_BUCKET_TTL_MS,
  cleanupIntervalMs = 5 * 60 * 1000,
} = {}) {
  const buckets = new Map();
  const locks = new Map();
  let interval = null;

  if (cleanupIntervalMs > 0) {
    interval = setInterval(() => {
      const now = Date.now();
      for (const [bucketKey, bucket] of buckets.entries()) {
        if (getMemoryStoreExpiration(bucket, bucketTtlMs, now)) {
          buckets.delete(bucketKey);
        }
      }
    }, cleanupIntervalMs);

    if (typeof interval.unref === "function") {
      interval.unref();
    }
  }

  async function acquireLock(key, timeoutMs = 5000) {
    const start = Date.now();
    while (locks.get(key)) {
      if (Date.now() - start > timeoutMs) {
        throw new Error(`Rate limit lock timeout for key: ${key}`);
      }
      await new Promise((r) => setTimeout(r, 1));
    }
    locks.set(key, true);
  }

  function releaseLock(key) {
    locks.delete(key);
  }

  return {
    kind: "memory",
    bucketTtlMs,
    async getBucket(bucketKey, now = Date.now()) {
      const bucket = buckets.get(bucketKey);
      if (bucket) {
        if (getMemoryStoreExpiration(bucket, bucketTtlMs, now)) {
          buckets.delete(bucketKey);
          return null;
        }
        return { ...bucket };
      }
      return null;
    },
    async setBucket(bucketKey, bucket) {
      buckets.set(bucketKey, normalizeBucket(bucket));
    },
    async deleteBucket(bucketKey) {
      buckets.delete(bucketKey);
    },
    async cleanupExpiredBuckets(now = Date.now()) {
      for (const [bucketKey, bucket] of buckets.entries()) {
        if (getMemoryStoreExpiration(bucket, bucketTtlMs, now)) {
          buckets.delete(bucketKey);
        }
      }
    },
    async close() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    },
    async checkAndDeduct(bucketKey, { limitPerMinute, burstCapacity, now = Date.now() }) {
      // Reject immediately when burst capacity is invalid — prevents
      // the bucket-creation path from leaking one allowed request and
      // the deduction path from capping tokens to <= 0
      if (burstCapacity <= 0) {
        return { allowed: false, remaining: 0, retryAfterSeconds: 60 };
      }

      await acquireLock(bucketKey);
      try {
        let bucket = buckets.get(bucketKey);

        // Check expiration first
        if (bucket && getMemoryStoreExpiration(bucket, bucketTtlMs, now)) {
          buckets.delete(bucketKey);
          bucket = null;
        }

        if (!bucket) {
          // First request — create bucket, deduct one token
          const tokens = Math.max(0, burstCapacity - 1);
          buckets.set(
            bucketKey,
            normalizeBucket({
              tokens,
              lastRefillAt: now,
              limitPerMinute,
              burstCapacity,
            })
          );
          return { allowed: true, remaining: tokens, retryAfterSeconds: 0 };
        }

        // Refill tokens based on elapsed time
        const elapsedMinutes = (now - bucket.lastRefillAt) / 60000;
        const refillAmount = elapsedMinutes * limitPerMinute;
        bucket.tokens = Math.min(burstCapacity, bucket.tokens + refillAmount);
        bucket.lastRefillAt = now;

        if (bucket.tokens < 1) {
          // Not enough tokens — reject
          const missingTokens = 1 - bucket.tokens;
          const retryAfterSeconds =
            limitPerMinute > 0
              ? Math.max(1, Math.ceil((missingTokens / limitPerMinute) * 60))
              : 60;
          buckets.set(bucketKey, normalizeBucket(bucket));
          return { allowed: false, remaining: 0, retryAfterSeconds };
        }

        // Deduct one token
        bucket.tokens -= 1;
        buckets.set(bucketKey, normalizeBucket(bucket));
        return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterSeconds: 0 };
      } finally {
        releaseLock(bucketKey);
      }
    },
  };
}

const CHECK_AND_DEDUCT_SCRIPT = `
local key = KEYS[1]
local limitPerMinute = tonumber(ARGV[1])
local burstCapacity = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local ttlMs = tonumber(ARGV[4])

local raw = redis.call('GET', key)

if not raw then
  local tokens = math.max(0, burstCapacity - 1)
  local bucket = cjson.encode({ tokens = tokens, lastRefillAt = now, limitPerMinute = limitPerMinute, burstCapacity = burstCapacity })
  redis.call('SET', key, bucket, 'PX', ttlMs)
  return {1, tokens, 0}
end

local ok, bucket = pcall(cjson.decode, raw)
if not ok then
  return {0, 0, 60}
end

local elapsedMinutes = (now - bucket.lastRefillAt) / 60000
local refillAmount = elapsedMinutes * limitPerMinute
bucket.tokens = math.min(burstCapacity, bucket.tokens + refillAmount)
bucket.lastRefillAt = now

if bucket.tokens < 1 then
  local missingTokens = 1 - bucket.tokens
  local retryAfterSeconds
  if limitPerMinute > 0 then
    retryAfterSeconds = math.max(1, math.ceil((missingTokens / limitPerMinute) * 60))
  else
    retryAfterSeconds = 60
  end
  redis.call('SET', key, cjson.encode(bucket), 'PX', ttlMs)
  return {0, 0, retryAfterSeconds}
end

bucket.tokens = bucket.tokens - 1
redis.call('SET', key, cjson.encode(bucket), 'PX', ttlMs)
return {1, math.floor(bucket.tokens), 0}
`;

export function createRedisRateLimitStore({
  redisUrl = process.env.REDIS_URL,
  keyPrefix = DEFAULT_REDIS_PREFIX,
  bucketTtlMs = DEFAULT_BUCKET_TTL_MS,
} = {}) {
  if (!redisUrl) {
    throw new Error("REDIS_URL is required to enable Redis rate limiting");
  }

  return {
    kind: "redis",
    bucketTtlMs,
    async getBucket(bucketKey) {
      const client = await getRedisClient(redisUrl);
      const value = await client.get(getRedisKey(keyPrefix, bucketKey));

      if (!value) {
        return null;
      }

      try {
        return normalizeBucket(JSON.parse(value));
      } catch {
        return null;
      }
    },
    async setBucket(bucketKey, bucket) {
      const client = await getRedisClient(redisUrl);
      await client.set(
        getRedisKey(keyPrefix, bucketKey),
        JSON.stringify(normalizeBucket(bucket)),
        { PX: bucketTtlMs }
      );
    },
    async deleteBucket(bucketKey) {
      const client = await getRedisClient(redisUrl);
      await client.del(getRedisKey(keyPrefix, bucketKey));
    },
    async cleanupExpiredBuckets() {
      return undefined;
    },
    async checkAndDeduct(bucketKey, { limitPerMinute, burstCapacity, now = Date.now() }) {
      const client = await getRedisClient(redisUrl);
      const redisKey = getRedisKey(keyPrefix, bucketKey);
      const [allowed, remaining, retryAfterSeconds] = await client.eval(
        CHECK_AND_DEDUCT_SCRIPT,
        {
          keys: [redisKey],
          arguments: [
            String(limitPerMinute),
            String(burstCapacity),
            String(now),
            String(bucketTtlMs),
          ],
        }
      );
      return {
        allowed: allowed === 1,
        remaining,
        retryAfterSeconds,
      };
    },
  };
}

export function createRateLimitStore({
  driver = process.env.RATE_LIMIT_STORE ?? "auto",
  redisUrl = process.env.REDIS_URL,
  keyPrefix = DEFAULT_REDIS_PREFIX,
  bucketTtlMs = DEFAULT_BUCKET_TTL_MS,
} = {}) {
  const normalizedDriver = String(driver).toLowerCase();

  if (normalizedDriver === "redis" || (normalizedDriver === "auto" && redisUrl)) {
    return createRedisRateLimitStore({ redisUrl, keyPrefix, bucketTtlMs });
  }

  return createMemoryRateLimitStore({ bucketTtlMs });
}