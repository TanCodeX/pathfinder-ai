import { generateGeminiContent } from "./gemini.js";
import fs from "fs";
import path from "path";
import { buildSecurePrompt } from "./prompt-safety.js";
import { extractJSON } from "./validate.js";
import { buildUserProfileContext } from "./ai-context.js";

export const INDUSTRY_INSIGHT_TTL_MS = 24 * 60 * 60 * 1000;

function buildIndustryInsightPrompt(industry, profile = null) {
  return buildSecurePrompt({
    context: buildUserProfileContext(profile || { industry }),
    task: "Analyze the current state of the industry and provide grounded salary and trend insights from recent web sources.",
    untrustedData: [{ label: "industry", value: industry, maxLength: 200 }],
    outputRules: `Provide your analysis in ONLY the following JSON format. Do not output any markdown code fences, warnings, or extra text:

{
  "salaryRanges": [
    {
      "role": "string",
      "min": number,
      "max": number,
      "median": number,
      "location": "string"
    }
  ],
  "growthRate": number,
  "demandLevel": "Low" | "Medium" | "High",
  "topSkills": ["string"],
  "marketOutlook": "Positive" | "Neutral" | "Negative",
  "keyTrends": ["string"],
  "recommendedSkills": ["string"]
}

Requirements:
- Include at least 4 common roles for salary ranges with realistic figures.
- Growth rate must be a float/number (representing percentage growth).
- Provide at least 5 top skills and 5 key trends.
- Prefer salary benchmarks that can be verified from current web sources.`,
  });
}

function parseInsightResponse(result) {
  const text = result?.response?.text?.() || "";
  const parsed = JSON.parse(extractJSON(text));

  if (!parsed || !Array.isArray(parsed.salaryRanges) || parsed.salaryRanges.length === 0) {
    throw new Error("Invalid structure returned from AI.");
  }

  return parsed;
}

function getGroundedSources(result) {
  const groundingChunks = result?.response?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const sources = [];
  const seen = new Set();

  for (const chunk of groundingChunks) {
    const uri = chunk?.web?.uri;
    if (!uri || seen.has(uri)) {
      continue;
    }

    seen.add(uri);
    sources.push({
      title: chunk?.web?.title || uri,
      uri,
    });
  }

  return sources;
}

function withSalaryRangeCitations(insights, citations, isGrounded) {
  return {
    ...insights,
    isGrounded,
    salaryRanges: insights.salaryRanges.map((range) => ({
      ...range,
      citations,
    })),
  };
}

function getDefaultEstimateInsights() {
  return {
    salaryRanges: [
      {
        role: "Software Engineer",
        min: 60000,
        max: 140000,
        median: 95000,
        location: "Remote/Global",
      },
      {
        role: "Data Scientist",
        min: 70000,
        max: 160000,
        median: 110000,
        location: "Remote/Global",
      },
      {
        role: "Product Manager",
        min: 80000,
        max: 170000,
        median: 120000,
        location: "Remote/Global",
      },
    ],
    growthRate: 12.5,
    demandLevel: "High",
    topSkills: ["JavaScript", "Python", "React", "Node.js", "SQL"],
    marketOutlook: "Positive",
    keyTrends: ["AI integration in software workflows", "Cloud Native Architectures", "Security compliance focus"],
    recommendedSkills: ["TypeScript", "Next.js", "Docker", "Machine Learning basics"],
  };
}

async function generateInsightSnapshot(industry, { grounded }, profile = null) {
  const prompt = buildIndustryInsightPrompt(industry, profile);
  const generationOptions = {
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const response = grounded
    ? await generateGeminiContent(prompt, {
        ...generationOptions,
        tools: [{ googleSearchRetrieval: {} }],
      })
    : await generateGeminiContent(prompt, generationOptions);

  const parsed = parseInsightResponse(response);

  if (!grounded) {
    return withSalaryRangeCitations(parsed, [], false);
  }

  const sources = getGroundedSources(response);
  if (sources.length === 0) {
    throw new Error("No grounded sources returned from Gemini.");
  }

  return withSalaryRangeCitations(parsed, sources, true);
}

export async function generateIndustryInsightData(industry, profile = null) {
  try {
    return await generateInsightSnapshot(industry, { grounded: true }, profile);
  } catch (groundedError) {
    console.error(`Grounded Gemini lookup failed for ${industry}, falling back to estimate:`, groundedError);
    try {
      const logDir = path.resolve(process.cwd(), "logs");
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const payload = {
        time: new Date().toISOString(),
        industry,
        error: {
          name: groundedError?.name,
          message: String(groundedError?.message),
          stack: groundedError?.stack?.split("\n").slice(0, 5).join(" | "),
        },
      };
      fs.appendFileSync(path.join(logDir, "grounding-failures.log"), JSON.stringify(payload) + "\n");
    } catch (logErr) {
      console.warn("Failed to write grounding failure log:", logErr);
    }

    try {
      return await generateInsightSnapshot(industry, { grounded: false }, profile);
    } catch (estimateError) {
      console.error(`Gemini estimate fallback failed for ${industry}, using static defaults:`, estimateError);
      return withSalaryRangeCitations(getDefaultEstimateInsights(), [], false);
    }
  }
}

export function isIndustryInsightStale(industryInsight, now = Date.now()) {
  if (!industryInsight?.nextUpdate) {
    return true;
  }

  return new Date(industryInsight.nextUpdate).getTime() <= now;
}

export function getIndustryInsightRefreshTime(now = Date.now()) {
  return new Date(now + INDUSTRY_INSIGHT_TTL_MS);
}