import { getUserByClerkId } from "@/lib/user";

export async function getHistoryUser(userId) {
  return getUserByClerkId(userId);
}