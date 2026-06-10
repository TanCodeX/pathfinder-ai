"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { buildSecurePrompt, parseAIJson } from "@/lib/prompt-safety";
import { generateGeminiContent } from "@/lib/gemini";

export async function compareOffers(offers) {
  const { userId } = await auth();
  if (!userId) return { success: false, errors: { _form: ["Unauthorized"] } };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, errors: { _form: ["User not found"] } };

  if (!offers || offers.length < 2) {
    return { success: false, errors: { _form: ["Please provide at least two offers to compare."] } };
  }

  const prompt = buildSecurePrompt({
    context: "You are an expert career strategist and executive compensation negotiator.",
    task: `Analyze the provided job offers. Calculate the true total compensation (ignoring complex tax implications but factoring in base, bonus, and equity).
    Provide a highly strategic recommendation on which offer the candidate should accept, taking into account the financial differences, remote work flexibility, and potential career trajectory.`,
    untrustedData: [
      { label: "offersData", value: JSON.stringify(offers), maxLength: 5000 },
    ],
    outputRules: `Provide the output in the following JSON format ONLY:
{
  "recommendation": "A 2-3 paragraph strategic analysis declaring a clear winner and explaining why.",
  "negotiationLeverage": "A short sentence or two on how they could use the losing offer to negotiate the winning offer higher."
}`,
  });

  try {
    const aiResult = await generateGeminiContent(prompt);
    const parsedData = parseAIJson(aiResult.response.text());

    // Basic calculation for UI
    const processedOffers = offers.map(o => {
      const base = parseFloat(o.baseSalary) || 0;
      const bonus = parseFloat(o.bonus) || 0;
      const equity = parseFloat(o.equity) || 0;
      return {
        ...o,
        totalCompensation: base + bonus + equity
      };
    });

    const record = await db.offerComparison.create({
      data: {
        userId: user.id,
        offers: processedOffers,
        analysis: parsedData,
      },
    });

    revalidatePath("/offer-comparer");
    return { success: true, data: record };
  } catch (error) {
    console.error("Offer Comparison Error:", error);
    return { success: false, errors: { _form: [error.message || "Failed to compare offers"] } };
  }
}

export async function getOfferComparisons() {
  const { userId } = await auth();
  if (!userId) return { success: false, data: [] };

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) return { success: false, data: [] };

  const records = await db.offerComparison.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, data: records };
}
