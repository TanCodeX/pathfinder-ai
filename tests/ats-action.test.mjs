import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  findUniqueUser: vi.fn(),
  atsAnalysisCreate: vi.fn(),
  aiRateLimitFindUnique: vi.fn(),
  aiRateLimitUpsert: vi.fn(),
  aiRateLimitUpdate: vi.fn(),
  cachedGenerateGeminiContent: vi.fn(),
  generateCacheKey: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  db: {
    user: {
      findUnique: mocks.findUniqueUser,
    },
    atsAnalysis: {
      create: mocks.atsAnalysisCreate,
    },
    aiRateLimit: {
      findUnique: mocks.aiRateLimitFindUnique,
      upsert: mocks.aiRateLimitUpsert,
      update: mocks.aiRateLimitUpdate,
    },
  },
}));

vi.mock("@/lib/cache", async () => {
  const actual = await vi.importActual("@/lib/cache");
  return {
    ...actual,
    cachedGenerateGeminiContent: mocks.cachedGenerateGeminiContent,
    generateCacheKey: mocks.generateCacheKey,
  };
});

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { analyzeATS } from "../actions/ats.js";

describe("analyzeATS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses cachedGenerateGeminiContent with a specific cache key", async () => {
    const rawParams = {
      resumeContent: "Experienced Developer...",
      jobDescription: "Looking for a Senior Developer...",
      jobTitle: "Senior Developer",
      companyName: "Tech Corp",
    };

    mocks.auth.mockResolvedValue({ userId: "user-1" });
    mocks.findUniqueUser.mockResolvedValue({ id: "db-user-1", clerkUserId: "user-1" });
    mocks.aiRateLimitUpsert.mockResolvedValue({ count: 1 });
    mocks.generateCacheKey.mockReturnValue("ats:test-key");
    mocks.cachedGenerateGeminiContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          atsScore: 85,
          matchedKeywords: ["React", "Node.js"],
          missingKeywords: ["GraphQL"],
          suggestions: [{ category: "Skills", tip: "Add GraphQL" }],
          highlights: [
            {
              type: "weak_impact",
              text: "Experienced Developer...",
              suggestion: "Quantify your achievements."
            }
          ],
          overallFeedback: "Great match!",
        }),
      },
    });
    mocks.atsAnalysisCreate.mockResolvedValue({ id: "analysis-1" });

    const result = await analyzeATS(rawParams);

    expect(result.success).toBe(true);
    expect(mocks.generateCacheKey).toHaveBeenCalledWith(
      "ats",
      rawParams.resumeContent,
      rawParams.jobDescription,
      rawParams.jobTitle,
      rawParams.companyName
    );
    expect(mocks.cachedGenerateGeminiContent).toHaveBeenCalledWith(
      expect.any(String),
      {},
      expect.objectContaining({
        key: "ats:test-key",
        ttl: expect.any(Number),
      })
    );
    expect(mocks.atsAnalysisCreate).toHaveBeenCalled();
  });
});
