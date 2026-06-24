import { EMPTY_HISTORY_RESPONSE } from "@/lib/history-response";

export function getAuthenticatedHistoryResponse(user) {
  return user ? null : EMPTY_HISTORY_RESPONSE;
}