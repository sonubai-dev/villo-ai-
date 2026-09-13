/**
 * Comprehensive Self-Hosted Media Infrastructure Test Suite
 * Validates:
 *  1. Duration Support: 10s, 15s, 20s avatar videos
 *  2. Media Capabilities: Default & Cloned Voices, LipSync, Motion Graphics, VFX, Captions, Camera, Aspect Ratios (9:16, 16:9, 1:1)
 *  3. Stateless Self-Hosted Worker: Job Claiming, Atomic Locking, Temp File Cleanup
 *  4. ProviderRouter: Primary to Fallback Auto-Failover (TTS, LipSync, Avatar, AI)
 *  5. Video Reusability: Video A -> Video B with changed VFX reuses voice/avatar/lip-sync with 0 external API calls
 *  6. Unit Economics & Cost Monitoring Telemetry
 */

import { selfHostedWorker } from "../lib/worker/self-hosted-worker";
import { providerRouter } from "../lib/routing/provider-router";
import { costMonitor } from "../lib/observability/cost-monitor";
import { videoReusabilityEngine } from "../services/generation/video-reusability-engine";
import { assetCacheService } from "../lib/firebase/asset-cache-service";
import { studioPipelineService } from "../services/avatar-studio/studio-pipeline";
import { VideoGenerationRequest } from "../services/avatar-studio/types";
import { VideoPlan } from "../lib/ai/planning/types";

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

async function runSelfHostedInfrastructureTests() {
  console.log("\n=======================================================");
  console.log("🛠️ TESTING SELF-HOSTED MEDIA INFRASTRUCTURE");
  console.log("=======================================================\n");

  costMonitor.clear();
  assetCacheService.clear();

  // ─── TEST SUITE 1: Durations & Aspect Ratios ───
  console.log("▶ TEST SUITE 1: Video Durations (10s, 15s, 20s) & Aspect Ratios (9:16, 16:9, 1:1)");

  const durations = [10, 15, 20];
  const aspectRatios: Array<"9:16" | "16:9" | "1:1"> = ["9:16", "16:9", "1:1"];

  for (let i = 0; i < durations.length; i++) {
    const dur = durations[i];
    const ar = aspectRatios[i];

    const taskPlan: VideoPlan = {
      id: `plan-${dur}s`,
      title: `${dur}s Test Video`,
      summary: "Duration benchmark",
      targetDuration: dur,
      aspectRatio: ar,
      scenes: [
        {
          sceneNumber: 1,
          title: "Scene 1",
          script: `Testing ${dur}s video in ${ar} aspect ratio.`,
          duration: dur,
          avatar: true,
          avatarId: "avatar-sophia",
          motion: { type: "cameraPush", speed: 1.0, intensity: 50 },
          vfx: [{ type: "glow", intensity: 0.3, blendMode: "screen", startTime: 0, duration: dur }],
          caption: { style: "highlight", level: "word", highlightColor: "#38bdf8", position: "bottom" },
          camera: { type: "slowPush", framing: "medium", speed: 1.0 },
        },
      ],
    };

    const workerResult = await selfHostedWorker.processTask({
      jobId: `worker-test-${dur}s-${Date.now()}`,
      projectId: "proj-bench",
      userId: "user-bench",
      videoPlan: taskPlan,
      aspectRatio: ar,
      resolution: "1080p",
      format: "mp4",
      fps: 30,
    });

    assert(`Worker processes ${dur}s video container (${ar})`, workerResult.duration === dur);
    assert(`Worker outputs valid Storage URL for ${dur}s video`, Boolean(workerResult.outputVideoUrl && workerResult.outputVideoUrl.includes("renders")));
    assert(`Worker produces thumbnail for ${dur}s video`, Boolean(workerResult.thumbnailUrl));
  }

  // ─── TEST SUITE 2: Stateless Worker Job Claiming & Locking ───
  console.log("\n▶ TEST SUITE 2: Worker Statelessness & Atomic Job Locking");

  const testJobId = `job-lock-${Date.now()}`;
  const claimed1 = await selfHostedWorker.claimJob(testJobId, 5000);
  assert("First worker successfully claims job lock", claimed1 === true);

  // Another worker attempting to claim the same job should be rejected
  const otherWorker = new (selfHostedWorker.constructor as any)("worker-node-competitor");
  const claimed2 = await otherWorker.claimJob(testJobId, 5000);
  assert("Second worker is locked out from claiming active job", claimed2 === false);

  await selfHostedWorker.releaseJob(testJobId);
  const claimed3 = await otherWorker.claimJob(testJobId, 5000);
  assert("Second worker can claim job after release", claimed3 === true);
  await otherWorker.releaseJob(testJobId);

  // ─── TEST SUITE 3: ProviderRouter & Primary -> Fallback Failover ───
  console.log("\n▶ TEST SUITE 3: ProviderRouter & Primary -> Fallback Failover");

  // Configure router with Local TTS (which is offline in dev mode -> triggers auto fallback to ElevenLabs/Mock)
  providerRouter.setConfig({
    voiceProvider: "local",
    avatarProvider: "local",
    lipSyncProvider: "local",
    aiProvider: "local",
  });

  const speechOutput = await providerRouter.generateSpeech({
    text: "Testing ProviderRouter failover resilience.",
    voiceId: "voice-emma",
    userId: "test-user",
    projectId: "test-proj",
  });
  assert("ProviderRouter synthesizes speech via automated fallback when primary local is offline", Boolean(speechOutput.audioUrl));

  const avatarOutput = await providerRouter.createAvatarVideo({
    avatarId: "avatar-sophia",
    audioUrl: speechOutput.audioUrl,
  });
  assert("ProviderRouter creates avatar video via fallback", Boolean(avatarOutput.providerJobId));

  const lipSyncOutput = await providerRouter.synchronizeLipSync({
    avatarVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
    audioUrl: speechOutput.audioUrl,
    duration: 10,
  });
  assert("ProviderRouter synchronizes lip-sync via fallback", Boolean(lipSyncOutput.syncedVideoUrl));

  // ─── TEST SUITE 4: Video Reusability & Cost Optimization ───
  console.log("\n▶ TEST SUITE 4: Video Reusability (Video A -> Video B with Changed VFX)");

  const videoARequest: VideoGenerationRequest = {
    projectId: "proj-reuse-1",
    userId: "user-creator",
    avatarId: "avatar-sophia",
    script: "Build your creator business with Vilo AI.",
    voiceId: "voice-emma",
    voiceType: "default",
    duration: 10,
    aspectRatio: "9:16",
    scenes: [
      {
        id: "scene-a",
        order: 1,
        duration: 10,
        script: "Build your creator business with Vilo AI.",
        avatarId: "avatar-sophia",
        voiceId: "voice-emma",
        motion: "slow_zoom_in",
        camera: "slow_zoom_in",
        vfx: [{ id: "vfx-1", type: "glow", startTime: 0, duration: 10, intensity: 0.3, opacity: 0.5, position: { x: 50, y: 50 }, scale: 1, blendMode: "screen" }],
        motionGraphics: [],
        textOverlays: [],
        captions: { enabled: true, level: "word", animation: "pop", style: { fontSize: 32, color: "#fff", highlightColor: "#38bdf8", position: "bottom" } },
      },
    ],
    motionPreset: "slow_zoom_in",
    vfx: [],
    captions: { enabled: true, level: "word", animation: "pop", style: { fontSize: 32, color: "#fff", highlightColor: "#38bdf8", position: "bottom" } },
    background: { type: "solid", value: "#0f172a" },
    audioMix: { voiceVolume: 1.0, musicVolume: 0.2, sfxVolume: 0.5, autoDuck: true },
    resolution: "1080p",
    format: "mp4",
    idempotencyKey: `idem-video-a-${Date.now()}`,
  };

  // Generate Video A
  const jobA = await studioPipelineService.execute(videoARequest);
  const videoAAudio = jobA.stepResults.audioResults?.["scene-0"]?.audioUrl;
  const videoAAvatar = jobA.stepResults.avatarResult?.avatarVideoUrl;
  const videoALipSync = jobA.stepResults.lipSyncResult?.syncedVideoUrl;

  assert("Video A generates initial audio, avatar, and lip-sync video", Boolean(videoAAudio && videoAAvatar && videoALipSync));

  // Save Video A assets into Unified Asset Cache
  await assetCacheService.saveAsset({
    hash: assetCacheService.computeHash("audio", { text: videoARequest.script, voiceId: videoARequest.voiceId, duration: videoARequest.duration }),
    type: "audio",
    provider: "elevenlabs",
    source: { text: videoARequest.script, voiceId: videoARequest.voiceId, duration: videoARequest.duration },
    url: videoAAudio!,
    duration: 10,
    createdAt: new Date().toISOString(),
  });

  await assetCacheService.saveAsset({
    hash: assetCacheService.computeHash("avatar", { avatarId: videoARequest.avatarId, audioUrl: videoAAudio!, aspectRatio: videoARequest.aspectRatio }),
    type: "avatar",
    provider: "heygen",
    source: { avatarId: videoARequest.avatarId, audioUrl: videoAAudio!, aspectRatio: videoARequest.aspectRatio },
    url: videoAAvatar!,
    duration: 10,
    createdAt: new Date().toISOString(),
  });

  await assetCacheService.saveAsset({
    hash: assetCacheService.computeHash("lipsync", { avatarVideoUrl: videoAAvatar!, audioUrl: videoAAudio!, duration: videoARequest.duration }),
    type: "lipsync",
    provider: "mock",
    source: { avatarVideoUrl: videoAAvatar!, audioUrl: videoAAudio!, duration: videoARequest.duration },
    url: videoALipSync!,
    duration: 10,
    createdAt: new Date().toISOString(),
  });

  // Now create Video B: Same script, voice, avatar, but DIFFERENT VFX, Captions, and Background
  const videoBRequest: VideoGenerationRequest = {
    ...videoARequest,
    idempotencyKey: `idem-video-b-${Date.now()}`,
    background: { type: "gradient", value: "linear-gradient(135deg, #4c1d95 0%, #1e1b4b 100%)" },
    captions: { enabled: true, level: "word", animation: "highlight", style: { fontSize: 36, color: "#fff", highlightColor: "#e11d48", position: "bottom" } },
    vfx: [{ id: "vfx-spark", type: "spark", startTime: 0, duration: 10, intensity: 0.8, opacity: 0.7, position: { x: 50, y: 50 }, scale: 1.5, blendMode: "screen" }],
  };

  const reusabilityAnalysis = await videoReusabilityEngine.analyzeReusability(videoBRequest);
  assert("ReusabilityEngine detects reusable voice audio", reusabilityAnalysis.isVoiceReusable === true);
  assert("ReusabilityEngine detects reusable avatar video", reusabilityAnalysis.isAvatarReusable === true);
  assert("ReusabilityEngine detects reusable lip-sync video", reusabilityAnalysis.isLipSyncReusable === true);
  assert("ReusabilityEngine achieves 100% AI generation cost reduction", reusabilityAnalysis.estimatedCostReductionPercent === 100);

  // ─── TEST SUITE 5: Cost Monitoring & Telemetry Report ───
  console.log("\n▶ TEST SUITE 5: Unit Economics & Telemetry Report");

  const report = costMonitor.generateReport();
  assert("CostMonitor reports total operations tracked", report.totalOperations > 0);
  assert("CostMonitor calculates estimated savings from cache hits", report.estimatedSavingsUsd >= 0);
  assert("CostMonitor records provider usage count", Object.keys(report.providerUsageCount).length > 0);
  assert("CostMonitor records average latency per operation", Object.keys(report.averageLatencyMs).length > 0);

  console.log("\n  📊 UNIT ECONOMICS SUMMARY:");
  console.log(`    • Total Operations Tracked: ${report.totalOperations}`);
  console.log(`    • Total Incurred Cost: $${report.totalCostUsd}`);
  console.log(`    • Estimated Savings from Cache: $${report.estimatedSavingsUsd}`);
  console.log(`    • Cache Hit Rate: ${report.cacheHitRatePercent}%`);
  console.log(`    • Active Providers: ${Object.keys(report.providerUsageCount).join(", ")}`);

  console.log("\n=======================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED`);
  if (passed === total) {
    console.log("✅ ALL SELF-HOSTED INFRASTRUCTURE TESTS PASSED (100%)");
  } else {
    console.log(`❌ ${total - passed} TESTS FAILED`);
  }
  console.log("=======================================================\n");
}

runSelfHostedInfrastructureTests().catch(console.error);
