/**
 * Vilo V1 - Avatar + Voice + Scene Pipeline Test Suite
 * Validates Avatar Library, Voice Library, TTS synthesis, Scene generation,
 * single-scene regeneration, in-flight locks, and error recovery.
 */

import { avatarLibrary } from "../services/avatar-voice/avatar-library";
import { voiceLibrary } from "../services/avatar-voice/voice-library";
import { DeterministicTTSProvider } from "../services/avatar-voice/tts-provider";
import { sceneProvider } from "../services/scene-pipeline/scene-provider";

let passed = 0;
let total = 0;

function assert(condition: boolean, category: string, testName: string, expected?: string, actual?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName} - Expected: "${expected}", got: "${actual}"`);
    throw new Error(`Test Failed: ${testName}`);
  }
}

async function runAvatarVoiceSceneTestSuite() {
  console.log("=======================================================");
  console.log("🧪 RUNNING VILO V1 AVATAR + VOICE + SCENE PIPELINE TESTS");
  console.log("=======================================================\n");

  const tts = new DeterministicTTSProvider();

  // 1. Avatar Library Tests
  console.log("▶ CATEGORY 1: AVATAR LIBRARY CATALOG & FILTERING");
  {
    const allAvatars = avatarLibrary.listAvatars();
    assert(allAvatars.length >= 6, "AvatarLibrary", "Lists complete catalog of avatars", ">=6", String(allAvatars.length));

    const femaleAvatars = avatarLibrary.listAvatars({ gender: "female" });
    assert(femaleAvatars.every((a) => a.gender === "female"), "AvatarLibrary", "Filters avatars accurately by gender", "all female", "valid");

    const realEstateAvatars = avatarLibrary.listAvatars({ style: "Real Estate" });
    assert(realEstateAvatars.length >= 1, "AvatarLibrary", "Filters avatars by professional style preset", ">=1", String(realEstateAvatars.length));

    const specificAvatar = avatarLibrary.getAvatarById("avatar-alex");
    assert(Boolean(specificAvatar.previewVideo), "AvatarLibrary", "Avatar contains valid preview video URL", "valid url", specificAvatar.previewVideo);
    assert(Boolean(specificAvatar.thumbnail), "AvatarLibrary", "Avatar contains valid thumbnail image", "valid image", specificAvatar.thumbnail);
  }

  // 2. Voice Library Tests
  console.log("\n▶ CATEGORY 2: VOICE LIBRARY CATALOG & SAMPLE AUDIO");
  {
    const allVoices = voiceLibrary.listVoices();
    assert(allVoices.length >= 6, "VoiceLibrary", "Lists complete catalog of neural voices", ">=6", String(allVoices.length));

    const englishVoices = voiceLibrary.listVoices({ language: "English" });
    assert(englishVoices.length >= 4, "VoiceLibrary", "Filters voices by spoken language", ">=4", String(englishVoices.length));

    const danielVoice = voiceLibrary.getVoiceById("voice-daniel");
    assert(Boolean(danielVoice.previewAudio), "VoiceLibrary", "Voice contains preview audio stream", "valid audio", danielVoice.previewAudio);
    assert(danielVoice.gender === "male", "VoiceLibrary", "Voice metadata correctly specifies gender", "male", danielVoice.gender);
  }

  // 3. TTS Provider & Speech Synthesis
  console.log("\n▶ CATEGORY 3: TTS SYNTHESIS & WORD-LEVEL TIMINGS");
  {
    const sampleText = "Welcome to Vilo AI. Generate structured scenes with AI narration and avatars.";
    const speechResult = await tts.generate({
      text: sampleText,
      voiceId: "voice-emma",
      speed: 1.0,
    });

    assert(Boolean(speechResult.audioUrl), "TTSProvider", "Generates audio stream URL", "valid url", speechResult.audioUrl);
    assert(speechResult.duration >= 2, "TTSProvider", "Calculates accurate speech duration", ">=2s", `${speechResult.duration}s`);
    assert(speechResult.wordTimings.length > 5, "TTSProvider", "Generates word-level timestamps for captions", ">5 timings", String(speechResult.wordTimings.length));
    assert(speechResult.wordTimings[0].start < speechResult.wordTimings[0].end, "TTSProvider", "Word timing intervals are mathematically valid", "start < end", "valid");
  }

  // 4. Scene Generation Unit & In-Flight Lock Protection
  console.log("\n▶ CATEGORY 4: RENDERABLE SCENE UNIT & LOCK GUARDS");
  {
    const sceneUnit = await sceneProvider.generateScene({
      scene: {
        id: "sc-test-101",
        projectId: "proj-unit-test",
        narration: "Discover modern video production with deterministic rendering.",
        avatarId: "avatar-alex",
        voiceId: "voice-daniel",
        duration: 6,
        motionPreset: "cinematic-push",
        onScreenText: "MODERN PRODUCTION",
      },
    });

    assert(sceneUnit.status === "completed", "SceneProvider", "Generates complete renderable scene unit", "completed", sceneUnit.status);
    assert(Boolean(sceneUnit.voiceAudioUrl), "SceneProvider", "Binds voice audio to scene unit", "valid audio", sceneUnit.voiceAudioUrl);
    assert(Boolean(sceneUnit.avatarVideoUrl), "SceneProvider", "Binds avatar video layer to scene unit", "valid video", sceneUnit.avatarVideoUrl);
    assert(sceneUnit.wordTimings.length > 0, "SceneProvider", "Attaches synchronized word timings to scene", ">0", String(sceneUnit.wordTimings.length));

    // Test Single Scene Regeneration
    const regenerated = await sceneProvider.regenerateSingleScene(sceneUnit, {
      narration: "Updated narration: faster turnaround and lower costs.",
      onScreenText: "COST SAVINGS",
    });

    assert(regenerated.id === sceneUnit.id, "SceneProvider", "Single-scene regeneration preserves scene ID", sceneUnit.id, regenerated.id);
    assert(regenerated.onScreenText === "COST SAVINGS", "SceneProvider", "Updates on-screen text in regenerated scene", "COST SAVINGS", regenerated.onScreenText);
  }

  // 5. Duplicate In-Flight Generation Prevention Guard
  console.log("\n▶ CATEGORY 5: DUPLICATE CLICK & IN-FLIGHT LOCK PROTECTION");
  {
    const sceneParams = {
      scene: {
        id: "sc-lock-test",
        projectId: "proj-lock",
        narration: "Testing in-flight lock.",
      },
      idempotencyKey: "idem-lock-1",
    };

    // Start long generation
    const promise1 = sceneProvider.generateScene(sceneParams);

    // Attempt concurrent duplicate generation on same key
    let duplicateBlocked = false;
    try {
      await sceneProvider.generateScene(sceneParams);
    } catch (err: any) {
      if (err.message.includes("already generating")) {
        duplicateBlocked = true;
      }
    }

    assert(duplicateBlocked, "LockProtection", "Blocks concurrent duplicate generation requests", "true", String(duplicateBlocked));
    await promise1; // Wait for initial to finish cleanly
  }

  console.log("\n=======================================================");
  console.log(`📊 PIPELINE TESTS: ${passed}/${total} PASSED (100%)`);
  console.log("✅ AVATAR + VOICE + SCENE PIPELINE FULLY VERIFIED");
  console.log("=======================================================\n");
}

runAvatarVoiceSceneTestSuite().catch((err) => {
  console.error("FATAL PIPELINE SUITE ERROR:", err);
  process.exit(1);
});
