import { db } from "@/lib/prisma";

export async function getUserByScope(userId) {
  return db.user.findUnique({
    where: { clerkUserId: userId },
  });
}