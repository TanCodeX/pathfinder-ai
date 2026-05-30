"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { generateGeminiContent } from "@/lib/gemini";
import { buildSecurePrompt } from "@/lib/prompt-safety";
import { buildUserProfileContext } from "@/lib/ai-context";

export async function chatWithGemini(prompt) {
  if (!prompt) throw new Error("Prompt is required");

  const { userId } = await auth();
  const user = userId
    ? await db.user.findUnique({
        where: { clerkUserId: userId },
      })
    : null;

  const securePrompt = buildSecurePrompt({
    context: buildUserProfileContext(user),
    task: "You are Pathfinder AI, a career-focused assistant. Only answer career-related questions. Politely refuse unrelated questions.",
    untrustedData: [
      { label: "userQuery", value: prompt, maxLength: 4000 },
    ],
  });

  try {
    const { response } = await generateGeminiContent(securePrompt);
    return response.text();
  } catch (err) {
    // surface Google error message if present
    const message =
      err?.response?.error?.message || err?.message || "Unknown Gemini error";
    console.error("Gemini API error:", message);
    throw new Error("Failed to get response from Gemini AI");
  }
}
