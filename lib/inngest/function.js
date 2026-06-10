import { db } from "@/lib/prisma";
import { generateIndustryInsightData, getIndustryInsightRefreshTime } from "@/lib/industry-insights";

let _fnPromise;

<<<<<<< HEAD
    for (const { industry } of industries) {
      const insights = await step.ai.wrap(
        "gemini",
        async () => {
          return await generateIndustryInsightData(industry);
=======
export function getGenerateIndustryInsights() {
  if (!_fnPromise) {
    _fnPromise = (async () => {
      const { getInngest } = await import("./client");
      const inngest = await getInngest();
      return inngest.createFunction(
        { name: "Generate Industry Insights" },
        { cron: "0 0 * * *" },
        async ({ event, step }) => {
          const industries = await step.run("Fetch industries", async () => {
            return await db.industryInsight.findMany({
              select: { industry: true },
            });
          });

          for (const { industry } of industries) {
            const insights = await step.ai.wrap(
              "gemini",
              async (insightIndustry) => {
                return await generateIndustryInsightData(insightIndustry);
              },
              industry
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
>>>>>>> d7f2f9f (dockerization and production check)
        }
      );
    })();
  }
  return _fnPromise;
}
