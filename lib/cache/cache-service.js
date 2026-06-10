import { createPromptFingerprint } from "./fingerprint";
import {
  getPendingRequest,
  setPendingRequest,
  deletePendingRequest,
} from "./pending-requests";

const CACHE_TTL = 1000 * 60 * 10;
import { getCacheStore } from "./store.js";
import { DEFAULT_CACHE_TTL_MS, generateCacheKey } from "./utils.js";

export function buildCacheKey(userId, prompt) {
  return generateCacheKey("ai", userId, prompt);
}

export async function getCachedResponse(userId, prompt) {
  const key = buildCacheKey(userId, prompt);

  try {
    return await getCacheStore().get(key);
  } catch (error) {
    console.warn("[cache] Failed to read cached response", error);
    return null;
  }
}

export async function cacheResponse(userId, prompt, response) {
  if (!response) return;

  const key = buildCacheKey(userId, prompt);

  getCacheStore().set(key, response, CACHE_TTL);
}

export function getPendingGenerationRequest(userId, prompt) {
  const key = buildCacheKey(userId, prompt);
  return getPendingRequest(key);
}

export function setPendingGenerationRequest(userId, prompt, promise) {
  const key = buildCacheKey(userId, prompt);
<<<<<<< HEAD
  setPendingRequest(key, promise);
=======
  return setPendingRequest(key, promise);
>>>>>>> d7f2f9f (dockerization and production check)
}

export async function deletePendingGenerationRequest(
  userId,
  prompt,
  response
) {
  const key = buildCacheKey(userId, prompt);

  deletePendingRequest(key);

<<<<<<< HEAD
  if (response) {
    try {
      await cacheStore.set(key, response, DEFAULT_CACHE_TTL_MS);
    } catch (error) {
      console.warn("[cache] Failed to store cached response", error);
    }
=======
  try {
    await getCacheStore().set(key, response, DEFAULT_CACHE_TTL_MS);
  } catch (error) {
    console.warn("[cache] Failed to store cached response", error);
>>>>>>> d7f2f9f (dockerization and production check)
  }
}