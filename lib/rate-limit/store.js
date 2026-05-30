export const DEFAULT_BUCKET_TTL_MS = 10 * 60 * 1000;
const DEFAULT_REDIS_PREFIX = "pathfinder:rate-limit";
const DEFAULT_MEMORY_CLEANUP_INTERVAL_MS = 30 * 1000;
const DEFAULT_MEMORY_CLEANUP_BATCH_SIZE = 250;
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

export function createMemoryRateLimitStore({ bucketTtlMs = DEFAULT_BUCKET_TTL_MS } = {}) {
  const buckets = new Map();
  let cleanupTask = null;
  let lastCleanupAt = 0;

  const cleanupIntervalMs = DEFAULT_MEMORY_CLEANUP_INTERVAL_MS;
  const cleanupBatchSize = DEFAULT_MEMORY_CLEANUP_BATCH_SIZE;

  const yieldToEventLoop = () => new Promise((resolve) => setTimeout(resolve, 0));

  const sweepExpiredBuckets = async (now) => {
    let scanned = 0;

    for (const [bucketKey, bucket] of buckets.entries()) {
      if (getMemoryStoreExpiration(bucket, bucketTtlMs, now)) {
        buckets.delete(bucketKey);
      }

      scanned += 1;

      if (scanned % cleanupBatchSize === 0) {
        await yieldToEventLoop();
      }
    }
  };

  const scheduleCleanup = (now = Date.now()) => {
    if (cleanupTask || now - lastCleanupAt < cleanupIntervalMs) {
      return;
    }

    lastCleanupAt = now;
    cleanupTask = sweepExpiredBuckets(now).finally(() => {
      cleanupTask = null;
    });

    cleanupTask.catch((error) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[rate-limit] memory cleanup failed", error);
      }
    });
  };

  return {
    kind: "memory",
    bucketTtlMs,
    async getBucket(bucketKey) {
      scheduleCleanup();
      const bucket = buckets.get(bucketKey);
      return bucket ? { ...bucket } : null;
    },
    async setBucket(bucketKey, bucket) {
      buckets.set(bucketKey, normalizeBucket(bucket));
      scheduleCleanup();
    },
    async deleteBucket(bucketKey) {
      buckets.delete(bucketKey);
    },
    async cleanupExpiredBuckets(now = Date.now()) {
      await sweepExpiredBuckets(now);
    },
  };
}

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
  };
}

export function createRateLimitStore({
  driver = process.env.RATE_LIMIT_STORE ?? "auto",
  redisUrl = process.env.REDIS_URL,
  keyPrefix = DEFAULT_REDIS_PREFIX,
  bucketTtlMs = DEFAULT_BUCKET_TTL_MS,
} = {}) {
  const normalizedDriver = String(driver).toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    if (normalizedDriver === "memory") {
      throw new Error(
        "RATE_LIMIT_STORE=memory is not allowed in production; configure REDIS_URL and use RATE_LIMIT_STORE=auto or RATE_LIMIT_STORE=redis"
      );
    }

    if (!redisUrl) {
      throw new Error("REDIS_URL is required in production for shared rate limiting");
    }
  }

  if (normalizedDriver === "redis" || (normalizedDriver === "auto" && redisUrl)) {
    return createRedisRateLimitStore({ redisUrl, keyPrefix, bucketTtlMs });
  }

  return createMemoryRateLimitStore({ bucketTtlMs });
}