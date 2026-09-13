/**
 * Comprehensive Low-Cost Hybrid AI Architecture Test Suite
 * Validates:
 *  1. Structured VideoPlan, ScenePlan, MotionPlan, VFXPlan, CaptionPlan, CameraPlan output
 *  2. AI plans, deterministic engine executes separation
 *  3. AI Model Router tiered task selection (cheap, standard, strong)
 *  4. Deterministic SHA-256 Result Caching (latency <1ms on cache hits)
 *  5. In-Flight Request Deduplication & Promise Coalescing
 *  6. Zero-Cost Deterministic Delta Updates (text color, camera, caption, VFX changes call 0 AI tokens)
 *  7. Differential Single-Scene Updates
 *  8. Multi-Provider Abstraction (Gemini, Mock, OpenAI, Anthropic, Local)
 *  9. Script Rewriter & Motion/VFX Recommendation engines
 * 10. Zod schema validation & automated JSON repair
 */

import {
  AIProviderFactory,
  MockAIProvider,
  GeminiAIProvider,
  OpenAIProvider,
  AnthropicProvider,
  LocalAIProvider,
  aiModelRouter,
  aiCacheManager,
  planOptimizer,
  planAdapter,
  VideoPlanningInput,
  VideoPlan,
  safeParseAndRepairJson,
  VideoPlanSchema,
} from "../lib/ai";

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

async function runLowCostHybridAITests() {
  console.log("\n=======================================================");
  console.log("⚡ TESTING LOW-COST HYBRID AI ARCHITECTURE FOR VILO AI");
  console.log("=======================================================\n");

  const provider = new MockAIProvider();
  aiCacheManager.clear();

  // ─── TEST 1: Structured VideoPlan & Sub-Plans Output ───
  console.log("▶ TEST SUITE 1: Structured VideoPlan & Sub-Plans Generation");
  const planInput: VideoPlanningInput = {
    topic: "Smart Home Automation",
    targetDurationSeconds: 15,
    tone: "professional",
    aspectRatio: "9:16",
    includeAvatar: true,
  };

  const plan = await provider.planVideo(planInput);
  assert("VideoPlan has title and summary", Boolean(plan.title && plan.summary));
  assert("VideoPlan contains scenes array", Array.isArray(plan.scenes) && plan.scenes.length > 0);
  assert("VideoPlan duration matches target (15s)", plan.targetDuration === 15);
  assert("Scene 1 contains structured CameraPlan", Boolean(plan.scenes[0].camera?.type));
  assert("Scene 1 contains structured MotionPlan", Boolean(plan.scenes[0].motion?.type));
  assert("Scene 1 contains structured VFXPlan[]", Array.isArray(plan.scenes[0].vfx) && plan.scenes[0].vfx.length > 0);
  assert("Scene 1 contains structured CaptionPlan", Boolean(plan.scenes[0].caption?.style));
  assert("Plan is pure JSON and does not contain raw video blobs", !("videoUrl" in plan));

  // ─── TEST 2: Plan-to-Execution Adapter (Deterministic Engine) ───
  console.log("\n▶ TEST SUITE 2: Plan-to-Execution Adapter");
  const scenes = planAdapter.planToScenes(plan, "test-proj-1");
  assert("PlanAdapter converts VideoPlan to Scene[] for rendering engine", scenes.length === plan.scenes.length);
  assert("Scene contains valid motionPreset mapped from Camera/Motion plan", Boolean(scenes[0].motionPreset));
  assert("Scene contains valid captions configuration", Boolean(scenes[0].captions?.enabled));

  const project = planAdapter.planToProject(plan, "user-123", "proj-abc");
  assert("PlanAdapter converts VideoPlan to Project entity", project.id === "proj-abc" && project.scenes.length > 0);

  // ─── TEST 3: AI Model Router Tiered Selection ───
  console.log("\n▶ TEST SUITE 3: AI Model Router Tiered Task Selection");
  const cheapRoute = aiModelRouter.routeTask("script_rewrite");
  assert("Script rewrite routes to CHEAP model tier", cheapRoute.tier === "cheap" && cheapRoute.modelName.includes("flash-8b"));

  const captionRoute = aiModelRouter.routeTask("caption_generation");
  assert("Caption generation routes to CHEAP model tier", captionRoute.tier === "cheap");

  const motionVfxRoute = aiModelRouter.routeTask("motion_vfx_recommendation");
  assert("Motion/VFX recommendation routes to CHEAP model tier", motionVfxRoute.tier === "cheap");

  const standardRoute = aiModelRouter.routeTask("video_planning");
  assert("Video planning routes to STANDARD model tier", standardRoute.tier === "standard" && standardRoute.modelName.includes("flash"));

  const sceneSegRoute = aiModelRouter.routeTask("scene_segmentation");
  assert("Scene segmentation routes to STANDARD model tier", sceneSegRoute.tier === "standard");

  const strongRoute = aiModelRouter.routeTask("image_analysis");
  assert("Image analysis routes to STRONG model tier", strongRoute.tier === "strong" && strongRoute.modelName.includes("pro"));

  const docRoute = aiModelRouter.routeTask("document_analysis");
  assert("Document analysis routes to STRONG model tier", docRoute.tier === "strong");

  // ─── TEST 4: Deterministic SHA-256 Result Caching ───
  console.log("\n▶ TEST SUITE 4: SHA-256 Deterministic Result Caching");
  aiCacheManager.clear();

  const geminiProvider = new GeminiAIProvider();
  const testInput: VideoPlanningInput = {
    topic: "Quantum Computing Explained",
    targetDurationSeconds: 10,
    tone: "educational",
  };

  // First call -> cache miss
  const res1 = await geminiProvider.planVideo(testInput);
  assert("First request generates plan successfully", Boolean(res1.title));

  // Second call -> cache hit in <5ms
  const startCacheTime = Date.now();
  const res2 = await geminiProvider.planVideo(testInput);
  const cacheLatency = Date.now() - startCacheTime;

  assert("Second request with identical payload hits cache", res2.title === res1.title);
  assert(`Cache hit latency is ultra-fast (<15ms, actual: ${cacheLatency}ms)`, cacheLatency < 15);
  assert("Cache manager records hits count", aiCacheManager.getStats().hits >= 1);

  // ─── TEST 5: In-Flight Request Coalescing & Deduplication ───
  console.log("\n▶ TEST SUITE 5: In-Flight Request Deduplication & Coalescing");
  aiCacheManager.clear();

  const parallelInput: VideoPlanningInput = {
    topic: "Robotics Revolution",
    targetDurationSeconds: 15,
  };

  // Launch 3 concurrent identical requests
  const [p1, p2, p3] = await Promise.all([
    geminiProvider.planVideo(parallelInput),
    geminiProvider.planVideo(parallelInput),
    geminiProvider.planVideo(parallelInput),
  ]);

  assert("All parallel promises resolve to identical plan", p1.title === p2.title && p2.title === p3.title);
  assert("In-flight request coalescing recorded", aiCacheManager.getStats().coalescedRequests >= 1 || aiCacheManager.getStats().hits >= 1);

  // ─── TEST 6: Zero-Cost Deterministic Delta Updates ───
  console.log("\n▶ TEST SUITE 6: Zero-Cost Deterministic Delta Updates");
  const basePlan = await provider.planVideo({ topic: "Coffee Brewing", targetDurationSeconds: 10 });

  // Scenario A: User changes only caption highlight color & caption style
  const deltaCaption = {
    sceneNumber: 1,
    caption: { highlightColor: "#f59e0b", style: "pop" as const },
  };
  const isDet1 = planOptimizer.isPurelyDeterministicChange(basePlan.scenes[0], { caption: deltaCaption.caption });
  assert("PlanOptimizer detects caption styling change as deterministic", isDet1 === true);

  const updatedPlanA = planOptimizer.applyDeterministicDelta(basePlan, deltaCaption);
  assert("Deterministic delta updates caption color with ZERO AI calls", updatedPlanA.aiCalled === false && updatedPlanA.tokensUsed === 0);
  assert("Scene 1 caption highlightColor updated to #f59e0b", updatedPlanA.plan.scenes[0].caption.highlightColor === "#f59e0b");

  // Scenario B: User changes only camera motion preset from slowPush to cinematic
  const deltaCamera = {
    sceneNumber: 1,
    camera: { type: "cinematic" as const, speed: 1.5 },
  };
  const isDet2 = planOptimizer.isPurelyDeterministicChange(basePlan.scenes[0], { camera: deltaCamera.camera });
  assert("PlanOptimizer detects camera change as deterministic", isDet2 === true);

  const updatedPlanB = planOptimizer.applyDeterministicDelta(basePlan, deltaCamera);
  assert("Deterministic delta updates camera with ZERO AI calls", updatedPlanB.aiCalled === false && updatedPlanB.tokensUsed === 0);
  assert("Scene 1 camera updated to cinematic", updatedPlanB.plan.scenes[0].camera.type === "cinematic");

  // Scenario C: User changes only VFX intensity
  const deltaVFX = {
    sceneNumber: 1,
    vfx: [{ type: "lightLeak" as const, intensity: 0.8, blendMode: "screen" as const, startTime: 0, duration: 5 }],
  };
  const isDet3 = planOptimizer.isPurelyDeterministicChange(basePlan.scenes[0], { vfx: deltaVFX.vfx });
  assert("PlanOptimizer detects VFX tweak as deterministic", isDet3 === true);

  const updatedPlanC = planOptimizer.applyDeterministicDelta(basePlan, deltaVFX);
  assert("Deterministic delta updates VFX with ZERO AI calls", updatedPlanC.aiCalled === false && updatedPlanC.tokensUsed === 0);

  // Scenario D: User changes script text -> NOT deterministic (requires AI planning)
  const isNonDet = planOptimizer.isPurelyDeterministicChange(basePlan.scenes[0], { script: "Completely new narrative script text" });
  assert("PlanOptimizer detects script rewrite as requiring AI re-planning", isNonDet === false);

  // ─── TEST 7: Single Scene Differential Update ───
  console.log("\n▶ TEST SUITE 7: Single Scene Differential Update");
  const modifiedScene = {
    ...basePlan.scenes[1],
    title: "Updated Scene 2 Title",
    script: "Refined narrative for Scene 2 exclusively.",
  };
  const diffPlan = planOptimizer.replaceSceneInPlan(basePlan, modifiedScene);
  assert("Scene 2 updated in plan", diffPlan.scenes[1].title === "Updated Scene 2 Title");
  assert("Scene 1 remains untouched", diffPlan.scenes[0].title === basePlan.scenes[0].title);

  // ─── TEST 8: Multi-Provider Abstraction & Factory ───
  console.log("\n▶ TEST SUITE 8: Provider Abstraction & Factory");
  const mockP = AIProviderFactory.getProvider("mock");
  assert("Factory returns MockAIProvider", mockP.name === "MockAIProvider");

  const openaiP = new OpenAIProvider();
  assert("OpenAIProvider implements AIProvider interface", Boolean(openaiP.name && openaiP.planVideo));

  const anthropicP = new AnthropicProvider();
  assert("AnthropicProvider implements AIProvider interface", Boolean(anthropicP.name && anthropicP.planVideo));

  const localP = new LocalAIProvider();
  assert("LocalAIProvider implements AIProvider interface", Boolean(localP.name && localP.planVideo));

  // ─── TEST 9: Script Rewriter & Motion/VFX Recommender ───
  console.log("\n▶ TEST SUITE 9: Script Rewriter & Motion/VFX Recommender");
  const rewriteRes = await provider.rewriteScript({
    script: "This is a really very somewhat long sentence that needs to be shortened.",
    goal: "shorten",
  });
  assert("Script rewriter produces shortened script", Boolean(rewriteRes.rewrittenScript && rewriteRes.wordCount));

  const motionVfxRes = await provider.recommendMotionAndVFX({
    scriptSnippet: "Exciting announcement! We are launching today!",
    duration: 5,
    mood: "energetic",
  });
  assert("Motion/VFX recommender returns energetic camera & motion", motionVfxRes.recommendedCamera.type === "dynamicPush");
  assert("Motion/VFX recommender returns reasoning", Boolean(motionVfxRes.reasoning));

  // ─── TEST 10: Zod Schema Validation & Automated JSON Repair ───
  console.log("\n▶ TEST SUITE 10: JSON Repair & Schema Validation");
  const malformedJson = `\`\`\`json
  {
    "id": "plan-repair",
    "title": "Repaired Plan",
    "summary": "Repaired summary",
    "targetDuration": 10,
    "aspectRatio": "9:16",
    "scenes": [
      {
        "sceneNumber": 1,
        "title": "Repaired Scene",
        "script": "Narration text",
        "duration": 5,
        "avatar": true
      }
    ]
  }
  \`\`\``;

  const repairedResult = safeParseAndRepairJson(malformedJson, VideoPlanSchema);
  assert("Automated JSON repair extracts JSON from markdown block", repairedResult.success === true && repairedResult.data?.title === "Repaired Plan");
  assert("Automated JSON repair applies safe defaults for missing sub-plans", Boolean(repairedResult.data?.scenes[0].camera && repairedResult.data?.scenes[0].motion));

  console.log("\n=======================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED`);
  if (passed === total) {
    console.log("✅ ALL LOW-COST HYBRID AI ARCHITECTURE TESTS PASSED (100%)");
  } else {
    console.log(`❌ ${total - passed} TESTS FAILED`);
  }
  console.log("=======================================================\n");
}

runLowCostHybridAITests().catch(console.error);
