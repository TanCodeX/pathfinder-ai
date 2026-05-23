import { auth } from "@clerk/nextjs/server";
import { generateGeminiContentStream } from "@/lib/gemini";
import {
  buildRateLimitResponse,
  enforceRateLimit,
  getRateLimitIdentifier,
} from "@/lib/rate-limit";

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

  try {
    const body = await request.json();
    prompt = body.prompt;
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
    return new Response(
      JSON.stringify({ error: "Prompt is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const allowedKeywords = [
          "hi",
          "hello",
          "hey",
          "good morning",
          "good afternoon",
          "good evening",
          "thanks",
          "thank you",
          "help",
          "guide me",
          "career",
          "job",
          "jobs",
          "profession",
          "professional",
          "growth",
          "career path",
          "career switch",
          "future",
          "resume",
          "cv",
          "cover letter",
          "linkedin",
          "portfolio",
          "application",
          "apply",
          "hiring",
          "recruiter",
          "recruitment",
          "interview",
          "interviews",
          "mock interview",
          "technical interview",
          "hr interview",
          "behavioral interview",
          "skill",
          "skills",
          "learn",
          "learning",
          "roadmap",
          "certification",
          "course",
          "upskill",
          "internship",
          "internships",
          "placement",
          "placements",
          "freelance",
          "remote job",
          "salary",
          "package",
          "ctc",
          "developer",
          "software engineer",
          "frontend",
          "backend",
          "full stack",
          "web developer",
          "app developer",
          "android developer",
          "ios developer",
          "data analyst",
          "data scientist",
          "machine learning",
          "ai engineer",
          "devops",
          "cloud",
          "cybersecurity",
          "ui ux",
          "product manager",
          "qa engineer",
          "java",
          "python",
          "javascript",
          "typescript",
          "react",
          "nextjs",
          "node",
          "express",
          "mongodb",
          "sql",
          "mysql",
          "postgresql",
          "firebase",
          "aws",
          "docker",
          "kubernetes",
          "git",
          "github",
          "dsa",
          "algorithms",
          "system design",
          "college",
          "degree",
          "engineering",
          "btech",
          "student",
          "graduation",
          "campus placement",
        ];

        const lowerPrompt = prompt.toLowerCase();

        const allowed = allowedKeywords.some((keyword) =>
          lowerPrompt.includes(keyword)
        );

        if (!allowed) {
          const fallback =
            "I can only assist with career-related queries such as jobs, interviews, resumes, and skill development.";

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: fallback })}\n\n`
            )
          );

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        const restrictedPrompt = `
You are Pathfinder AI, a career-focused assistant.

Only answer career-related questions.
Politely refuse unrelated questions.

User Query: ${prompt}
`;

        const result = await generateGeminiContentStream(restrictedPrompt);

        for await (const chunk of result.stream) {
          const text = chunk.text();

          if (text) {
            const sseMessage = `data: ${JSON.stringify({ text })}\n\n`;
            controller.enqueue(encoder.encode(sseMessage));
          }
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