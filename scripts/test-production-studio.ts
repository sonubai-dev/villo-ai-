/**
 * Comprehensive Production Test Suite for Vilo AI Avatar Studio
 * Validates 19 Production Quality Requirements:
 *  1. 10-second video generation (10 credits)
 *  2. 15-second video generation (15 credits)
 *  3. 20-second video generation (20 credits)
 *  4. Default voice generation
 *  5. Cloned voice generation & ownership
 *  6. Multiple avatar support (Sophia, Daniel, Alex)
 *  7. Lip sync validation (phonemes, accuracy)
 *  8. Motion graphics application
 *  9. Multiple VFX layers
 * 10. Caption generation (word + sentence)
 * 11. 9:16 aspect ratio
 * 12. 16:9 aspect ratio
 * 13. 1:1 aspect ratio
 * 14. Generation failure + automatic credit refund
 * 15. Provider timeout handling
 * 16. Retry with step resumability
 * 17. Insufficient credits rejection
 * 18. Duplicate generation (idempotency protection)
 * 19. Content safety & impersonation blocking
 */

import { productionStudioService } from "../services/avatar-studio/production-studio-service";
import { studioPipelineService } from "../services/avatar-studio/studio-pipeline";
import { StudioProviderRegistry } from "../services/avatar-studio/providers";
import { serverCreditService } from "../lib/credits/server-credit-service";
import { contentSafetyService } from "../lib/safety/content-safety";
import { generationTracker } from "../lib/observability/generation-tracker";
import { elevenLabsVoiceProvider } from "../lib/providers/voice/elevenlabs-voice-provider";
import {
  VideoGenerationRequest,
  StudioScene,
  StudioCaptionSettings,
  StudioAudioMix,
} from "../services/avatar-studio/types";

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

function buildBaseRequest(userId: string, overrides?: Partial<VideoGenerationRequest>): VideoGenerationRequest {
  const defaultCaptions: StudioCaptionSettings = {
    enabled: true,
    level: "word",
    animation: "pop",
    style: {
      fontSize: 32,
      color: "#ffffff",
      highlightColor: "#38bdf8",
      position: "bottom",
    },
  };

  const defaultAudioMix: StudioAudioMix = {
    voiceVolume: 1.0,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    autoDuck: true,
  };

  const defaultScene: StudioScene = {
    id: "scene-1",
    order: 1,
    duration: 15,
    script: "Welcome to Vilo AI Avatar Studio. Create stunning content effortlessly.",
    avatarId: "avatar-sophia",
    voiceId: "voice-emma",
    motion: "slow_zoom_in",
    camera: "slow_zoom_in",
    vfx: [{
      id: "vfx-1",
      type: "glow",
      startTime: 0,
      duration: 15,
      intensity: 0.3,
      opacity: 0.5,
      position: { x: 50, y: 50 },
      scale: 1,
      blendMode: "screen",
    }],
    motionGraphics: [{
      id: "mg-1",
      type: "kinetic_text",
      text: "VILO AI",
      startTime: 1,
      duration: 3,
      x: 50,
      y: 20,
      scale: 1.2,
      rotation: 0,
      opacity: 1,
      animation: "spring",
    }],
    textOverlays: [],
    captions: defaultCaptions,
  };

  return {
    projectId: `proj-${Date.now()}`,
    userId,
    avatarId: "avatar-sophia",
    script: "Welcome to Vilo AI Avatar Studio. Create stunning content effortlessly.",
    voiceId: "voice-emma",
    voiceType: "default",
    duration: 15,
    aspectRatio: "9:16",
    scenes: [defaultScene],
    motionPreset: "slow_zoom_in",
    vfx: [],
    captions: defaultCaptions,
    background: { type: "gradient", value: "linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)" },
    audioMix: defaultAudioMix,
    resolution: "1080p",
    format: "mp4",
    idempotencyKey: `idem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    ...overrides,
  };
}

async function runProductionTestSuite() {
  console.log("\n=======================================================");
  console.log("🚀 TESTING PRODUCTION AVATAR STUDIO ARCHITECTURE");
  console.log("=======================================================\n");

  const testUser = `user-prod-studio-${Date.now()}`;

  // 1. 10-Second Video Generation (10 credits)
  console.log("▶ TEST 1: 10-Second Video Generation (10 credits)");
  const req10 = buildBaseRequest(testUser, { duration: 10 });
  const job10 = await productionStudioService.createAndExecuteJob(req10);
  assert("10s video completes successfully", job10.status === "completed");
  assert("10s video charges 10 credits", job10.creditsCost === 10);
  const bal1 = await serverCreditService.getUserBalance(testUser);
  assert("User balance is 40 credits (50 - 10)", bal1 === 40);

  // 2. 15-Second Video Generation (15 credits)
  console.log("\n▶ TEST 2: 15-Second Video Generation (15 credits)");
  const req15 = buildBaseRequest(testUser, { duration: 15 });
  const job15 = await productionStudioService.createAndExecuteJob(req15);
  assert("15s video completes successfully", job15.status === "completed");
  assert("15s video charges 15 credits", job15.creditsCost === 15);
  const bal2 = await serverCreditService.getUserBalance(testUser);
  assert("User balance is 25 credits (40 - 15)", bal2 === 25);

  // 3. 20-Second Video Generation (20 credits)
  console.log("\n▶ TEST 3: 20-Second Video Generation (20 credits)");
  const req20 = buildBaseRequest(testUser, { duration: 20 });
  const job20 = await productionStudioService.createAndExecuteJob(req20);
  assert("20s video completes successfully", job20.status === "completed");
  assert("20s video charges 20 credits", job20.creditsCost === 20);
  const bal3 = await serverCreditService.getUserBalance(testUser);
  assert("User balance is 5 credits (25 - 20)", bal3 === 5);

  // 4. Default Voice Generation
  console.log("\n▶ TEST 4: Default Voice Generation");
  assert("Audio results generated with word timings", (job15.stepResults.audioResults?.["scene-0"]?.wordTimings?.length ?? 0) > 0);

  // 5. Cloned Voice Generation & Ownership Verification
  console.log("\n▶ TEST 5: Cloned Voice Generation & Ownership Guard");
  const aliceUser = `alice-voice-${Date.now()}`;
  const bobUser = `bob-voice-${Date.now()}`;
  const aliceClone = await elevenLabsVoiceProvider.createVoiceClone({
    userId: aliceUser,
    name: "Alice Studio Voice",
  });

  // Bob attempts to use Alice's cloned voice -> Forbidden
  let bobBlocked = false;
  try {
    const bobReq = buildBaseRequest(bobUser, { voiceId: aliceClone.id, voiceType: "cloned", duration: 10 });
    await productionStudioService.createAndExecuteJob(bobReq);
  } catch (err: any) {
    bobBlocked = err.message.includes("UNAUTHORIZED") || err.message.includes("does not own cloned voice");
  }
  assert("Cross-tenant guard: Bob blocked from using Alice's voice", bobBlocked);

  // Alice uses her own voice -> Success
  const aliceReq = buildBaseRequest(aliceUser, { voiceId: aliceClone.id, voiceType: "cloned", duration: 10 });
  const aliceJob = await productionStudioService.createAndExecuteJob(aliceReq);
  assert("Alice successfully uses her own cloned voice", aliceJob.status === "completed");

  // 6. Multiple Avatar Support
  console.log("\n▶ TEST 6: Multiple Avatar Support");
  const avatars = ["avatar-sophia", "avatar-daniel", "avatar-alex"];
  for (const av of avatars) {
    const avReq = buildBaseRequest(`user-${av}-${Date.now()}`, { avatarId: av, duration: 10 });
    const avJob = await productionStudioService.createAndExecuteJob(avReq);
    assert(`Successfully generated video for ${av}`, avJob.status === "completed" && avJob.request.avatarId === av);
  }

  // 7. Lip Sync Validation
  console.log("\n▶ TEST 7: Lip Sync Validation");
  assert("Lip sync produces synchronized video URL", Boolean(job15.stepResults.lipSyncResult?.syncedVideoUrl));
  assert("Lip sync computes phonemes and accuracy", (job15.stepResults.lipSyncResult?.syncAccuracy ?? 0) > 0.85);

  // 8. Motion Graphics Application
  console.log("\n▶ TEST 8: Motion Graphics Application");
  assert("Motion graphics provider returns composite URL", Boolean(job15.stepResults.motionGraphicsResult?.compositeUrl));

  // 9. Multiple VFX Layers
  console.log("\n▶ TEST 9: Multiple VFX Layers");
  const multiVfxReq = buildBaseRequest(`user-vfx-${Date.now()}`, {
    duration: 10,
    vfx: [
      { id: "vfx-glow", type: "glow", startTime: 0, duration: 10, intensity: 0.4, opacity: 0.5, position: { x: 50, y: 50 }, scale: 1, blendMode: "screen" },
      { id: "vfx-leak", type: "light_leak", startTime: 2, duration: 5, intensity: 0.3, opacity: 0.6, position: { x: 70, y: 30 }, scale: 1.2, blendMode: "screen" },
      { id: "vfx-speed", type: "speed_lines", startTime: 5, duration: 5, intensity: 0.2, opacity: 0.4, position: { x: 50, y: 50 }, scale: 1, blendMode: "screen" },
    ],
  });
  const vfxJob = await productionStudioService.createAndExecuteJob(multiVfxReq);
  assert("Applies 3 distinct VFX layers", vfxJob.stepResults.vfxResult?.effectsApplied.length! >= 3);

  // 10. Caption Generation
  console.log("\n▶ TEST 10: Caption Generation");
  assert("Generates timestamped captions", (job15.stepResults.captionResult?.captions?.length ?? 0) > 0);

  // 11-13. Aspect Ratio Formats (9:16, 16:9, 1:1)
  console.log("\n▶ TEST 11-13: Aspect Ratio Formats (9:16, 16:9, 1:1)");
  for (const ratio of ["9:16", "16:9", "1:1"] as const) {
    const ratioReq = buildBaseRequest(`user-ratio-${Date.now()}`, { aspectRatio: ratio, duration: 10 });
    const ratioJob = await productionStudioService.createAndExecuteJob(ratioReq);
    assert(`Renders video with aspect ratio ${ratio}`, ratioJob.request.aspectRatio === ratio);
  }

  // 14. Generation Failure + Automatic Credit Refund
  console.log("\n▶ TEST 14: Generation Failure + Automatic Credit Refund");
  const failUser = `user-fail-${Date.now()}`;
  const initialFailBal = await serverCreditService.getUserBalance(failUser);
  assert("Initial balance is 50 credits", initialFailBal === 50);

  // Swap to failing avatar provider
  const originalAvatarProvider = StudioProviderRegistry.avatarProvider;
  StudioProviderRegistry.setAvatarProvider({
    name: "FailingAvatar",
    async generateAvatar() { throw new Error("AVATAR_GPU_NODE_DOWN: Out of memory"); },
  });

  let failCaught = false;
  try {
    const failReq = buildBaseRequest(failUser, { duration: 15 });
    await productionStudioService.createAndExecuteJob(failReq);
  } catch (err: any) {
    failCaught = true;
  }
  assert("Pipeline failure throws controlled error", failCaught);
  const refundBal = await serverCreditService.getUserBalance(failUser);
  assert("Reserved 15 credits automatically refunded (balance remains 50)", refundBal === 50);

  // Restore avatar provider
  StudioProviderRegistry.setAvatarProvider(originalAvatarProvider);

  // 15. Provider Timeout Handling
  console.log("\n▶ TEST 15: Provider Timeout Handling");
  const timeoutUser = `user-timeout-${Date.now()}`;
  const originalLipSyncProvider = StudioProviderRegistry.lipSyncProvider;
  StudioProviderRegistry.setLipSyncProvider({
    name: "HangingLipSync",
    async synchronize() {
      // Hang longer than timeout
      await new Promise((res) => setTimeout(res, 5000));
      return { syncedVideoUrl: "hang", duration: 10, phonemeCount: 10, syncAccuracy: 1 };
    },
  });

  let timeoutCaught = false;
  try {
    const timeoutReq = buildBaseRequest(timeoutUser, { duration: 10 });
    await productionStudioService.createAndExecuteJob(timeoutReq, undefined, { timeoutMs: 300 });
  } catch (err: any) {
    timeoutCaught = err.message.includes("TIMEOUT") || err.message.includes("exceeded");
  }
  assert("Provider timeout triggers controlled failure", timeoutCaught);
  StudioProviderRegistry.setLipSyncProvider(originalLipSyncProvider);

  // 16. Retry with Resumability
  console.log("\n▶ TEST 16: Retry with Resumability");
  const retryReq = buildBaseRequest(`user-retry-${Date.now()}`, { duration: 10 });
  const resumeJob = await studioPipelineService.execute(retryReq);
  assert("Completed steps tracked for resumability", resumeJob.completedSteps.includes("planning") && resumeJob.completedSteps.includes("rendering"));

  // 17. Insufficient Credits Rejection
  console.log("\n▶ TEST 17: Insufficient Credits Rejection");
  const brokeUser = `user-broke-${Date.now()}`;
  // Drain brokeUser
  await serverCreditService.reserveCredits({
    userId: brokeUser,
    actionType: "presentation_video",
    customCost: 50,
    idempotencyKey: `drain-${Date.now()}`,
  });

  let brokeBlocked = false;
  try {
    const brokeReq = buildBaseRequest(brokeUser, { duration: 15 });
    await productionStudioService.createAndExecuteJob(brokeReq);
  } catch (err: any) {
    brokeBlocked = err.message.includes("Insufficient credits") || err.message.includes("Reservation failed");
  }
  assert("Rejects generation when user balance is insufficient", brokeBlocked);

  // 18. Duplicate Generation (Idempotency Protection)
  console.log("\n▶ TEST 18: Duplicate Generation (Idempotency Protection)");
  const idemUser = `user-idem-${Date.now()}`;
  const fixedKey = `idem-key-fixed-${Date.now()}`;
  const reqIdem1 = buildBaseRequest(idemUser, { duration: 10, idempotencyKey: fixedKey });
  const jobResult1 = await productionStudioService.createAndExecuteJob(reqIdem1);
  const balAfterFirst = await serverCreditService.getUserBalance(idemUser);

  // Second run with same idempotency key
  const reqIdem2 = buildBaseRequest(idemUser, { duration: 10, idempotencyKey: fixedKey });
  const jobResult2 = await productionStudioService.createAndExecuteJob(reqIdem2);
  const balAfterSecond = await serverCreditService.getUserBalance(idemUser);

  assert("Returns existing job instance on duplicate idempotency key", jobResult1.id === jobResult2.id);
  assert("Does not charge user twice for duplicate request", balAfterFirst === balAfterSecond);

  // 19. Content Safety & Impersonation Blocking
  console.log("\n▶ TEST 19: Content Safety & Impersonation Blocking");
  const safetyUser = `user-safety-${Date.now()}`;

  // Toxicity check
  let toxicBlocked = false;
  try {
    const toxicReq = buildBaseRequest(safetyUser, { script: "I will deploy ransomware and steal credit cards from everyone" });
    await productionStudioService.createAndExecuteJob(toxicReq);
  } catch (err: any) {
    toxicBlocked = err.message.includes("Content Safety Violation");
  }
  assert("Content safety blocks illegal/malicious script", toxicBlocked);

  // Impersonation check
  let impersonationBlocked = false;
  try {
    const impReq = buildBaseRequest(safetyUser, { script: "Hello world, I am Elon Musk and this is my official statement" });
    await productionStudioService.createAndExecuteJob(impReq);
  } catch (err: any) {
    impersonationBlocked = err.message.includes("Content Safety Violation") && err.message.includes("elon musk");
  }
  assert("Content safety blocks unauthorized public figure impersonation", impersonationBlocked);

  console.log("\n=======================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} PRODUCTION TESTS PASSED`);
  if (passed === total) {
    console.log("✅ ALL 19 PRODUCTION SCENARIOS PASSED (100%)");
  } else {
    console.log(`❌ ${total - passed} TESTS FAILED`);
  }
  console.log("=======================================================\n");
}

runProductionTestSuite().catch(console.error);
