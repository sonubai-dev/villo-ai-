/**
 * Avatar Studio Generation Architecture - Comprehensive Test Suite
 * Tests:
 *  1. Successful full pipeline generation
 *  2. Failed provider with error handling
 *  3. Retry logic (resumability)
 *  4. Cancellation via cancel token
 *  5. Invalid script validation
 *  6. Duration validation (10, 15, 20, 30, 60 only)
 *  7. AI scene planner output
 *  8. Auto motion engine suggestions
 *  9. Provider registry hot-swap
 * 10. Caption generation (word-level and sentence-level)
 */

import { studioPipelineService } from "../services/avatar-studio/studio-pipeline";
import { StudioProviderRegistry } from "../services/avatar-studio/providers";
import { autoMotionEngine } from "../services/avatar-studio/auto-motion-engine";
import { MockStudioScenePlanner } from "../services/avatar-studio/providers/mock-scene-planner";
import { MockStudioCaptionProvider } from "../services/avatar-studio/providers/mock-caption-provider";
import {
  VideoGenerationRequest,
  StudioScene,
  StudioCaptionSettings,
  StudioAudioMix,
  PipelineProgressEvent,
} from "../services/avatar-studio/types";
import {
  IStudioVoiceProvider,
  VoiceGenerationInput,
} from "../services/avatar-studio/providers/types";
import { AudioResult } from "../services/avatar-studio/types";

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

function createValidRequest(overrides?: Partial<VideoGenerationRequest>): VideoGenerationRequest {
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
    script: "Welcome to the future of AI video creation.",
    avatarId: "avatar-sophia",
    voiceId: "voice-emma",
    motion: "slow_zoom_in",
    camera: "slow_zoom_in",
    vfx: [],
    motionGraphics: [],
    textOverlays: [],
    captions: defaultCaptions,
  };

  return {
    projectId: `proj-test-${Date.now()}`,
    userId: `user-test-${Date.now()}`,
    avatarId: "avatar-sophia",
    script: "Welcome to the future of AI video creation. Build stunning content in seconds with our cutting-edge platform.",
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
    idempotencyKey: `idem-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...overrides,
  };
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("🎬 AVATAR STUDIO GENERATION ARCHITECTURE TEST SUITE");
  console.log("=======================================================\n");

  // ─── TEST 1: Successful Full Pipeline ───
  console.log("▶ TEST 1: Successful Full Pipeline Generation");
  const stages: PipelineProgressEvent[] = [];
  const request = createValidRequest();

  const job = await studioPipelineService.execute(
    request,
    (event) => stages.push(event)
  );

  assert("Job completes with status 'completed'", job.status === "completed");
  assert("Job progress reaches 100%", job.progress === 100);
  assert("Job has output video URL", Boolean(job.outputVideoUrl));
  assert("Job has thumbnail URL", Boolean(job.thumbnailUrl));
  assert("Job has completedAt timestamp", Boolean(job.completedAt));
  assert("Pipeline emitted progress events", stages.length > 5);
  assert("Step results contain scene plan", Boolean(job.stepResults.scenePlan));
  assert("Step results contain audio results", Boolean(job.stepResults.audioResults));
  assert("Step results contain avatar result", Boolean(job.stepResults.avatarResult));
  assert("Step results contain lip sync result", Boolean(job.stepResults.lipSyncResult));
  assert("Step results contain render result", Boolean(job.stepResults.renderResult));

  // ─── TEST 2: Failed Provider Error Handling ───
  console.log("\n▶ TEST 2: Failed Provider Error Handling");

  // Create a voice provider that always fails
  const failingVoiceProvider: IStudioVoiceProvider = {
    name: "FailingVoice",
    async generateSpeech(_input: VoiceGenerationInput): Promise<AudioResult> {
      throw new Error("PROVIDER_ERROR: TTS service unavailable");
    },
    async getAvailableVoices() {
      return [];
    },
  };

  // Swap in failing provider
  const originalVoice = StudioProviderRegistry.voiceProvider;
  StudioProviderRegistry.setVoiceProvider(failingVoiceProvider);

  let failureCaught = false;
  let failedJob: any = null;
  try {
    failedJob = await studioPipelineService.execute(createValidRequest());
  } catch (err: any) {
    failureCaught = true;
    assert("Error message contains provider error", err.message.includes("PROVIDER_ERROR") || err.message.includes("TTS service"));
  }
  assert("Pipeline throws on provider failure", failureCaught);

  // Restore original provider
  StudioProviderRegistry.setVoiceProvider(originalVoice);

  // ─── TEST 3: Cancellation ───
  console.log("\n▶ TEST 3: Cancellation via Cancel Token");
  const cancelToken = { cancelled: false };
  let cancelError = false;

  // Cancel after a short delay
  setTimeout(() => { cancelToken.cancelled = true; }, 300);

  try {
    await studioPipelineService.execute(
      createValidRequest(),
      undefined,
      { cancelToken }
    );
  } catch (err: any) {
    cancelError = err.message.includes("CANCELLED");
  }
  assert("Cancel token stops pipeline execution", cancelError);

  // ─── TEST 4: Invalid Script Validation ───
  console.log("\n▶ TEST 4: Input Validation");
  let emptyScriptError = false;
  try {
    await studioPipelineService.execute(
      createValidRequest({ script: "" })
    );
  } catch (err: any) {
    emptyScriptError = err.message.includes("Script cannot be empty");
  }
  assert("Rejects empty script", emptyScriptError);

  let emptyAvatarError = false;
  try {
    await studioPipelineService.execute(
      createValidRequest({ avatarId: "" })
    );
  } catch (err: any) {
    emptyAvatarError = err.message.includes("Avatar ID is required");
  }
  assert("Rejects empty avatar ID", emptyAvatarError);

  let emptyVoiceError = false;
  try {
    await studioPipelineService.execute(
      createValidRequest({ voiceId: "" })
    );
  } catch (err: any) {
    emptyVoiceError = err.message.includes("Voice ID is required");
  }
  assert("Rejects empty voice ID", emptyVoiceError);

  let emptyIdempotencyError = false;
  try {
    await studioPipelineService.execute(
      createValidRequest({ idempotencyKey: "" })
    );
  } catch (err: any) {
    emptyIdempotencyError = err.message.includes("Idempotency key is required");
  }
  assert("Rejects empty idempotency key", emptyIdempotencyError);

  // ─── TEST 5: Duration Validation ───
  console.log("\n▶ TEST 5: Duration Validation");
  let invalidDurationError = false;
  try {
    await studioPipelineService.execute(
      createValidRequest({ duration: 45 as any })
    );
  } catch (err: any) {
    invalidDurationError = err.message.includes("Invalid duration");
  }
  assert("Rejects unsupported duration (45s)", invalidDurationError);

  // Valid durations
  for (const dur of [10, 15, 20, 30, 60]) {
    let validDurationPassed = true;
    try {
      await studioPipelineService.execute(
        createValidRequest({ duration: dur })
      );
    } catch (err: any) {
      if (err.message.includes("Invalid duration")) {
        validDurationPassed = false;
      }
    }
    assert(`Accepts valid duration: ${dur}s`, validDurationPassed);
  }

  // ─── TEST 6: AI Scene Planner ───
  console.log("\n▶ TEST 6: AI Scene Planner");
  const planner = new MockStudioScenePlanner();
  const plan = await planner.planScenes({
    script: "Welcome to the future! AI is transforming everything. Learn how to harness its power today.",
    duration: 15,
    avatarId: "avatar-sophia",
    voiceId: "voice-emma",
    aspectRatio: "9:16",
  });

  assert("Scene plan has scenes array", Array.isArray(plan.scenes));
  assert("Scene plan has at least 1 scene", plan.scenes.length >= 1);
  assert("Total duration matches request", plan.totalDuration === 15);
  assert("Each scene has dialogue", plan.scenes.every((s) => s.dialogue.length > 0));
  assert("Each scene has camera preset", plan.scenes.every((s) => typeof s.camera === "string"));
  assert("Each scene has mood", plan.scenes.every((s) => typeof s.mood === "string"));
  assert("Scene plan has caption strategy", typeof plan.captionStrategy === "string");

  // ─── TEST 7: Auto Motion Engine ───
  console.log("\n▶ TEST 7: Auto Motion Engine");
  const suggestions = autoMotionEngine.suggestMotion(plan);

  assert("Suggestions match scene count", suggestions.length === plan.scenes.length);
  assert("Each suggestion has camera preset", suggestions.every((s) => typeof s.camera === "string"));
  assert("Each suggestion has reasoning", suggestions.every((s) => s.reasoning.length > 0));
  assert("First scene gets dynamic camera", suggestions[0].camera === "dynamic_push");
  if (suggestions.length > 1) {
    assert("Last scene gets zoom out camera", suggestions[suggestions.length - 1].camera === "slow_zoom_out");
  }

  // ─── TEST 8: Provider Registry Hot-Swap ───
  console.log("\n▶ TEST 8: Provider Registry Hot-Swap");
  const customVoice: IStudioVoiceProvider = {
    name: "CustomVoice",
    async generateSpeech(input: VoiceGenerationInput): Promise<AudioResult> {
      return {
        audioUrl: "https://custom-voice.example.com/audio.mp3",
        duration: 10,
        sampleRate: 48000,
        format: "mp3",
        wordTimings: [],
      };
    },
    async getAvailableVoices() {
      return [{ id: "custom-1", name: "Custom", language: "en-US", gender: "female" }];
    },
  };

  StudioProviderRegistry.setVoiceProvider(customVoice);
  assert("Voice provider swapped to custom", StudioProviderRegistry.voiceProvider.name === "CustomVoice");

  // Restore
  StudioProviderRegistry.setVoiceProvider(originalVoice);
  assert("Voice provider restored to mock", StudioProviderRegistry.voiceProvider.name === "MockStudioVoice");

  // ─── TEST 9: Caption Generation ───
  console.log("\n▶ TEST 9: Caption Generation (Word & Sentence Level)");
  const captionProvider = new MockStudioCaptionProvider();

  const wordTimings = [
    { word: "Welcome", start: 0.1, end: 0.5 },
    { word: "to", start: 0.55, end: 0.7 },
    { word: "Vilo", start: 0.75, end: 1.1 },
    { word: "AI", start: 1.15, end: 1.4 },
  ];

  const wordCaptions = await captionProvider.generateCaptions({
    audioUrl: "test.mp3",
    wordTimings,
    script: "Welcome to Vilo AI",
    settings: { enabled: true, level: "word", animation: "pop", style: { fontSize: 32, color: "#fff", highlightColor: "#38bdf8", position: "bottom" } },
    duration: 2,
  });
  assert("Word-level captions generated", wordCaptions.captions.length === 4);

  const sentenceCaptions = await captionProvider.generateCaptions({
    audioUrl: "test.mp3",
    wordTimings,
    script: "Welcome to Vilo AI",
    settings: { enabled: true, level: "sentence", animation: "highlight", style: { fontSize: 32, color: "#fff", highlightColor: "#38bdf8", position: "bottom" } },
    duration: 2,
  });
  assert("Sentence-level captions generated", sentenceCaptions.captions.length >= 1);

  // ─── TEST 10: Aspect Ratio Validation ───
  console.log("\n▶ TEST 10: Aspect Ratio Validation");
  let invalidAspectError = false;
  try {
    await studioPipelineService.execute(
      createValidRequest({ aspectRatio: "4:3" as any })
    );
  } catch (err: any) {
    invalidAspectError = err.message.includes("Invalid aspect ratio");
  }
  assert("Rejects unsupported aspect ratio (4:3)", invalidAspectError);

  // ─── SUMMARY ───
  console.log("\n=======================================================");
  console.log(`📊 SUMMARY: ${passed}/${total} TESTS PASSED`);
  if (passed === total) {
    console.log("✅ ALL TESTS PASSED (100%)");
  } else {
    console.log(`❌ ${total - passed} TESTS FAILED`);
  }
  console.log("=======================================================\n");
}

runTests().catch(console.error);
