const buckets = new Map();
const stats = new Map();

function getStats(endpoint) {
  if (!stats.has(endpoint)) {
    stats.set(endpoint, { attempts: 0, rejected: 0 });
  }

  return stats.get(endpoint);
}

function getBucketKey(endpoint, subjectKey) {
  return `${endpoint}:${subjectKey}`;
}

function refillBucket(bucket, limitPerMinute, burstCapacity) {
  const now = Date.now();
  const elapsedMinutes = (now - bucket.lastRefillAt) / 60000;
  const refillAmount = elapsedMinutes * limitPerMinute;

  bucket.tokens = Math.min(burstCapacity, bucket.tokens + refillAmount);
  bucket.lastRefillAt = now;
}

function cleanupExpiredBuckets() {
  const now = Date.now();
  const maxAgeMs = 10 * 60 * 1000;

  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefillAt > maxAgeMs) {
      buckets.delete(key);
    }
  }
}

export function getRateLimitIdentifier(request, userId) {
  if (userId) {
    return { kind: "user", value: userId };
  }

  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip = (forwardedFor?.split(",")[0] || realIp || "unknown").trim();

  return { kind: "ip", value: ip || "unknown" };
}

export function enforceRateLimit({
  endpoint,
  subject,
  limitPerMinute,
  burstCapacity = limitPerMinute,
}) {
  cleanupExpiredBuckets();

  const subjectKey = `${subject.kind}:${subject.value}`;
  const bucketKey = getBucketKey(endpoint, subjectKey);
  const statsEntry = getStats(endpoint);

  statsEntry.attempts += 1;

  const existingBucket = buckets.get(bucketKey);

  if (!existingBucket) {
    buckets.set(bucketKey, {
      tokens: Math.max(0, burstCapacity - 1),
      lastRefillAt: Date.now(),
      limitPerMinute,
      burstCapacity,
    });

    return {
      allowed: true,
      remaining: Math.max(0, burstCapacity - 1),
      retryAfterSeconds: 0,
      rejectionRate: statsEntry.attempts === 0 ? 0 : statsEntry.rejected / statsEntry.attempts,
    };
  }

  refillBucket(existingBucket, limitPerMinute, burstCapacity);

  if (existingBucket.tokens < 1) {
    const missingTokens = 1 - existingBucket.tokens;
    const retryAfterSeconds = Math.max(1, Math.ceil((missingTokens / limitPerMinute) * 60));

    statsEntry.rejected += 1;

    const rejectionRate = statsEntry.rejected / statsEntry.attempts;

    console.warn("rate-limit block", {
      endpoint,
      subject: subjectKey,
      limitPerMinute,
      burstCapacity,
      retryAfterSeconds,
      rejectionRate,
    });

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      rejectionRate,
    };
  }

  existingBucket.tokens -= 1;

  return {
    allowed: true,
    remaining: Math.floor(existingBucket.tokens),
    retryAfterSeconds: 0,
    rejectionRate: statsEntry.rejected / statsEntry.attempts,
  };
}

export function buildRateLimitResponse({
  message = "Too Many Requests",
  retryAfterSeconds,
  sse = false,
}) {
  const body = JSON.stringify({
    error: message,
    retryAfterSeconds,
  });

  return new Response(sse ? `data: ${body}\n\n` : body, {
    status: 429,
    headers: {
      "Content-Type": sse ? "text/event-stream" : "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "Retry-After": String(retryAfterSeconds),
    },
  });
}