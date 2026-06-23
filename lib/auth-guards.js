import { UNAUTHORIZED_RESPONSE } from "@/lib/auth-errors";

export function requireAuthenticatedUser(userId) {
  return userId ? null : UNAUTHORIZED_RESPONSE;
}