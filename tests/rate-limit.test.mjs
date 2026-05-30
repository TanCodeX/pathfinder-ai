import { expect, it } from "vitest";

import { enforceRateLimit } from "../lib/rate-limit.js";
import {
  createMemoryRateLimitStore,
  createRateLimitStore,
} from "../lib/rate-limit/store.js";

it("memory store evicts stale buckets", async () => {
  const store = createMemoryRateLimitStore({ bucketTtlMs: 1000 });

  await store.setBucket("/api/generate:user:1", {
    tokens: 2,
    lastRefillAt: 0,
    limitPerMinute: 10,
    burstCapacity: 2,
  });

  await store.cleanupExpiredBuckets(2000);

  expect(await store.getBucket("/api/generate:user:1")).toBeNull();
});

it("factory defaults to memory storage when redis is not configured", () => {
  const store = createRateLimitStore({ driver: "memory" });

  expect(store.kind).toBe("memory");
});

it("factory can create a redis store lazily", () => {
  const store = createRateLimitStore({
    driver: "redis",
    redisUrl: "redis://localhost:6379",
  });

  expect(store.kind).toBe("redis");
});

it("rate limiter consumes burst capacity and then rejects", async () => {
  const store = createMemoryRateLimitStore({ bucketTtlMs: 60_000 });
  const subject = { kind: "user", value: "abc" };

  const first = await enforceRateLimit({
    endpoint: "/api/generate",
    subject,
    limitPerMinute: 60,
    burstCapacity: 2,
    store,
    now: 1000,
  });

  expect(first.allowed).toBe(true);
  expect(first.remaining).toBe(1);

  const second = await enforceRateLimit({
    endpoint: "/api/generate",
    subject,
    limitPerMinute: 60,
    burstCapacity: 2,
    store,
    now: 1000,
  });

  expect(second.allowed).toBe(true);
  expect(second.remaining).toBe(0);

  const third = await enforceRateLimit({
    endpoint: "/api/generate",
    subject,
    limitPerMinute: 60,
    burstCapacity: 2,
    store,
    now: 1000,
  });

  expect(third.allowed).toBe(false);
  expect(third.remaining).toBe(0);
  expect(third.retryAfterSeconds).toBe(1);
});

it("rate limiter refills after elapsed time", async () => {
  const store = createMemoryRateLimitStore({ bucketTtlMs: 60_000 });
  const subject = { kind: "ip", value: "127.0.0.1" };

  await enforceRateLimit({
    endpoint: "/api/generate",
    subject,
    limitPerMinute: 60,
    burstCapacity: 2,
    store,
    now: 1000,
  });

  const refill = await enforceRateLimit({
    endpoint: "/api/generate",
    subject,
    limitPerMinute: 60,
    burstCapacity: 2,
    store,
    now: 61_000,
  });

  expect(refill.allowed).toBe(true);
  expect(refill.remaining).toBe(1);
});

it("memory store evicts stale buckets lazily via getBucket", async () => {
  const store = createMemoryRateLimitStore({ bucketTtlMs: 1000, cleanupIntervalMs: 0 });

  await store.setBucket("/api/generate:user:1", {
    tokens: 2,
    lastRefillAt: 0,
    limitPerMinute: 10,
    burstCapacity: 2,
  });

  // Call getBucket with a timestamp past the TTL
  const bucket = await store.getBucket("/api/generate:user:1", 2000);
  expect(bucket).toBeNull();

  // Verify it was actually deleted from internal storage
  expect(await store.getBucket("/api/generate:user:1")).toBeNull();

  await store.close();
});

it("concurrent requests respect burst capacity with atomic checkAndDeduct", async () => {
  const store = createMemoryRateLimitStore({ bucketTtlMs: 60_000 });
  const subject = { kind: "user", value: "concurrent-test" };
  const CONCURRENCY = 20;

  const results = await Promise.all(
    Array.from({ length: CONCURRENCY }, () =>
      enforceRateLimit({
        endpoint: "/api/generate",
        subject,
        limitPerMinute: 60,
        burstCapacity: 2,
        store,
        now: 1000,
      })
    )
  );

  const allowed = results.filter((r) => r.allowed);
  const rejected = results.filter((r) => !r.allowed);

  // With burstCapacity=2, at most 2 requests should be allowed
  expect(allowed.length).toBeLessThanOrEqual(2);
  // At least 18 should be rejected
  expect(rejected.length).toBeGreaterThanOrEqual(18);

  // First allowed should have remaining=1, second remaining=0
  const remainingValues = allowed.map((r) => r.remaining).sort((a, b) => b - a);
  expect(remainingValues).toEqual([1, 0]);

  // All rejected should have remaining=0 and retryAfterSeconds > 0
  for (const r of rejected) {
    expect(r.remaining).toBe(0);
    expect(r.retryAfterSeconds).toBeGreaterThan(0);
  }
});

it("memory store evicts stale buckets periodically via cleanupIntervalMs", async () => {
  // Use a small cleanup interval (e.g. 50ms) and short bucket TTL (e.g. 10ms)
  const store = createMemoryRateLimitStore({ bucketTtlMs: 10, cleanupIntervalMs: 50 });

  await store.setBucket("/api/generate:user:1", {
    tokens: 2,
    lastRefillAt: Date.now(),
    limitPerMinute: 10,
    burstCapacity: 2,
  });

  // Wait for 100ms for interval to run and clean up
  await new Promise((resolve) => setTimeout(resolve, 100));

  // The bucket should be gone from the store even when querying at current time
  const bucket = await store.getBucket("/api/generate:user:1");
  expect(bucket).toBeNull();

  await store.close();
});