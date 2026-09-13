/**
 * Comprehensive Low-Cost Avatar + Voice + Lip Sync Architecture Test Suite
 * Validates:
 *  1. VoiceProvider with Default & Cloned Voices
 *  2. Deterministic Voice Cache (SHA-256 hash hit eliminates redundant TTS calls)
 *  3. AvatarProvider Abstraction & Deterministic Avatar Cache (same avatar + audio = instant reuse)
 *  4. LipSyncProvider Abstraction (Mock, Remote, Local GPU model interfaces)
 *  5. Deterministic LipSync Cache (re-use synchronized video)
 *  6. LocalLipSyncProvider healthcheck and graceful fallback
 *  7. Core Business Rule: Changing background, captions, camera, motion, or VFX DOES NOT regenerate avatar video
 *  8. End-to-End Pipeline with cached multi-layer compositing
 */

import { ElevenLabsVoiceProvider } from "../lib/providers/voice/elevenlabs-voice-provider";
import { MockVoiceProvider } from "../lib/providers/voice/mock-voice-provider";
import { audioCacheManager } from "../lib/providers/voice/audio-cache";
import { MockAvatarProvider } from "../lib/providers/avatar/mock-avatar-provider";
import { ProductionAvatarProvider } from "../lib/providers/avatar/production-avatar-provider";
import { avatarCacheManager } from "../lib/providers/avatar/avatar-cache";
import { MockLipSyncProvider } from "../lib/providers/lipsync/mock-lipsync-provider";
import { RemoteLipSyncProvider } from "../lib/providers/lipsync/remote-lipsync-provider";
import { LocalLipSyncProvider } from "../lib/providers/lipsync/local-lipsync-provider";
import { lipSyncCacheManager } from "../lib/providers/lipsync/lipsync-cache";
import { LipSyncProviderFactory } from "../lib/providers/lipsync";
import { studioPipelineService } from "../services/avatar-studio/studio-pipeline";
import { VideoGenerationRequest } from "../services/avatar-studio/types";

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

async function runLowCostMediaTests() {
  console.log("\n=======================================================");
  console.log("🎬 TESTING LOW-COST AVATAR + VOICE + LIP SYNC ARCHITECTURE");
  console.log("=======================================================\n");

  // Clear in-memory caches before starting
  audioCacheManager["memoryCache"].clear();
  avatarCacheManager.clear();
  lipSyncCacheManager.clear();

  // ─── TEST SUITE 1: VoiceProvider & Voice Cache ───
  console.log("▶ TEST SUITE 1: VoiceProvider & Deterministic Voice Cache");
  const elevenLabs = new ElevenLabsVoiceProvider();
  const mockVoice = new MockVoiceProvider();

  const voiceInput = {
    text: "Welcome to Vilo AI. Supercharge your content production.",
    voiceId: "voice-emma",
    speed: 1.0,
    language: "en-US",
    emotion: "cheerful" as const,
    userId: "test-user-1",
    projectId: "proj-1",
  };

  // First call -> cache miss
  const audio1 = await elevenLabs.generateSpeech(voiceInput);
  assert("First voice generation produces audio file URL", Boolean(audio1.audioUrl && audio1.duration > 0));
  assert("First voice generation is marked as cacheHit: false", audio1.cacheHit === false);
  assert("Generated audio includes deterministic cacheKey", Boolean(audio1.cacheKey));

  // Second call with identical text + voice + settings -> cache hit (0 API cost!)
  const audio2 = await elevenLabs.generateSpeech(voiceInput);
  assert("Second voice call reuses cached audio URL without calling API again", audio2.audioUrl === audio1.audioUrl);
  assert("Second voice generation is marked as cacheHit: true", audio2.cacheHit === true);

  // Cloned Voice test
  const userClone = await elevenLabs.createVoiceClone({
    userId: "alice-creator",
    name: "Alice Cloned Voice",
  });
  assert("VoiceProvider creates cloned voice record with providerVoiceId", Boolean(userClone.id && userClone.providerVoiceId));

  const cloneAudio = await elevenLabs.generateSpeech({
    ...voiceInput,
    voiceId: userClone.id,
    userId: "alice-creator",
  });
  assert("VoiceProvider generates speech using cloned voice", Boolean(cloneAudio.audioUrl));

  // ─── TEST SUITE 2: AvatarProvider & Avatar Cache ───
  console.log("\n▶ TEST SUITE 2: AvatarProvider & Deterministic Avatar Cache");
  const mockAvatar = new MockAvatarProvider();
  const prodAvatar = new ProductionAvatarProvider();

  const avatarInput = {
    avatarId: "avatar-sophia",
    audioUrl: audio1.audioUrl,
    script: voiceInput.text,
    aspectRatio: "9:16" as const,
    resolution: "1080p" as const,
  };

  // First avatar request
  const avatarJob1 = await mockAvatar.createAvatarVideo(avatarInput);
  assert("AvatarProvider initiates avatar video creation", Boolean(avatarJob1.providerJobId));

  // Wait for avatar generation to complete and cache
  await new Promise((r) => setTimeout(r, 400));
  const completedAvatar = await mockAvatar.getJobStatus(avatarJob1.providerJobId);
  assert("Avatar video generation completes with videoUrl", Boolean(completedAvatar.videoUrl));

  // Second avatar request with same avatar + same audio -> cache hit!
  const avatarJob2 = await mockAvatar.createAvatarVideo(avatarInput);
  assert("Identical avatar + audio request reuses cached video immediately", avatarJob2.status === "completed" && avatarJob2.videoUrl === completedAvatar.videoUrl);

  // ─── TEST SUITE 3: LipSyncProvider Multi-Model Architecture ───
  console.log("\n▶ TEST SUITE 3: LipSyncProvider Multi-Model Architecture");
  const mockLipSync = new MockLipSyncProvider();
  const remoteLipSync = new RemoteLipSyncProvider();
  const localLipSync = new LocalLipSyncProvider("http://localhost:8000");

  assert("MockLipSyncProvider is available", await mockLipSync.isAvailable());
  assert("RemoteLipSyncProvider implements ILipSyncProvider contract", Boolean(remoteLipSync.name && remoteLipSync.synchronize));
  assert("LocalLipSyncProvider implements ILipSyncProvider contract", Boolean(localLipSync.name && localLipSync.synchronize));

  const lipSyncInput = {
    avatarVideoUrl: completedAvatar.videoUrl || "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
    audioUrl: audio1.audioUrl,
    duration: audio1.duration,
    aspectRatio: "9:16" as const,
    modelType: "wav2lip" as const,
  };

  // Synchronize via Mock
  const lipSyncRes1 = await mockLipSync.synchronize(lipSyncInput);
  assert("LipSyncProvider returns synchronized video URL", Boolean(lipSyncRes1.syncedVideoUrl));
  assert("LipSync calculates phoneme count and accuracy metric", lipSyncRes1.phonemeCount > 0 && lipSyncRes1.syncAccuracy > 0.9);
  assert("First lip-sync call is marked as cached: false", lipSyncRes1.cached === false);

  // Second sync call with identical avatar + audio -> cache hit!
  const lipSyncRes2 = await mockLipSync.synchronize(lipSyncInput);
  assert("Second lip-sync call reuses cached video URL without compute", lipSyncRes2.syncedVideoUrl === lipSyncRes1.syncedVideoUrl);
  assert("Second lip-sync call is marked as cached: true", lipSyncRes2.cached === true);

  // Test LocalLipSyncProvider with graceful fallback when local GPU endpoint is offline
  const isLocalGpuOnline = await localLipSync.isAvailable();
  assert("LocalLipSyncProvider performs healthcheck (offline in dev mode)", isLocalGpuOnline === false);

  const localRes = await localLipSync.synchronize(lipSyncInput);
  assert("LocalLipSyncProvider gracefully falls back to mock when GPU is unconfigured", Boolean(localRes.syncedVideoUrl));

  // Factory check
  const factoryProvider = LipSyncProviderFactory.getProvider("mock");
  assert("LipSyncProviderFactory retrieves requested provider", factoryProvider.name === "MockLipSyncProvider");

  // ─── TEST SUITE 4: Core Rule - Zero Re-generation for Internal Changes ───
  console.log("\n▶ TEST SUITE 4: Zero Re-Generation for Internal Styling Changes");

  const baseRequest: VideoGenerationRequest = {
    projectId: "proj-low-cost-1",
    userId: "creator-1",
    avatarId: "avatar-sophia",
    script: "Supercharge your brand with AI video.",
    voiceId: "voice-emma",
    voiceType: "default",
    duration: 10,
    aspectRatio: "9:16",
    scenes: [
      {
        id: "scene-1",
        order: 1,
        duration: 10,
        script: "Supercharge your brand with AI video.",
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
    idempotencyKey: `idem-base-${Date.now()}`,
  };

  // Run initial video generation
  const initialJob = await studioPipelineService.execute(baseRequest);
  const initialAvatarVideo = initialJob.stepResults.avatarResult?.avatarVideoUrl;
  const initialLipSyncVideo = initialJob.stepResults.lipSyncResult?.syncedVideoUrl;
  assert("Initial pipeline run produces avatar and lip-sync video", Boolean(initialAvatarVideo && initialLipSyncVideo));

  // Case A: User changes ONLY background from solid to gradient
  // Case B: User changes ONLY captions highlightColor from #38bdf8 to #f59e0b
  // Case C: User changes ONLY VFX from glow to light_leak
  // Case D: User changes ONLY Camera from slow_zoom_in to dynamic_push
  const modifiedRequest: VideoGenerationRequest = {
    ...baseRequest,
    idempotencyKey: `idem-modified-${Date.now()}`,
    background: { type: "gradient", value: "linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)" },
    captions: { enabled: true, level: "word", animation: "highlight", style: { fontSize: 36, color: "#fff", highlightColor: "#f59e0b", position: "bottom" } },
    motionPreset: "dynamic_push",
    vfx: [{ id: "vfx-leak", type: "light_leak", startTime: 1, duration: 8, intensity: 0.5, opacity: 0.6, position: { x: 50, y: 50 }, scale: 1.2, blendMode: "screen" }],
  };

  const reRenderJob = await studioPipelineService.execute(modifiedRequest);
  assert("Second pipeline run completes with new rendered video", reRenderJob.status === "completed");
  assert("Avatar video URL is preserved from cache without re-generation", reRenderJob.stepResults.avatarResult?.avatarVideoUrl === initialAvatarVideo);
  assert("Lip-sync video URL is preserved from cache without re-generation", reRenderJob.stepResults.lipSyncResult?.syncedVideoUrl === initialLipSyncVideo);

  console.log("\n=======================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED`);
  if (passed === total) {
    console.log("✅ ALL LOW-COST MEDIA ARCHITECTURE TESTS PASSED (100%)");
  } else {
    console.log(`❌ ${total - passed} TESTS FAILED`);
  }
  console.log("=======================================================\n");
}

runLowCostMediaTests().catch(console.error);
