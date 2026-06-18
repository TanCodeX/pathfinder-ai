"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { getIndustryInsightRefreshTime } from "@/lib/industry-insights";
import { validateInput } from "@/lib/validate";
import { userProfileSchema } from "@/lib/schemas/forms";

/**
 * Updates the current user's profile with industry and other info.
 * `data` is expected to hold: { industry, currentRole?, targetRole?, careerGoals?, experience?, bio?, skills? }
 */
export async function updateUser(data) {
  try {
    const validation = validateInput(userProfileSchema, data);

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    const profileData = validation.data;

    const { userId } = await auth();
    if (!userId) throw new Error("Please sign in to complete onboarding");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    // Generate industry insights outside the DB transaction to avoid
    // long-running external calls inside a DB tx (which can cause timeouts).
    let precomputedInsights = null;
    try {
      let existingInsight = await db.industryInsight.findUnique({
        where: { industry: data.industry },
      });

      if (!existingInsight) {
        precomputedInsights = await generateAIInsights(data.industry);
      }
      precomputedInsights = await generateAIInsights(
        profileData.industry,
        profileData
      );
    } catch (e) {
      console.error("Failed to generate insights pre-transaction:", e);
      precomputedInsights = null;
    }

    const result = await db.$transaction(async (tx) => {
      const industryInsight = precomputedInsights
        ? await tx.industryInsight.upsert({
            where: { industry: profileData.industry },
            update: {},
            create: {
              industry: profileData.industry,
              ...precomputedInsights,
              nextUpdate: getIndustryInsightRefreshTime(),
            },
          })
        : await tx.industryInsight.findUnique({
            where: { industry: profileData.industry },
          });

      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          industry: profileData.industry,
          currentRole: profileData.currentRole ?? null,
          targetRole: profileData.targetRole ?? null,
          careerGoals: profileData.careerGoals ?? null,
          experience: profileData.experience ?? null,
          bio: profileData.bio ?? null,
          skills: profileData.skills ?? [],
        },
      });
      return { updatedUser, industryInsight };
    });

    revalidatePath("/");
    revalidatePath("/settings");

    return { success: true, user: result.updatedUser, industryInsight: result.industryInsight };
  } catch (error) {
    console.error("Error updating user and industry:", error);
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    return { success: false, error: error.message || "Failed to update profile" };
  }
}

/**
 * Gets the user's onboarding status.
 * If the user doesn't exist in the app DB yet, create it from Clerk.
 * Returns: { isOnboarded: boolean }
 */
export async function getUserOnboardingStatus() {
  try {
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
      const backend = await clerkClient();
      const clerkUser = await backend.users.getUser(userId);

      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) throw new Error("User email not found in Clerk!");

      /* 2 ▸ create or update the user row safely */
      try {
        user = await db.user.upsert({
          where: { clerkUserId: userId },
          update: {
            name: clerkUser.firstName ?? "",
            imageUrl: clerkUser.imageUrl ?? "",
          },
          create: {
            clerkUserId: userId,
            email,
            name: clerkUser.firstName ?? "",
            imageUrl: clerkUser.imageUrl ?? "",
          },
        });
      } catch (error) {
        if (error.code === "P2002") {
          user = await db.user.findUnique({
            where: { clerkUserId: userId },
          });
        } else {
          throw error;
        }
      }
    }

    return { isOnboarded: Boolean(user?.industry), user, isSignedIn: true };
  } catch (error) {
    console.error("Error fetching onboarding status:", error);
    if (process.env.NODE_ENV === "test") {
      throw error;
    }
    return { isOnboarded: false, user: null, isSignedIn: false, error: error.message };
  }
}
