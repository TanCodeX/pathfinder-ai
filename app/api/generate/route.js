import { auth } from "@clerk/nextjs/server";
import { generateGeminiContentStream } from "@/lib/gemini";
import { db } from "@/lib/prisma";
import { buildSecurePrompt } from "@/lib/prompt-safety";
import { buildUserAiContext } from "@/lib/ai-context";
import {
  getRateLimitIdentifier,
  enforceRateLimit,
  buildRateLimitResponse,
} from "@/lib/rate-limit";
import {
  preparePromptForGeneration,
  buildSseErrorResponse,
} from "@/lib/prompt-guard";
import {
  getCachedResponse,
  cacheResponse,
} from "@/lib/cache/cache-service";
import { respondError, respondSseError, ERROR_CODES } from "@/lib/api/error-handler";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-store, must-revalidate, no-transform",
  Connection: "keep-alive",
  "X-Accel-Buffering": "no",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const encodeSseEvent = (encoder, event, payload) => {
  const safePayload = payload ?? {};
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(safePayload)}\n\n`);
};

const extractChunkText = (chunk) => {
  if (!chunk) return "";

  try {
    const rawText = typeof chunk.text === "function" ? chunk.text() : chunk?.text;

    if (rawText == null) return "";
    if (typeof rawText === "string") return rawText;

    return String(rawText);
  } catch {
    return "";
  }
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: SSE_HEADERS,
  });
}

export async function POST(request) {
  
  const { userId } = await auth();
  const endpoint = "/api/generate";
  const subject = getRateLimitIdentifier(request, userId);
  const rateLimit = await enforceRateLimit({
    endpoint,
    subject,
    limitPerMinute: userId ? 20 : 5,
    burstCapacity: userId ? 10 : 5,
  });

  console.info("rate-limit-check", {
    endpoint,
    subjectKind: subject.kind,
    allowed: rateLimit.allowed,
    remaining: rateLimit.remaining,
    retryAfterSeconds: rateLimit.retryAfterSeconds,
    ...(rateLimit.allowed ? {} : { rejectionRate: rateLimit.rejectionRate }),
  });

  if (!rateLimit.allowed) {
    return buildRateLimitResponse({
      message: "Too Many Requests",
      retryAfterSeconds: rateLimit.retryAfterSeconds,
      sse: true,
    });
  }

  if (!userId) {
    return respondSseError(ERROR_CODES.UNAUTHORIZED);
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return respondError(ERROR_CODES.INTERNAL_SERVER_ERROR, "GEMINI_API_KEY is not configured");
  }

  let prompt;
  let conversationId;

  try {
    const body = await request.json();
    prompt = body.prompt;
    conversationId = body.conversationId;
  } catch {
    return respondError(ERROR_CODES.VALIDATION_ERROR, "Invalid request body");
  }

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return buildSseErrorResponse("Prompt is required", 400);
  }

  const promptCheck = preparePromptForGeneration(prompt);

  if (!promptCheck.allowed) {
    return buildSseErrorResponse(promptCheck.message, promptCheck.status);
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!user) {
    return respondError(ERROR_CODES.USER_NOT_FOUND);
  }

  if (conversationId) {
    try {
      await db.$transaction(
        async (tx) => {
          const conversation = await tx.conversation.findFirst({
            where: {
              id: conversationId,
              userId: user.id,
            },
          });

          if (!conversation) {
            throw new Error("Conversation not found");
          }

          if (user?.saveChatHistory ?? true) {
            await tx.message.create({
              data: {
                conversationId,
                role: "user",
                content: prompt,
              },
            });
          }
        },
        { timeout: 10_000 }
      );
    } catch (error) {
      if (error?.message === "Conversation not found") {
        return respondError(ERROR_CODES.RESOURCE_NOT_FOUND, "Conversation not found");
      }

      console.error("Pre-stream conversation transaction failed:", error);
      return respondError(ERROR_CODES.DATABASE_ERROR, "Failed to prepare conversation");
    }
  }

  const recentMessages = conversationId
    ? await db.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
        select: {
          role: true,
          content: true,
        },
      })
    : [];

  const aiContext = buildUserAiContext(user, recentMessages.reverse());
  const cacheUser = userId || request.headers.get("x-forwarded-for") || "anonymous";

  const restrictedPrompt = buildSecurePrompt({
    context: aiContext.context,
    task: `You are Pathfinder AI, a professional career guidance assistant.

Your scope includes ALL professional and career-related domains, including:
- software engineering, medicine, healthcare, law, finance, accounting, banking
- business, management, marketing, sales, design, UI/UX, architecture
- education, teaching, research, government jobs, civil services
- entrepreneurship, freelancing, consulting, skilled trades
- manufacturing, logistics, human resources, customer support
- media, content creation, non-technical professions

You help users with:
- career guidance, interview preparation, mock interviews
- resume/CV improvement, cover letters, job applications
- job search strategy, skill development, certification guidance
- learning roadmaps, salary discussions, career transitions
- workplace growth, professional development

Rules:
- Stay focused on careers and professional growth.
- If the user asks something completely unrelated (jokes, entertainment, random trivia, casual unrelated chat), politely redirect them toward career/professional topics.
- Be practical, structured, and professional.
- Give actionable advice.`,
    untrustedData: [
      { label: "userQuery", value: promptCheck.prompt, maxLength: 4000 },
    ],
  });

  const existingCachedResponse = await getCachedResponse(
    cacheUser,
    restrictedPrompt
  );

  if (existingCachedResponse) {
    if (conversationId && (user?.saveChatHistory ?? true)) {
      try {
        await db.$transaction(
          async (tx) => {
            await tx.message.create({
              data: {
                conversationId,
                role: "assistant",
                content: existingCachedResponse,
              },
            });

            await tx.conversation.update({
              where: {
                id: conversationId,
              },
              data: {
                updatedAt: new Date(),
              },
            });
          },
          { timeout: 10_000 }
        );
      } catch (error) {
        console.error("Cached response persistence failed:", error);
      }
    }

    const encoder = new TextEncoder();

    const cachedStream = new ReadableStream({
      start(controller) {
        controller.enqueue(
          encodeSseEvent(encoder, "delta", {
            text: existingCachedResponse,
            cached: true,
          })
        );

        controller.enqueue(
          encodeSseEvent(encoder, "done", {
            finalText: existingCachedResponse,
            hasContent: true,
            cached: true,
            debug: {
              ...aiContext.debug,
              promptContext: aiContext.context,
            },
          })
        );

        controller.close();
      },
    });

    return new Response(cachedStream, {
      headers: {
        ...SSE_HEADERS,
        "X-Cache": "HIT",
      },
    });
  }

  const encoder = new TextEncoder();
  const abortController = new AbortController();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";
      let streamClosed = false;

      const safeEnqueue = (event, payload) => {
        if (streamClosed || abortController.signal.aborted) return;
        controller.enqueue(encodeSseEvent(encoder, event, payload));
      };

      const safeClose = () => {
        if (streamClosed) return;
        streamClosed = true;
        controller.close();
      };

      try {
        const result = await generateGeminiContentStream(restrictedPrompt, {
          signal: abortController.signal,
        });

        for await (const chunk of result.stream) {
          if (abortController.signal.aborted) break;

          const text = extractChunkText(chunk);

          if (text) {
            fullResponse += text;
            safeEnqueue("delta", { text });
          }
        }

        if (abortController.signal.aborted) {
          safeClose();
          return;
        } 

        if (conversationId && fullResponse.trim()) {
          if (user?.saveChatHistory ?? true) {
            try {
              await db.$transaction(
                async (tx) => {
                  await tx.message.create({
                    data: {
                      conversationId,
                      role: "assistant",
                      content: fullResponse,
                    },
                  });

                  await tx.conversation.update({
                    where: {
                      id: conversationId,
                    },
                    data: {
                      updatedAt: new Date(),
                    },
                  });
                },
                { timeout: 10_000 }
              );
            } catch (error) {
              console.error("Post-stream conversation transaction failed:", error);
              throw error;
            }
          }
        }
        if (fullResponse.trim()) {
          await cacheResponse(
            cacheUser,
            promptCheck.prompt,
            fullResponse
          );
        }
        safeEnqueue("done", {
          finalText: fullResponse,
          hasContent: Boolean(fullResponse.trim()),
          debug: {
            ...aiContext.debug,
            promptContext: aiContext.context,
          },
        });
        safeClose();
      } catch (error) {
        if (abortController.signal.aborted) {
          safeClose();
          return;
        }
        console.error("Gemini streaming error:", error?.message || error);

        safeEnqueue("error", {
          message: error?.message || "Unknown error",
        });
        safeClose();
      }
    },
    cancel(reason) {
      console.warn("SSE stream cancelled by client connection abort:", reason);
      abortController.abort();
    },
  });

  return new Response(stream, {
    headers: SSE_HEADERS,
  });
}