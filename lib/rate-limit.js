import "server-only";
import { getEnv } from "./env.js";
import {
  createRateLimitStore,
  refillBucket,
  DEFAULT_BUCKET_TTL_MS,
} from "./rate-limit/store.js";

let _defaultStore;
function getDefaultStore() {
  if (!_defaultStore) {
    _defaultStore = createRateLimitStore();
  }
  return _defaultStore;
}
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

export async function cleanupExpiredBuckets(store, now = Date.now()) {
  if (typeof store?.cleanupExpiredBuckets === "function") {
    await store.cleanupExpiredBuckets(now, DEFAULT_BUCKET_TTL_MS);
  }
}

/**
 * Safely extracts the client IP from trusted proxy headers.
 * Prioritizes X-Real-IP (set by immediate trusted proxy).
 * Falls back to rightmost untrusted IP in X-Forwarded-For chain.
 * Uses slice from right to prevent client-side IP prepending attacks.
 */
export function extractTrustedClientIp(headers) {
  if (!headers) return "unknown";
  const { TRUSTED_PROXY_COUNT } = getEnv();

  // Prioritize X-Real-IP as it is set by the immediate trusted proxy / hosting platform edge
  // and cannot be spoofed by the client in standard production environments.
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = headers.get("x-forwarded-for");
  if (!forwardedFor) {
    return "unknown";
  }

  const ips = forwardedFor.split(",").map((ip) => ip.trim()).filter(Boolean);
  if (ips.length === 0) {
    return "unknown";
  }

  // Slice to only examine the trusted portion of the chain from the right.
  // The first entry of the trusted portion corresponds to the client IP.
  const trustedProxyCount = TRUSTED_PROXY_COUNT > 0 ? TRUSTED_PROXY_COUNT : 1;
  const trustedIps = ips.slice(-trustedProxyCount);
  return trustedIps[0] || "unknown";
}

export function getRateLimitIdentifier(request, userId) {
  if (userId) {
    return { kind: "user", value: userId };
  }

  const ip = extractTrustedClientIp(request.headers);

  return { kind: "ip", value: ip };
}

export async function enforceRateLimit({
  endpoint,
  subject,
  limitPerMinute,
  burstCapacity = limitPerMinute,
  store = getDefaultStore(),
  now = Date.now(),
}) {
  const subjectKey = `${subject.kind}:${subject.value}`;
  const bucketKey = getBucketKey(endpoint, subjectKey);
  const statsEntry = getStats(endpoint);

  statsEntry.attempts += 1;

  // Use atomic checkAndDeduct when available (fixes non-atomic read-modify-write race condition)
  if (typeof store.checkAndDeduct === "function") {
    const result = await store.checkAndDeduct(bucketKey, {
      limitPerMinute,
      burstCapacity,
      now,
    });

    if (!result.allowed) {
      statsEntry.rejected += 1;
    }

    return {
      allowed: result.allowed,
      remaining: result.remaining,
      retryAfterSeconds: result.retryAfterSeconds,
      rejectionRate:
        statsEntry.attempts === 0
          ? 0
          : statsEntry.rejected / statsEntry.attempts,
    };
  }

  // Fallback: non-atomic path for stores without checkAndDeduct
  const existingBucket = await store.getBucket(bucketKey, now);

  if (!existingBucket) {
    const nextBucket = {
      tokens: Math.max(0, burstCapacity - 1),
      lastRefillAt: now,
      limitPerMinute,
      burstCapacity,
    };

    await store.setBucket(bucketKey, nextBucket);

    return {
      allowed: true,
      remaining: Math.max(0, burstCapacity - 1),
      retryAfterSeconds: 0,
      rejectionRate: statsEntry.attempts === 0 ? 0 : statsEntry.rejected / statsEntry.attempts,
    };
  }

  const nextBucket = { ...existingBucket };
  refillBucket(nextBucket, limitPerMinute, burstCapacity, now);

  if (nextBucket.tokens < 1) {
    const missingTokens = 1 - nextBucket.tokens;
    const retryAfterSeconds = limitPerMinute > 0
      ? Math.max(1, Math.ceil((missingTokens / limitPerMinute) * 60))
      : 60;

    statsEntry.rejected += 1;
    await store.setBucket(bucketKey, nextBucket);

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      rejectionRate: statsEntry.rejected / statsEntry.attempts,
    };
  }

  // Deduct token for allowed request and persist
  nextBucket.tokens -= 1;
  await store.setBucket(bucketKey, nextBucket);

  return {
    allowed: true,
    remaining: Math.max(0, Math.floor(nextBucket.tokens)),
    retryAfterSeconds: 0,
    rejectionRate: statsEntry.attempts === 0 ? 0 : statsEntry.rejected / statsEntry.attempts,
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

  return new Response(sse ? `event: error\ndata: ${body}\n\n` : body, {
    status: 429,
    headers: {
      "Content-Type": sse ? "text/event-stream" : "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "keep-alive",
      "Retry-After": String(retryAfterSeconds),
    },
  });
}