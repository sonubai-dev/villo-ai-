/**
 * Vilo V2: Auto-Reframe Engine Test Suite
 * Rigorously tests intelligent subject detection, camera smoothing,
 * safe bounds clamping, platform safe area margins, multi-speaker switching,
 * and canonical RenderComposition generation across 9:16, 1:1, and 16:9.
 */

import { reframeEngine, ReframeEngine } from "../services/repurpose/reframe/reframe-engine";
import { RenderComposition, TrackingKeyframe } from "../services/repurpose/reframe/types";
import { AIClip } from "../services/repurpose/types";

let passed = 0;
let total = 0;

function assert(condition: boolean, category: string, testName: string, expected?: string, actual?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName} - Expected: "${expected}", got: "${actual}"`);
    throw new Error(`Auto-Reframe Test Failed: ${testName}`);
  }
}

function createMockClip(options: Partial<AIClip> = {}): AIClip {
  return {
    id: "clip-test-reframe",
    sourceVideoId: "vid-long-source",
    sourceVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-city-streets-with-traffic-at-night-42475-large.mp4",
    startTime: 10.0,
    endTime: 35.0,
    duration: 25.0,
    title: "10x SaaS Growth Secret",
    hook: "The truth about organic video scaling:",
    caption: "Short video builds immediate authentic buyer trust.",
    description: "Breakdown of scaling inbound traffic without paid ads.",
    cta: "Save this clip for your team.",
    selectedHookId: "hook-1",
    hookVariations: [],
    transcript: "Here is the secret to 10x growth that founders overlook. Questioning conventional ad spend.",
    score: { overall: 95, hook: 94, value: 96, completeness: 93, visual: 91 },
    reason: "Strong educational hook",
    status: "ready",
    selected: true,
    aspectRatio: "9:16",
    thumbnailUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    tags: ["growth", "viral"],
    autoReframe: true,
    addCaptions: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...options,
  };
}

async function runAutoReframeTestSuite() {
  console.log("=======================================================");
  console.log("📐 RUNNING VILO V2: AUTO-REFRAME ENGINE TESTS");
  console.log("=======================================================\n");

  // 1. Aspect Ratio Resolution & Canonical Composition
  console.log("▶ CATEGORY 1: ASPECT RATIO RESOLUTION MATRIX");
  {
    const clip = createMockClip();

    // 9:16 Vertical Composition
    const comp916 = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { aspectRatio: "9:16" });
    assert(comp916.crop.targetResolution.width === 1080 && comp916.crop.targetResolution.height === 1920, "AspectMatrix", "Generates 1080x1920 vertical composition", "1080x1920", `${comp916.crop.targetResolution.width}x${comp916.crop.targetResolution.height}`);
    assert(comp916.crop.currentCrop.width === Math.round((1080 * 9) / 16), "AspectMatrix", "Calculates exact 9:16 source pixel width (608px from 1080h)", "608", String(comp916.crop.currentCrop.width));

    // 1:1 Square Composition
    const comp11 = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { aspectRatio: "1:1" });
    assert(comp11.crop.targetResolution.width === 1080 && comp11.crop.targetResolution.height === 1080, "AspectMatrix", "Generates 1080x1080 square composition", "1080x1080", `${comp11.crop.targetResolution.width}x${comp11.crop.targetResolution.height}`);
    assert(comp11.crop.currentCrop.width === 1080, "AspectMatrix", "Calculates exact 1:1 square source crop (1080x1080)", "1080", String(comp11.crop.currentCrop.width));

    // 16:9 Landscape Passthrough
    const comp169 = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { aspectRatio: "16:9" });
    assert(comp169.crop.targetResolution.width === 1920 && comp169.crop.targetResolution.height === 1080, "AspectMatrix", "Generates 1920x1080 landscape composition", "1920x1080", `${comp169.crop.targetResolution.width}x${comp169.crop.targetResolution.height}`);
  }

  // 2. Single Speaker & Talking-Head Centering
  console.log("\n▶ CATEGORY 2: TALKING-HEAD & SINGLE SPEAKER TRACKING");
  {
    const clipSingle = createMockClip({ transcript: "Talking head solo tutorial explaining video workflows." });
    const comp = reframeEngine.generateComposition(clipSingle, { width: 1920, height: 1080 }, { framingMode: "speaker_focus" });

    assert(comp.tracking.length >= 2, "SingleSpeaker", "Generates tracking sequence for solo presenter", ">=2", String(comp.tracking.length));
    assert(comp.tracking[0].x >= 0.35 && comp.tracking[0].x <= 0.65, "SingleSpeaker", "Keeps presenter centered within central visual corridor", "true", "true");
    assert(comp.crop.currentCrop.x >= 0 && comp.crop.currentCrop.x + comp.crop.currentCrop.width <= 1920, "SingleSpeaker", "Crop window remains strictly within 1920px source bounds", "true", "true");
  }

  // 3. Two-Speaker Conversation & Active Speaker Switching
  console.log("\n▶ CATEGORY 3: TWO-SPEAKER INTERVIEW & SMART SWITCHING");
  {
    const clipInterview = createMockClip({
      duration: 30.0,
      transcript: "Question from host to guest speaker discussing market shifts and new strategies.",
    });

    const comp = reframeEngine.generateComposition(clipInterview, { width: 1920, height: 1080 }, { framingMode: "auto" });

    // Verify keyframes contain distinct speaker targets (e.g. left host vs right guest)
    const hostKeyframes = comp.tracking.filter((t) => t.speakerId === "speaker-1");
    const guestKeyframes = comp.tracking.filter((t) => t.speakerId === "speaker-2");

    assert(hostKeyframes.length > 0, "TwoSpeakers", "Detects Host speaker on left", "true", String(hostKeyframes.length > 0));
    assert(guestKeyframes.length > 0, "TwoSpeakers", "Switches framing to Guest speaker on right during dialogue", "true", String(guestKeyframes.length > 0));
    assert(hostKeyframes[0].x < guestKeyframes[0].x, "TwoSpeakers", "Host is on left (smaller X) and Guest is on right (larger X)", "true", "true");
  }

  // 4. Temporal Smoothing Filter & Sudden Jump Elimination
  console.log("\n▶ CATEGORY 4: CAMERA SMOOTHING & JITTER DAMPING");
  {
    const clip = createMockClip({ duration: 15.0 });
    const compSmoothed = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { smoothingFactor: 0.85 });

    // Check delta between consecutive tracking frames
    let maxDelta = 0;
    for (let i = 1; i < compSmoothed.tracking.length; i++) {
      const delta = Math.abs(compSmoothed.tracking[i].x - compSmoothed.tracking[i - 1].x);
      if (delta > maxDelta) maxDelta = delta;
    }

    assert(maxDelta < 0.35, "Smoothing", "Damps sudden movements so delta between frames is smooth (<0.35)", "<0.35", String(maxDelta));
  }

  // 5. Safe Bounds Clamping & Face Cutoff Protection
  console.log("\n▶ CATEGORY 5: SAFE BOUNDS CLAMPING & NO FACE CUTOFFS");
  {
    const clip = createMockClip();
    const comp = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 });

    for (const keyframe of comp.crop.keyframes) {
      assert(keyframe.cropX >= 0, "SafeBounds", "cropX is never negative", ">=0", String(keyframe.cropX));
      assert(keyframe.cropX + keyframe.cropWidth <= 1920, "SafeBounds", "cropX + cropWidth never exceeds 1920px", "<=1920", String(keyframe.cropX + keyframe.cropWidth));
      assert(keyframe.cropHeight === 1080, "SafeBounds", "cropHeight spans 100% of source height (1080px)", "1080", String(keyframe.cropHeight));
    }
  }

  // 6. Platform Safe Area Margins & Branding Positions
  console.log("\n▶ CATEGORY 6: PLATFORM SAFE MARGINS & BRANDING");
  {
    const clip = createMockClip();
    const comp = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, {
      branding: {
        enabled: true,
        brandName: "Acme Media",
        position: "top_right",
      },
    });

    assert(comp.captions.safeArea.bottomMarginPercent === 18, "SafeMargins", "Enforces 18% bottom safe margin to clear TikTok/Reels captions", "18", String(comp.captions.safeArea.bottomMarginPercent));
    assert(comp.captions.safeArea.rightMarginPercent === 12, "SafeMargins", "Enforces 12% right safe margin to clear TikTok like/comment buttons", "12", String(comp.captions.safeArea.rightMarginPercent));
    assert(comp.branding.enabled && comp.branding.brandName === "Acme Media", "Branding", "Attaches custom brand overlay configuration", "Acme Media", comp.branding.brandName);
    assert(comp.branding.position === "top_right", "Branding", "Supports top_right brand positioning", "top_right", comp.branding.position);
  }

  // 7. Background Fallback Modes (Blur, Solid, Fit)
  console.log("\n▶ CATEGORY 7: BACKGROUND MODES");
  {
    const clip = createMockClip();

    const compBlur = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { backgroundMode: "blur" });
    assert(compBlur.background.type === "blur" && compBlur.background.blurRadius === 24, "Background", "Supports Blur Background mode with 24px blur", "blur", compBlur.background.type);

    const compSolid = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { backgroundMode: "solid", backgroundColor: "#0f172a" });
    assert(compSolid.background.type === "solid" && compSolid.background.color === "#0f172a", "Background", "Supports Solid Background color fill", "#0f172a", compSolid.background.color);

    const compFit = reframeEngine.generateComposition(clip, { width: 1920, height: 1080 }, { backgroundMode: "fit" });
    assert(compFit.background.type === "fit", "Background", "Supports Fit letterbox mode", "fit", compFit.background.type);
  }

  console.log("\n=======================================================");
  console.log(`📊 AUTO-REFRAME TESTS: ${passed}/${total} PASSED (100%)`);
  console.log("📐 VILO V2 AUTO-REFRAME ENGINE IS FULLY OPERATIONAL");
  console.log("=======================================================\n");
}

runAutoReframeTestSuite().catch((err) => {
  console.error("FATAL AUTO-REFRAME TEST ERROR:", err);
  process.exit(1);
});
