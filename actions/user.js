"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { getIndustryInsightRefreshTime } from "@/lib/industry-insights";

/**
 * Updates the current user's profile with industry and other info.
 * `data` is expected to hold: { industry, currentRole?, targetRole?, careerGoals?, experience?, bio?, skills? }
 */
export async function updateUser(data) {
  if (!data?.industry) throw new Error("Industry is required");

  const { userId } = await auth();
  if (!userId) throw new Error("Please sign in to complete onboarding");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  try {
    // Generate industry insights outside the DB transaction to avoid
    // long-running external calls inside a DB tx (which can cause timeouts).
    let precomputedInsights = null;
    let existingInsight = await db.industryInsight.findUnique({
      where: { industry: data.industry },
    });

    if (!existingInsight) {
      try {
        precomputedInsights = await generateAIInsights(data.industry, data);
      } catch (e) {
        // generateAIInsights already handles fallbacks, but guard here
        console.error("Failed to generate insights pre-transaction:", e);
        precomputedInsights = null;
      }
    }

    const result = await db.$transaction(
      async (tx) => {
        /* -----------------------------------------------------------
         * 1. Ensure an IndustryInsight row exists (create if missing)
         * --------------------------------------------------------- */
        let industryInsight = await tx.industryInsight.findUnique({
          where: { industry: data.industry },
        });

        if (!industryInsight) {
          const insights = precomputedInsights ?? (await generateAIInsights(data.industry, data));

          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: getIndustryInsightRefreshTime(),
            },
          });
        }

        /* ----------------------------------------------
         * 2. Update the user with the new profile fields
         * -------------------------------------------- */
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: {
            industry: data.industry,
            currentRole: data.currentRole ?? null,
            targetRole: data.targetRole ?? null,
            careerGoals: data.careerGoals ?? null,
            experience: data.experience,
            bio: data.bio,
            skills: data.skills,
          },
        });

        return { updatedUser, industryInsight };
      },
      { timeout: 10_000 }
    );

    revalidatePath("/");
    revalidatePath("/settings");
    return result.updatedUser;
  } catch (err) {
    console.error("Error updating user and industry:", err);
    throw new Error("Failed to update profile");
  }
}

/**
 * Gets the user's onboarding status.
 * If the user doesn't exist in the app DB yet, create it from Clerk.
 * Returns: { isOnboarded: boolean }
 */
export async function getUserOnboardingStatus() {
  const { userId } = await auth();

  if (!userId) {
    return { isOnboarded: false, user: null, isSignedIn: false };
  }

  /* 1 ▸ look up by Clerk ID */
  let user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    /* 2 ▸ pull data from Clerk */
    const backend   = await clerkClient();
    const clerkUser = await backend.users.getUser(userId);

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) throw new Error("User email not found in Clerk!");

    /* 2a ▸ try to find an existing row with this e-mail */
    user = await db.user.findUnique({ where: { email } });

    if (user) {
      /* Row exists → just link the clerkUserId (and refresh meta) */
      user = await db.user.update({
        where: { id: user.id },
        data: {
          clerkUserId: userId,
          name: clerkUser.firstName ?? user.name,
          imageUrl: clerkUser.imageUrl ?? user.imageUrl,
        },
      });
    } else {
      /* 3 ▸ otherwise create a brand-new row */
      user = await db.user.create({
        data: {
          clerkUserId: userId,
          email,
          name: clerkUser.firstName ?? "",
          imageUrl: clerkUser.imageUrl ?? "",
        },
      });
    }
  }

  return { isOnboarded: Boolean(user.industry), user, isSignedIn: true };
}