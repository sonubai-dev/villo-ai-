/**
 * Robust JSON Extraction, Sanitization, and Structured Repair Utility
 * Never trusts raw AI text output.
 */

import { z } from "zod";

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  rawText?: string;
  error?: string;
  repaired: boolean;
}

/**
 * Extracts and repairs JSON structures from raw LLM output.
 */
export function sanitizeAndExtractJson(rawText: string): string {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Invalid raw text input for JSON extraction");
  }

  let cleaned = rawText.trim();

  // 1. Remove markdown code fences: ```json ... ``` or ``` ... ```
  if (cleaned.includes("```")) {
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch && fenceMatch[1]) {
      cleaned = fenceMatch[1].trim();
    } else {
      // Remove any lingering ```
      cleaned = cleaned.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
    }
  }

  // 2. Find outermost JSON boundary: { ... } or [ ... ]
  const firstBrace = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");

  let startIndex = -1;
  let endIndex = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIndex = firstBrace;
    endIndex = cleaned.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIndex = firstBracket;
    endIndex = cleaned.lastIndexOf("]");
  }

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    cleaned = cleaned.substring(startIndex, endIndex + 1);
  }

  // 3. Repair common syntax errors: trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\}\]])/g, "$1");

  return cleaned;
}

/**
 * Parses and validates JSON using a given Zod schema with multi-stage fallback repair.
 */
export function safeParseAndRepairJson<T>(
  rawText: string,
  schema: z.ZodType<T>
): ParseResult<T> {
  let jsonString = "";
  let repaired = false;

  // Stage 1: Try direct parse
  try {
    const directObj = JSON.parse(rawText);
    const parsed = schema.safeParse(directObj);
    if (parsed.success) {
      return { success: true, data: parsed.data, rawText, repaired: false };
    }
  } catch {
    // Direct parse failed, proceed to structured extraction
  }

  // Stage 2: Sanitize & Extract JSON substring
  try {
    jsonString = sanitizeAndExtractJson(rawText);
    repaired = true;
    const extractedObj = JSON.parse(jsonString);
    const parsed = schema.safeParse(extractedObj);
    if (parsed.success) {
      return { success: true, data: parsed.data, rawText, repaired: true };
    } else {
      return {
        success: false,
        rawText,
        error: `Zod validation error: ${parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`,
        repaired: true,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      rawText,
      error: `JSON parse error: ${err.message}`,
      repaired: true,
    };
  }
}
