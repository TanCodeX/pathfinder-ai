"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserSettings() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: { settings: true },
  });

  if (!user) return null;

  if (user.settings) return user.settings;

  // Create default settings if they don't exist
  return await db.userSettings.create({
    data: { userId: user.id },
  });
}

export async function updateUserSettings(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });
  if (!user) throw new Error("User not found");

  const settings = await db.userSettings.upsert({
    where: { userId: user.id },
    update: data,
    create: { userId: user.id, ...data },
  });

  revalidatePath("/settings");
  return settings;
}
