import { generateGeminiContentStream } from "./gemini.js";
import { db } from "./prisma.js";
import { buildSecurePrompt } from "./prompt-safety.js";
import { getRateLimitIdentifier, enforceRateLimit, buildRateLimitResponse } from "./rate-limit.js";
import { preparePromptForGeneration, buildSseErrorResponse } from "./prompt-guard.js";

export async function handleGenerate(request, userId, overrides = {}) {
  const deps = {
    generateGeminiContentStream,
    db,
    buildSecurePrompt,
    getRateLimitIdentifier,
    enforceRateLimit,
    buildRateLimitResponse,
    preparePromptForGeneration,
    buildSseErrorResponse,
    ...overrides,
  };

  const { getRateLimitIdentifier: _getRateLimitIdentifier, enforceRateLimit: _enforceRateLimit, buildRateLimitResponse: _buildRateLimitResponse, preparePromptForGeneration: _preparePromptForGeneration, buildSseErrorResponse: _buildSseErrorResponse, generateGeminiContentStream: _generateGeminiContentStream, db: _db, buildSecurePrompt: _buildSecurePrompt } = deps;

  const endpoint = "/api/generate";
  const subject = _getRateLimitIdentifier(request, userId);

  const rateLimit = _enforceRateLimit({
    endpoint,
    subject,
    limitPerMinute: userId ? 20 : 5,
    burstCapacity: userId ? 10 : 5,
  });

  if (!rateLimit.allowed) {
    return _buildRateLimitResponse({
      message: "Too Many Requests",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      sse: true,
    });
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey && !overrides.skipApiKeyCheck) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  let prompt;
  let conversationId;

  try {
    const body = await request.json();
    prompt = body.prompt;
    conversationId = body.conversationId;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return _buildSseErrorResponse("Prompt is required", 400);
  }

  const promptCheck = _preparePromptForGeneration(prompt);

  if (!promptCheck.allowed) {
    return _buildSseErrorResponse(promptCheck.message, promptCheck.status);
  }

  const user = await _db.user.findUnique({ where: { clerkUserId: userId } });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // For integration tests we won't run the actual streaming Gemini call.
  // Return a simple SSE success envelope when overrides provide `mockResponse`.
  if (overrides.mockResponse) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({ start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: overrides.mockResponse })}\n\n`));
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }});

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
      },
    });
  }

  // Default behavior: attempt to stream from Gemini
  try {
    const restrictedPrompt = _buildSecurePrompt({
      task: `You are Pathfinder AI, a professional career guidance assistant.`,
      untrustedData: [{ label: "userQuery", value: prompt, maxLength: 4000 }],
    });

    const result = await _generateGeminiContentStream(restrictedPrompt);

    // proxy stream back to client
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err?.message || "Unknown error" })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

export default handleGenerate;
