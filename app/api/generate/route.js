import { auth } from "@clerk/nextjs/server";
import handleGenerate from "@/lib/generate-handler";

export async function POST(request) {
  const { userId } = await auth();

  // Delegate to the testable handler. Keep runtime behavior identical.
  return handleGenerate(request, userId);
}