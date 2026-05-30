import { sanitizeInput } from "./sanitize.js";

export function validateInput(schema, data) {
  // 1. Core Fix: Run input text formatting and injection stripping BEFORE Zod constraint assessments
  const preSanitizedData = JSON.parse(JSON.stringify(data || {}), (key, value) => {
    return typeof value === "string" ? sanitizeInput(value).trim() : value;
  });

  // 2. Validate clean parameters against active schema rules
  const result = schema.safeParse(preSanitizedData);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Strips markdown code fences from AI responses before JSON parsing.
 * Handles ```json ... ``` and ``` ... ``` patterns.
 */
export function stripMarkdownFences(raw) {
  return raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

/**
 * Extracts the first complete JSON object/array embedded in arbitrary text.
 *
 * LLM responses frequently wrap JSON in conversational prose and/or markdown
 * code fences (e.g. "Here is the JSON:\n```json\n{...}\n```\nNote: ..."), which
 * makes a naive `JSON.parse` throw. This locates the first `{` or `[`, then walks
 * forward with a depth counter that is aware of string literals (so braces or
 * brackets inside quoted values do not affect nesting) and returns the exact
 * substring spanning the balanced object/array.
 *
 * @param {string} rawText - Raw AI response text.
 * @returns {string} The JSON substring (object or array) ready for `JSON.parse`.
 * @throws {Error} "No JSON payload found in AI response" when no balanced
 *   object/array can be located.
 */
export function extractJSON(rawText) {
  if (typeof rawText !== "string" || rawText.length === 0) {
    throw new Error("No JSON payload found in AI response");
  }

  const text = rawText.trim();

  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");

  let start;
  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error("No JSON payload found in AI response");
  } else if (firstBrace === -1) {
    start = firstBracket;
  } else if (firstBracket === -1) {
    start = firstBrace;
  } else {
    start = Math.min(firstBrace, firstBracket);
  }

  const openChar = text[start];
  const closeChar = openChar === "{" ? "}" : "]";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === openChar) {
      depth++;
    } else if (char === closeChar) {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  throw new Error("No JSON payload found in AI response");
}

/**
 * Extracts and parses the JSON payload from a noisy AI response.
 *
 * Combines {@link extractJSON} with `JSON.parse`, logging a consistent
 * `[AI JSON extraction error]` prefix on failure so all AI consumers share the
 * same diagnostics. Throws on either extraction or parse failure.
 *
 * @param {string} rawText - Raw AI response text.
 * @returns {any} The parsed JSON value (object or array).
 * @throws {Error} When no JSON can be extracted or the extracted JSON is invalid.
 */
export function parseAIJson(rawText) {
  let jsonString;
  try {
    jsonString = extractJSON(rawText);
  } catch (error) {
    console.error("[AI JSON extraction error]", error.message);
    throw error;
  }
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("[AI JSON extraction error] Failed to parse extracted JSON:", error.message);
    throw new Error(`Failed to parse JSON payload from AI response: ${error.message}`);
  }
}

/**
 * Validates AI-generated output against a Zod schema.
 * Extracts the embedded JSON payload from noisy text (prose and/or markdown
 * fences), parses it, then validates, returning a structured result with
 * success/errors — never throws.
 *
 * @param {import("zod").ZodSchema} schema - The output schema to validate against.
 * @param {string} rawOutput - Raw string response from Gemini.
 * @returns {{ success: boolean, data?: object, errors?: object }}
 */
export function validateOutput(schema, rawOutput) {
  if (typeof rawOutput !== "string" || !rawOutput.trim()) {
    return { success: false, errors: { _output: ["AI response was empty."] } };
  }

  let parsed;
  try {
    parsed = JSON.parse(extractJSON(rawOutput));
  } catch (error) {
    console.error("[AI JSON extraction error]", error.message);
    return { success: false, errors: { _output: ["AI response was not valid JSON."] } };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  return { success: true, data: result.data };
}
