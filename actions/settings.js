"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { validateInput } from "@/lib/validate";
import { userSettingsSchema } from "@/lib/schemas/forms";

async function getUserByClerkId(userId) {
  try {
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error("[Settings Action] Error fetching user:", error.message);
    throw error;
  }
}

function normalizeSettings(settings) {
  if (!settings) return { notifications: true, emailAlerts: true };
  return {
    notifications: settings.notifications ?? true,
    emailAlerts: settings.emailAlerts ?? true,
  };
}

export async function getUserSettings(userId) {
  const { userId: authenticatedUserId } = await auth();

  if (!authenticatedUserId || authenticatedUserId !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    const user = await getUserByClerkId(userId);

    const existingSettings = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    return normalizeSettings(existingSettings);
  } catch (error) {
    console.error("[Settings Action] Error in getUserSettings:", error.message);
    // Return default settings if DB call fails (e.g. table missing)
    return normalizeSettings(null);
  }
}

export async function updateUserSettings(userId, data) {
  const { userId: authenticatedUserId } = await auth();

  if (!authenticatedUserId || authenticatedUserId !== userId) {
    throw new Error("Unauthorized");
  }

  try {
    const validation = validateInput(userSettingsSchema, data);

    if (!validation.success) {
      return { success: false, errors: validation.errors };
    }

    const user = await getUserByClerkId(userId);
    const settingsData = validation.data;

    const existingSettings = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    if (!existingSettings) {
      await db.userSettings.create({
        data: { userId: user.id },
      });
    }

    const settings = await db.userSettings.update({
      where: { userId: user.id },
      data: settingsData,
    });

    revalidatePath("/settings");
    return normalizeSettings(settings);
  } catch (error) {
    console.error("[Settings Action] Error in updateUserSettings:", error.message);
    throw new Error("Failed to update settings. Please ensure database migrations are applied.");
  }
}
