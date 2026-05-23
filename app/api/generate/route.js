import { auth } from "@clerk/nextjs/server";
import { generateGeminiContentStream } from "@/lib/gemini";
import { db } from "@/lib/prisma";
import { buildSecurePrompt } from "@/lib/prompt-safety";
import {
  getRateLimitIdentifier,
  enforceRateLimit,
  buildRateLimitResponse,
} from "@/lib/rate-limit";
import {
  preparePromptForGeneration,
  buildSseErrorResponse,
} from "@/lib/prompt-guard";

export async function POST(request) {
  const { userId } = await auth();
  const endpoint = "/api/generate";
  const subject = getRateLimitIdentifier(request, userId);
  const rateLimit = enforceRateLimit({
    endpoint,
    subject,
    limitPerMinute: userId ? 20 : 5,
    burstCapacity: userId ? 10 : 5,
  });

  if (!rateLimit.allowed) {
    return buildRateLimitResponse({
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

  if (!apiKey) {
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
    return new Response(
      JSON.stringify({ error: "Invalid request body" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
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
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (conversationId) {
    const conversation = await db.conversation.findFirst({
      where: {
        id: conversationId,
        userId: user.id,
      },
    });

    if (!conversation) {
      return new Response(
        JSON.stringify({ error: "Conversation not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await db.message.create({
      data: {
        conversationId,
        role: "user",
        content: prompt,
      },
    });

    await db.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      try {
        const restrictedPrompt = buildSecurePrompt({
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

        const result = await generateGeminiContentStream(restrictedPrompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();

          if (text) {
            fullResponse += text;

            const sseMessage = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }
        }

        if (conversationId && fullResponse.trim()) {
          await db.message.create({
            data: {
              conversationId,
              role: "assistant",
              content: fullResponse,
            },
          });

          await db.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              updatedAt: new Date(),
            },
          });
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Gemini streaming error:", error?.message || error);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              error: error?.message || "Unknown error",
            })}\n\n`
          )
        );
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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
}