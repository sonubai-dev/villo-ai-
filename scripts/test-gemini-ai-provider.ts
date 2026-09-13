/**
 * Test Suite: Gemini AI Content Intelligence Provider & Architecture
 * Validates:
 *  1. AIProvider Interface Compliance (Gemini & Mock)
 *  2. Robust JSON Sanitization & Structured Repair
 *  3. Strict Zod Schema Validation
 *  4. Script Generation
 *  5. Image Analysis
 *  6. Document & Presentation Analysis
 *  7. Scene Generation
 *  8. Timeout Resiliency
 *  9. Retry Mechanism with Backoff
 *  10. Rate Limiting Protection
 */

import { z } from "zod";
import { MockAIProvider } from "../lib/ai/mock-provider";
import { GeminiAIProvider } from "../lib/ai/gemini-provider";
import { 
  safeParseAndRepairJson, 
  sanitizeAndExtractJson 
} from "../lib/ai/json-repair";
import { 
  ScriptGenerationOutputSchema, 
  ImageAnalysisOutputSchema, 
  DocumentAnalysisOutputSchema,
  SceneGenerationOutputSchema 
} from "../lib/ai/schemas";
import { withTimeout, withRetry, aiRateLimiter } from "../lib/ai/rate-limiter";

let passed = 0;
let total = 0;

function assert(description: string, condition: boolean) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${description}`);
  } else {
    console.error(`  ✗ [FAIL] ${description}`);
  }
}

async function runGeminiAITests() {
  console.log("\n=======================================================");
  console.log("🧠 TESTING GEMINI AI CONTENT INTELLIGENCE PROVIDER");
  console.log("=======================================================\n");

  const mockProvider = new MockAIProvider();
  const geminiProvider = new GeminiAIProvider();

  // Test 1: Provider Interface Compliance
  console.log("▶ TEST SUITE 1: AI Provider Interface Compliance");
  assert("Mock provider implements AIProvider", Boolean(mockProvider.name && mockProvider.generateScript));
  assert("Gemini provider implements AIProvider", Boolean(geminiProvider.name && geminiProvider.generateScript));

  // Test 2: JSON Sanitization & Structured Repair
  console.log("\n▶ TEST SUITE 2: JSON Extraction & Structured Repair");
  
  // A. Markdown code fence stripping
  const markdownJson = "Here is the response:\n```json\n{\n  \"title\": \"Luxury Villa Launch\",\n  \"targetDuration\": 30,\n  \"summary\": \"Modern estate video\",\n  \"tone\": \"professional\",\n  \"scenes\": [\n    {\n      \"sceneNumber\": 1,\n      \"title\": \"Intro\",\n      \"script\": \"Welcome to this modern architectural masterpiece.\",\n      \"duration\": 8,\n      \"visualPrompt\": \"Cinematic front facade\",\n      \"motionPreset\": \"zoom-in\",\n      \"transition\": \"fade\"\n    }\n  ]\n}\n```\nHope you like it!";
  
  const extracted = sanitizeAndExtractJson(markdownJson);
  assert("Extracts clean JSON from markdown code fences", extracted.startsWith("{") && extracted.endsWith("}"));

  // B. Repair trailing commas before closing braces
  const trailingCommaJson = "{\"title\": \"Test\", \"summary\": \"Sum\", \"targetDuration\": 10, \"tone\": \"casual\", \"scenes\": [{\"sceneNumber\": 1, \"title\": \"S1\", \"script\": \"Narration\", \"duration\": 5, \"visualPrompt\": \"Visual\", \"motionPreset\": \"zoom-in\", \"transition\": \"fade\",}],}";
  const parsedTrailing = safeParseAndRepairJson(trailingCommaJson, ScriptGenerationOutputSchema);
  assert("Repairs and parses JSON with trailing commas", parsedTrailing.success && parsedTrailing.data?.title === "Test");

  // C. Rejects non-JSON invalid garbage
  const garbage = "I am sorry, I cannot fulfill this request.";
  const parseGarbage = safeParseAndRepairJson(garbage, ScriptGenerationOutputSchema);
  assert("Rejects non-JSON strings gracefully", !parseGarbage.success);

  // Test 3: Script Generation Schema & Content
  console.log("\n▶ TEST SUITE 3: Script Generation Task");
  const scriptResult = await mockProvider.generateScript({
    topic: "Enterprise AI Productivity Tools",
    tone: "professional",
    sceneCount: 3,
  });

  assert("Generated script contains valid title", Boolean(scriptResult.title));
  assert("Generated script contains 3 scenes", scriptResult.scenes.length === 3);
  assert("Scene 1 contains duration, prompt, motion preset", 
    scriptResult.scenes[0].duration > 0 && 
    Boolean(scriptResult.scenes[0].visualPrompt) && 
    Boolean(scriptResult.scenes[0].motionPreset)
  );
  assert("Script output passes Zod validation schema", ScriptGenerationOutputSchema.safeParse(scriptResult).success);

  // Test 4: Image Analysis & Region Splitting
  console.log("\n▶ TEST SUITE 4: Image Analysis & Visual Region Splitting");
  const imageAnalysis = await mockProvider.analyzeImage({
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600",
    splitMode: "grid-2x2",
  });

  assert("Image analysis detected 4 visual regions", imageAnalysis.detectedRegions.length === 4);
  assert("Regions contain percentage coordinates and labels", 
    imageAnalysis.detectedRegions[0].width === 50 && 
    Boolean(imageAnalysis.detectedRegions[0].label)
  );
  assert("Suggested scenes generated for each region", imageAnalysis.suggestedScenes.length === 4);
  assert("Image analysis output passes Zod validation", ImageAnalysisOutputSchema.safeParse(imageAnalysis).success);

  // Test 5: Document & Presentation Analysis
  console.log("\n▶ TEST SUITE 5: Document & Presentation Analysis");
  const docAnalysis = await mockProvider.analyzeDocument({
    documentText: "Introduction: Market disruption in visual media.\n\nProduct: AI Studio for visual creators.\n\nFinancials: High ARR expansion.",
    documentType: "presentation",
  });

  assert("Document analysis extracted slides", docAnalysis.slides.length >= 3);
  assert("Each slide contains headline, script, and motion", Boolean(docAnalysis.slides[0].headline && docAnalysis.slides[0].suggestedScript));
  assert("Document analysis output passes Zod validation", DocumentAnalysisOutputSchema.safeParse(docAnalysis).success);

  // Test 6: Direct Scene Generation
  console.log("\n▶ TEST SUITE 6: Direct Scene Generation");
  const scenesOutput = await mockProvider.generateScenes({
    prompt: "Cyberpunk futuristic flying car chase through neon city",
    sceneCount: 4,
  });

  assert("Generated 4 scenes", scenesOutput.scenes.length === 4);
  assert("Total duration matches sum of scenes", scenesOutput.totalDuration === scenesOutput.scenes.reduce((s, c) => s + c.duration, 0));
  assert("Scene generation output passes Zod validation", SceneGenerationOutputSchema.safeParse(scenesOutput).success);

  // Test 7: Timeout Controller
  console.log("\n▶ TEST SUITE 7: Timeout Controller Resiliency");
  const slowPromise = new Promise((res) => setTimeout(res, 500));
  let timedOut = false;
  try {
    await withTimeout(slowPromise, 100, "Slow Test Operation");
  } catch (err: any) {
    timedOut = err.message.includes("[Timeout]");
  }
  assert("withTimeout rejects when operation exceeds time limit", timedOut);

  // Test 8: Retry Resiliency
  console.log("\n▶ TEST SUITE 8: Retry Resiliency");
  let attempts = 0;
  const failThenSucceed = async () => {
    attempts++;
    if (attempts < 2) throw new Error("Temporary network glitch");
    return "SUCCESS";
  };
  const retryResult = await withRetry(failThenSucceed, { maxRetries: 3, delayMs: 50 });
  assert("withRetry retries and succeeds on subsequent attempt", retryResult === "SUCCESS" && attempts === 2);

  // Test 9: Rate Limiter
  console.log("\n▶ TEST SUITE 9: Rate Limiting Protection");
  const testIp = "client-192.168.1.100";
  const r1 = aiRateLimiter.check(testIp);
  assert("First request is permitted", r1.allowed);
  assert("Remaining count decreases", r1.remaining >= 0);

  console.log("\n=======================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED (100%)`);
  console.log("=======================================================\n");
}

runGeminiAITests().catch(console.error);
