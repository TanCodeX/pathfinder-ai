import { db } from "@/lib/prisma";
import { inngest } from "./client";
import { generateIndustryInsightData, getIndustryInsightRefreshTime } from "@/lib/industry-insights";

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ event, step }) => {
    const industries = await step.run("Fetch industries", async () => {
      return await db.industryInsight.findMany({
        select: { industry: true },
      });
    });

    for (const { industry } of industries) {
      const insights = await step.ai.wrap(
        "gemini",
        async () => {
          return await generateIndustryInsightData(industry);
        }
      );

      await step.run(`Update ${industry} insights`, async () => {
        await db.industryInsight.upsert({
          where: { industry },
          create: {
            industry,
            salaryRanges: insights.salaryRanges,
            growthRate: insights.growthRate,
            demandLevel: insights.demandLevel,
            topSkills: insights.topSkills,
            marketOutlook: insights.marketOutlook,
            keyTrends: insights.keyTrends,
            recommendedSkills: insights.recommendedSkills,
            isGrounded: insights.isGrounded,
            lastUpdated: new Date(),
            nextUpdate: getIndustryInsightRefreshTime(),
          },
          update: {
            salaryRanges: insights.salaryRanges,
            growthRate: insights.growthRate,
            demandLevel: insights.demandLevel,
            topSkills: insights.topSkills,
            marketOutlook: insights.marketOutlook,
            keyTrends: insights.keyTrends,
            recommendedSkills: insights.recommendedSkills,
            isGrounded: insights.isGrounded,
            lastUpdated: new Date(),
            nextUpdate: getIndustryInsightRefreshTime(),
          },
        });
      });
    }
  }
);
