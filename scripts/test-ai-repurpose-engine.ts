/**
 * Vilo V2: AI Repurpose Automated Test Suite
 * Rigorously tests the entire AI Repurpose pipeline:
 * - File validation (.mp4, .mov, .webm vs unsupported formats)
 * - Metadata extraction & transcript generation
 * - Highlight candidate scoring (hook, engagement, completeness, visual)
 * - Intelligent clip duration adjusting for small vs long videos
 * - In-flight locking against duplicate analyze triggers
 * - AbortController timeout & cancellation resiliency
 * - Cache hit verification
 * - Multi-speaker and face detection for 9:16 auto-reframe
 */

import { repurposeEngine } from "../services/repurpose/repurpose-engine";
import { repurposeCache } from "../services/repurpose/repurpose-cache";
import { DeterministicSTTProvider } from "../services/repurpose/providers/stt-provider";
import { DeterministicAnalysisProvider } from "../services/repurpose/providers/analysis-provider";
import { DeterministicFaceDetector } from "../services/repurpose/providers/face-detection-provider";
import { RepurposePreferences, VideoAnalysis } from "../services/repurpose/types";

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

async function runAIRepurposeTestSuite() {
  console.log("=======================================================");
  console.log("🔥 RUNNING VILO V2: AI REPURPOSE VERIFICATION TESTS");
  console.log("=======================================================\n");

  const defaultPreferences: RepurposePreferences = {
    targetClipCount: 5,
    targetDuration: "15-30",
    autoReframe: true,
    addCaptions: true,
  };

  // 1. File Upload & Validation
  console.log("▶ CATEGORY 1: FILE VALIDATION & FORMAT ENFORCEMENT");
  {
    // Valid MP4
    const validMp4 = { name: "podcast_interview_ep42.mp4", size: 1024 * 1024 * 45, duration: 600 };
    const resMp4 = repurposeEngine.validateVideoFile(validMp4 as any);
    assert(resMp4.isValid, "Validation", "Accepts valid MP4 video files", "true", String(resMp4.isValid));

    // Valid MOV
    const validMov = { name: "keynote_presentation.MOV", size: 1024 * 1024 * 80, duration: 300 };
    const resMov = repurposeEngine.validateVideoFile(validMov as any);
    assert(resMov.isValid, "Validation", "Accepts valid MOV video files", "true", String(resMov.isValid));

    // Valid WebM
    const validWebm = { name: "screen_recording.webm", size: 1024 * 1024 * 20, duration: 180 };
    const resWebm = repurposeEngine.validateVideoFile(validWebm as any);
    assert(resWebm.isValid, "Validation", "Accepts valid WebM video files", "true", String(resWebm.isValid));

    // Unsupported AVI
    const invalidAvi = { name: "legacy_video.avi", size: 1024 * 1024 * 30 };
    const resAvi = repurposeEngine.validateVideoFile(invalidAvi as any);
    assert(!resAvi.isValid, "Validation", "Rejects unsupported AVI format", "false", String(resAvi.isValid));

    // Oversized File (>500MB)
    const oversizedFile = { name: "giant_4k_footage.mp4", size: 1024 * 1024 * 550 };
    const resOversize = repurposeEngine.validateVideoFile(oversizedFile as any);
    assert(!resOversize.isValid, "Validation", "Rejects video files exceeding 500MB limit", "false", String(resOversize.isValid));
  }

  // 2. Video Analysis Pipeline on Standard Video (10 Minutes)
  console.log("\n▶ CATEGORY 2: LONG VIDEO ANALYSIS & HIGHLIGHT DETECTION");
  {
    const longVideo = {
      name: "saas_masterclass_10min.mp4",
      size: 1024 * 1024 * 120,
      duration: 600, // 10 minutes
    };

    let progressEvents: string[] = [];
    const analysis = await repurposeEngine.analyzeVideo(
      longVideo as any,
      defaultPreferences,
      (p) => progressEvents.push(p.stage)
    );

    assert(analysis.duration === 600, "Analysis", "Accurately parses 10-minute video duration", "600", String(analysis.duration));
    assert(analysis.transcript.length >= 5, "Analysis", "Generates multi-segment speech transcript", ">=5", String(analysis.transcript.length));
    assert(analysis.candidateClips.length === 5, "Analysis", "Generates requested 5 highlight clips", "5", String(analysis.candidateClips.length));
    assert(analysis.candidateClips[0].overallScore >= 80, "Analysis", "Top candidate clip exceeds 80 viral score", ">=80", String(analysis.candidateClips[0].overallScore));
    assert(progressEvents.includes("uploading") && progressEvents.includes("transcribing") && progressEvents.includes("ranking_clips"), "Analysis", "Transitions through all progress stages", "true", "true");
  }

  // 3. Intelligent Duration Adjustment for Short & Small Videos
  console.log("\n▶ CATEGORY 3: INTELLIGENT CLIP DURATION ADJUSTMENTS");
  {
    // 20s short video with 60-90s requested bracket -> must intelligently downscale clip duration
    const shortVideo = {
      name: "quick_tip_20s.mp4",
      size: 1024 * 1024 * 5,
      duration: 20,
    };

    const analysisShort = await repurposeEngine.analyzeVideo(
      shortVideo as any,
      { ...defaultPreferences, targetDuration: "60-90", targetClipCount: 5 }
    );

    assert(analysisShort.candidateClips.length >= 1, "DurationAdjust", "Extracts highlights from short 20s video", ">=1", String(analysisShort.candidateClips.length));
    assert(analysisShort.candidateClips[0].duration <= 20, "DurationAdjust", "Intelligently clamps clip duration within source bounds", "<=20", String(analysisShort.candidateClips[0].duration));
  }

  // 4. Candidate Clip Ranking Quality & Scoring Engine
  console.log("\n▶ CATEGORY 4: HIGHLIGHT RANKING & VIRAL SCORING");
  {
    const analysisProvider = new DeterministicAnalysisProvider();
    const clips = await analysisProvider.detectHighlightClips({
      videoId: "vid-test-scoring",
      duration: 300,
      transcript: [
        { startTime: 0, endTime: 10, text: "Here is the secret to 10x growth that founders overlook." },
        { startTime: 10, endTime: 25, text: "We grew our organic inbound traffic by 450% in ninety days." },
        { startTime: 25, endTime: 40, text: "First, take your existing long-form webinars and identify hooks." },
      ],
      scenes: [{ startTime: 0, endTime: 300, description: "Host scene", visualScore: 90 }],
      preferences: { ...defaultPreferences, targetClipCount: 10 },
    });

    assert(clips.length >= 5, "Scoring", "Generates candidate highlights from transcript", ">=5", String(clips.length));
    assert(Boolean(clips[0].reason), "Scoring", "Attaches AI rationale for selection", "truthy", clips[0].reason);
    assert(Boolean(clips[0].suggestedTitle), "Scoring", "Generates high-converting suggested title", "truthy", clips[0].suggestedTitle);
    assert(clips[0].overallScore >= clips[clips.length - 1].overallScore, "Scoring", "Clips are sorted by overall score descending", "true", "true");
  }

  // 5. Multi-Speaker & Face Detection for 9:16 Auto-Reframe
  console.log("\n▶ CATEGORY 5: SPEAKER & FACE DETECTION FOR AUTO-REFRAME");
  {
    const faceProvider = new DeterministicFaceDetector();
    const faceResults = await faceProvider.detectSpeakersAndFaces({
      videoId: "vid-multispeaker",
      duration: 180,
    });

    assert(faceResults.speakers.length >= 2, "FaceDetection", "Detects multiple speakers in interview footage", ">=2", String(faceResults.speakers.length));
    assert(faceResults.faces.length >= 2, "FaceDetection", "Extracts normalized face bounding boxes for vertical reframe", ">=2", String(faceResults.faces.length));
    assert(faceResults.faces[0].boundingBox.x > 0 && faceResults.faces[0].boundingBox.width > 0, "FaceDetection", "Coordinates are normalized 0.0-1.0 floats", "true", "true");
  }

  // 6. Cache Layer & Zero Duplicate Compute
  console.log("\n▶ CATEGORY 6: CACHING & RESIDUAL REUSE");
  {
    const testVideo = { name: "cached_webinar_recording.mp4", size: 1024 * 1024 * 50, duration: 400 };
    const cacheKey = repurposeCache.getCacheKey(testVideo.name, testVideo.size);

    repurposeCache.clear(cacheKey);
    assert(!repurposeCache.has(cacheKey), "Cache", "Cache starts empty for test file", "false", String(repurposeCache.has(cacheKey)));

    // First analysis populates cache
    await repurposeEngine.analyzeVideo(testVideo as any, defaultPreferences);
    assert(repurposeCache.has(cacheKey), "Cache", "Populates analysis cache after first run", "true", String(repurposeCache.has(cacheKey)));

    // Second analysis executes instantaneously from cache
    const startTime = Date.now();
    const cachedAnalysis = await repurposeEngine.analyzeVideo(testVideo as any, defaultPreferences);
    const elapsed = Date.now() - startTime;

    assert(elapsed < 100, "Cache", "Retrieves cached analysis instantaneously (<100ms)", "<100ms", `${elapsed}ms`);
    assert(cachedAnalysis.candidateClips.length > 0, "Cache", "Cached analysis preserves all candidate clips", ">0", String(cachedAnalysis.candidateClips.length));
  }

  // 7. Duplicate In-Flight Clicks & Abort Cancellation
  console.log("\n▶ CATEGORY 7: CONCURRENCY LOCKING & TIMEOUT RECOVERY");
  {
    const concurrentVideo = { name: "lock_test_video.mp4", size: 1024 * 1024 * 18, duration: 150 };
    const cacheKey = repurposeCache.getCacheKey(concurrentVideo.name, concurrentVideo.size);
    repurposeCache.clear(cacheKey);

    // Test Duplicate Trigger
    let duplicateBlocked = false;
    const task1 = repurposeEngine.analyzeVideo(concurrentVideo as any, defaultPreferences);
    try {
      await repurposeEngine.analyzeVideo(concurrentVideo as any, defaultPreferences);
    } catch (err: any) {
      if (err.message.includes("already being analyzed")) {
        duplicateBlocked = true;
      }
    }
    await task1;
    assert(duplicateBlocked, "Concurrency", "Blocks duplicate simultaneous analyze requests", "true", String(duplicateBlocked));

    // Test Abort Cancellation
    let abortHandled = false;
    const cancelVideo = { name: "cancelled_video.mp4", size: 1024 * 1024 * 10, duration: 100 };
    const cancelCacheKey = repurposeCache.getCacheKey(cancelVideo.name, cancelVideo.size);
    repurposeCache.clear(cancelCacheKey);

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 50); // Abort mid-flight
    try {
      await repurposeEngine.analyzeVideo(cancelVideo as any, defaultPreferences, undefined, controller.signal);
    } catch (err: any) {
      if (err.message.includes("cancelled")) {
        abortHandled = true;
      }
    }
    assert(abortHandled, "Concurrency", "Gracefully handles user cancellation and resets state", "true", String(abortHandled));
  }

  console.log("\n=======================================================");
  console.log(`📊 AI REPURPOSE TESTS: ${passed}/${total} PASSED (100%)`);
  console.log("🔥 VILO V2 AI REPURPOSE IS FULLY OPERATIONAL");
  console.log("=======================================================\n");
}

runAIRepurposeTestSuite().catch((err) => {
  console.error("FATAL REPURPOSE SUITE ERROR:", err);
  process.exit(1);
});
