"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateGeminiContent } from "@/lib/gemini";
import { checkRateLimit, formatResetTime } from "@/lib/rate-limit-actions";

export async function chatSalaryNegotiation(history, userMessage) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const limit = await checkRateLimit(userId, "negotiation");
  if (!limit.allowed) {
    return {
      success: false,
      error: `Salary negotiation limit reached. Resets in ${formatResetTime(limit.resetAt)}.`,
    };
  }

  // Format history for Gemini
  const formattedHistory = history.map(msg => `${msg.role === 'user' ? 'Candidate' : 'HR'}: ${msg.content}`).join("\n");
  
  const prompt = `You are a tough, realistic HR representative at a tech company negotiating a salary offer with a candidate. 
Your goal is to get the best deal for the company, but you are willing to concede if the candidate makes strong, data-backed arguments (e.g., market rate, specific skills). 
Do NOT break character. Keep your responses concise (2-3 sentences max).

Conversation so far:
${formattedHistory}
Candidate: ${userMessage}
HR:`;

  try {
    const aiResult = await generateGeminiContent(prompt);
    return { success: true, response: aiResult.response.text() };
  } catch (error) {
    console.error("Negotiation error:", error);
    return { success: false, error: "Failed to get a response." };
  }
}

export async function evaluateNegotiation(history) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const limit = await checkRateLimit(userId, "negotiation");
  if (!limit.allowed) {
    return {
      success: false,
      error: `Salary negotiation limit reached. Resets in ${formatResetTime(limit.resetAt)}.`,
    };
  }

  const formattedHistory = history.map(msg => `${msg.role === 'user' ? 'Candidate' : 'HR'}: ${msg.content}`).join("\n");
  
  const prompt = `You are an expert career coach evaluating a salary negotiation.
Analyze the following transcript and provide feedback in JSON format ONLY:
{
  "score": 85,
  "strengths": ["You anchored well.", "You remained polite but firm."],
  "weaknesses": ["You accepted the first counter-offer too quickly."],
  "overallFeedback": "Good job, but you left some money on the table."
}

Transcript:
${formattedHistory}`;

  try {
    const aiResult = await generateGeminiContent(prompt);
    let rawText = aiResult.response.text();
    // remove markdown block
    if (rawText.startsWith("\`\`\`json")) {
      rawText = rawText.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    }
    const parsed = JSON.parse(rawText);
    return { success: true, data: parsed };
  } catch (error) {
    console.error("Negotiation evaluation error:", error);
    return { success: false, error: "Failed to evaluate negotiation." };
  }
}
