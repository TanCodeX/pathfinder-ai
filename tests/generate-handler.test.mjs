import assert from "node:assert/strict";
import test from "node:test";

import { handleGenerate } from "../lib/generate-handler.js";

function makeReq(body = {}) {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("returns SSE error when prompt missing", async () => {
  const req = makeReq({});

  // mock db to return a user row when findUnique is called
  const mockDb = { user: { findUnique: async () => ({ id: 'u1' }) } };

  const res = await handleGenerate(req, "user-1", { db: mockDb, skipApiKeyCheck: true });

  assert.equal(res.status, 400);
  assert.equal(res.headers.get("Content-Type"), "text/event-stream");
  const text = await res.text();
  assert.ok(text.includes('"error": "Prompt is required"'));
});

test("returns SSE error when prompt guard blocks prompt", async () => {
  const req = makeReq({ prompt: "Tell me a joke" });

  const mockDb = { user: { findUnique: async () => ({ id: 'u1' }) } };
  const mockPrepare = (p) => ({ allowed: false, status: 400, message: "Prompt must be career-related" });

  const res = await handleGenerate(req, "user-1", { db: mockDb, preparePromptForGeneration: mockPrepare, skipApiKeyCheck: true });

  assert.equal(res.status, 400);
  const txt = await res.text();
  assert.ok(txt.includes('"error": "Prompt must be career-related"'));
});

test("rate limit denial returns 429 SSE response", async () => {
  const req = makeReq({ prompt: "career advice" });

  const mockDb = { user: { findUnique: async () => ({ id: 'u1' }) } };
  const mockGetId = () => ({ kind: 'ip', value: '1.2.3.4' });
  const mockEnforce = () => ({ allowed: false, retryAfterSeconds: 5 });
  const res = await handleGenerate(req, null, { db: mockDb, getRateLimitIdentifier: mockGetId, enforceRateLimit: mockEnforce, skipApiKeyCheck: true });

  assert.equal(res.status, 429);
  assert.equal(res.headers.get("Content-Type"), "text/event-stream");
});

test("successful mockResponse streams data and DONE", async () => {
  const req = makeReq({ prompt: "career advice" });
  const mockDb = { user: { findUnique: async () => ({ id: 'u1' }) } };

  const res = await handleGenerate(req, "user-1", { db: mockDb, mockResponse: "Hello world", skipApiKeyCheck: true });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Content-Type"), "text/event-stream");
  const txt = await res.text();
  assert.ok(txt.includes('"text":"Hello world"'));
  assert.ok(txt.includes("[DONE]"));
});
