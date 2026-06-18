import "server-only";
import { db } from "@/lib/prisma";
import { generateIndustryInsightData, getIndustryInsightRefreshTime } from "@/lib/industry-insights";

let _cronFnPromise;
let _workerFnPromise;

export function getGenerateIndustryInsights() {
  if (!_cronFnPromise) {
    _cronFnPromise = (async () => {
      const { getInngest } = await import("./client");
      const inngest = await getInngest();
      return inngest.createFunction(
        { id: "generate-industry-insights-cron", name: "Generate Industry Insights" },
        { cron: "0 0 * * *" },
        async ({ step }) => {
          const industries = await step.run("Fetch industries", async () => {
            return await db.industryInsight.findMany({
              select: { industry: true },
            });
          });

          await step.sendEvent(
            "Fan out per-industry events",
            industries.map(({ industry }) => ({
              name: "industry/insight.requested",
              data: { industry },
            }))
          );

          return { dispatched: industries.length };
        }
      );
    })();
  }
  return _cronFnPromise;
}

export function getProcessIndustryInsight() {
  if (!_workerFnPromise) {
    _workerFnPromise = (async () => {
      const { getInngest } = await import("./client");
      const inngest = await getInngest();
      return inngest.createFunction(
        { id: "process-industry-insight", name: "Process Industry Insight", concurrency: 5 },
        { event: "industry/insight.requested" },
        async ({ event, step }) => {
          const { industry } = event.data;

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

          return { industry, updated: true };
        }
      );
    })();
  }
  return _workerFnPromise;
}