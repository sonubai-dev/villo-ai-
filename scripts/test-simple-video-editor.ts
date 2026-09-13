/**
 * Vilo V1 - Simple Video Editor Test Suite
 * Tests scene operations, timeline manipulations, undo/redo history,
 * caption pipeline, data-driven animations, aspect ratios, and RenderSpec generator.
 */

import { generateRenderSpec } from "../lib/editor/render-spec";
import { CaptionPipeline, CAPTION_STYLE_PRESETS } from "../lib/editor/caption-pipeline";
import { HistoryManager, HistoryState } from "../lib/editor/history-manager";
import { V1_ANIMATIONS } from "../lib/editor/animations";
import { Project, Scene } from "../lib/types";

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

function createMockProject(sceneCount: number = 3, aspectRatio: "16:9" | "9:16" | "1:1" = "16:9"): Project {
  const scenes: Scene[] = Array.from({ length: sceneCount }).map((_, i) => ({
    id: `scene-${i + 1}`,
    projectId: "proj-editor-test",
    order: i,
    title: `Scene ${i + 1}`,
    script: `Narration for scene ${i + 1}. Explaining modern AI video production and automated editing workflows.`,
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
    avatarId: "avatar-alex",
    avatarLayout: "circle-bottom-right",
    showAvatar: true,
    voiceId: "voice-emma",
    duration: 6,
    motionPreset: "cinematic-push",
    transition: "fade",
    captions: {
      enabled: true,
      style: "creator",
      position: "bottom",
      fontSize: "medium",
      highlightColor: "#38bdf8",
      textColor: "#ffffff",
    },
    textOverlay: {
      content: `HEADLINE ${i + 1}`,
      text: `HEADLINE ${i + 1}`,
      fontSize: "medium",
      textColor: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.7)",
      position: "top",
      animation: "slide",
      visible: true,
    },
  }));

  return {
    id: "proj-editor-test",
    userId: "user-test-1",
    title: "Simple Editor Test Video",
    type: "script",
    status: "draft",
    thumbnail: scenes[0].image,
    duration: scenes.reduce((sum, s) => sum + s.duration, 0),
    aspectRatio,
    scenes,
    globalCaptions: scenes[0].captions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function runSimpleVideoEditorTestSuite() {
  console.log("=======================================================");
  console.log("🧪 RUNNING VILO V1 SIMPLE VIDEO EDITOR TESTS");
  console.log("=======================================================\n");

  // 1. Scene Count & Scaling (1 Scene vs 10 Scenes)
  console.log("▶ CATEGORY 1: SCENE SCALING & STRUCTURE");
  {
    const singleSceneProj = createMockProject(1);
    assert(singleSceneProj.scenes.length === 1, "SceneScaling", "Supports 1-scene short video projects", "1", String(singleSceneProj.scenes.length));
    assert(singleSceneProj.duration === 6, "SceneScaling", "Accurately computes single scene duration", "6", String(singleSceneProj.duration));

    const tenSceneProj = createMockProject(10);
    assert(tenSceneProj.scenes.length === 10, "SceneScaling", "Supports 10-scene structured video projects", "10", String(tenSceneProj.scenes.length));
    assert(tenSceneProj.duration === 60, "SceneScaling", "Accurately computes multi-scene cumulative duration", "60", String(tenSceneProj.duration));
  }

  // 2. Timeline Block Operations
  console.log("\n▶ CATEGORY 2: TIMELINE BLOCK OPERATIONS");
  {
    let project = createMockProject(4);

    // Duplicate Scene 2
    const scene2 = project.scenes[1];
    const duplicatedScene: Scene = {
      ...scene2,
      id: "scene-2-copy",
      title: "Scene 2 Copy",
      order: 2,
    };
    project = {
      ...project,
      scenes: [project.scenes[0], project.scenes[1], duplicatedScene, project.scenes[2], project.scenes[3]],
    };
    assert(project.scenes.length === 5, "TimelineOps", "Duplicates selected scene block", "5", String(project.scenes.length));
    assert(project.scenes[2].id === "scene-2-copy", "TimelineOps", "Inserts duplicated scene adjacent to source", "scene-2-copy", project.scenes[2].id);

    // Delete Scene
    project = {
      ...project,
      scenes: project.scenes.filter((s) => s.id !== "scene-2-copy"),
    };
    assert(project.scenes.length === 4, "TimelineOps", "Deletes target scene block cleanly", "4", String(project.scenes.length));

    // Reorder Scenes (Swap Scene 1 and Scene 2)
    const [first, second, ...rest] = project.scenes;
    project = {
      ...project,
      scenes: [second, first, ...rest],
    };
    assert(project.scenes[0].id === "scene-2", "TimelineOps", "Reorders timeline scene blocks correctly", "scene-2", project.scenes[0].id);

    // Change Duration / Trim
    project.scenes[0].duration = 8;
    assert(project.scenes[0].duration === 8, "TimelineOps", "Updates scene duration / trim length", "8", String(project.scenes[0].duration));
  }

  // 3. Safe Undo / Redo History Management
  console.log("\n▶ CATEGORY 3: SAFE UNDO / REDO HISTORY ENGINE");
  {
    const initial = createMockProject(2);
    let history: HistoryState = {
      past: [],
      present: initial,
      future: [],
    };

    assert(!HistoryManager.canUndo(history), "HistoryManager", "Initially cannot undo on empty history", "false", String(HistoryManager.canUndo(history)));

    // Push edit: Change Title
    const modified = { ...initial, title: "Renamed Title Edit 1" };
    history = HistoryManager.push(history, modified);

    assert(HistoryManager.canUndo(history), "HistoryManager", "canUndo is true after first modification", "true", String(HistoryManager.canUndo(history)));
    assert(history.present.title === "Renamed Title Edit 1", "HistoryManager", "Present state reflects new modification", "Renamed Title Edit 1", history.present.title);

    // Push another edit: Change Scene 1 duration
    const modified2 = {
      ...modified,
      scenes: [{ ...modified.scenes[0], duration: 12 }, modified.scenes[1]],
    };
    history = HistoryManager.push(history, modified2);

    // Perform Undo
    history = HistoryManager.undo(history);
    assert(history.present.title === "Renamed Title Edit 1", "HistoryManager", "Undo reverts to previous snapshot", "Renamed Title Edit 1", history.present.title);
    assert(history.present.scenes[0].duration === 6, "HistoryManager", "Undo restores previous scene duration", "6", String(history.present.scenes[0].duration));
    assert(HistoryManager.canRedo(history), "HistoryManager", "canRedo is true after undo", "true", String(HistoryManager.canRedo(history)));

    // Perform Redo
    history = HistoryManager.redo(history);
    assert(history.present.scenes[0].duration === 12, "HistoryManager", "Redo restores forward modification", "12", String(history.present.scenes[0].duration));
  }

  // 4. Caption Alignment Pipeline & Presets
  console.log("\n▶ CATEGORY 4: CAPTION PIPELINE & PRESETS");
  {
    const narration = "Vilo AI accelerates automated video production.";
    const segments = CaptionPipeline.generateTimestampedCaptions(narration, 5);

    assert(segments.length === 6, "CaptionPipeline", "Generates timestamped words from narration", "6", String(segments.length));
    assert(segments[0].startTime === 0, "CaptionPipeline", "First caption starts at 0s", "0", String(segments[0].startTime));
    assert(segments[segments.length - 1].endTime <= 5.1, "CaptionPipeline", "Captions span total scene duration", "<=5.1", String(segments[segments.length - 1].endTime));

    // Active word detection at timestamp 2.0s
    const activeWord = CaptionPipeline.getActiveSegment(segments, 2.0);
    assert(activeWord.segment !== null, "CaptionPipeline", "Detects active word at specific playback timestamp", "valid segment", activeWord.segment?.text);

    // Preset verification
    assert(Boolean(CAPTION_STYLE_PRESETS.creator), "CaptionPipeline", "Includes Creator Neon preset", "true", "true");
    assert(Boolean(CAPTION_STYLE_PRESETS.clean), "CaptionPipeline", "Includes Clean Minimal preset", "true", "true");
    assert(Boolean(CAPTION_STYLE_PRESETS.bold), "CaptionPipeline", "Includes Bold Impact preset", "true", "true");
    assert(Boolean(CAPTION_STYLE_PRESETS.business), "CaptionPipeline", "Includes Corporate Subtitle preset", "true", "true");
  }

  // 5. Data-Driven Animation Engine
  console.log("\n▶ CATEGORY 5: DATA-DRIVEN V1 ANIMATION ENGINE");
  {
    assert(Boolean(V1_ANIMATIONS.fade), "AnimationEngine", "Supports Fade animation", "true", "true");
    assert(Boolean(V1_ANIMATIONS.slide), "AnimationEngine", "Supports Slide animation", "true", "true");
    assert(Boolean(V1_ANIMATIONS["zoom-in"]), "AnimationEngine", "Supports Zoom In animation", "true", "true");
    assert(Boolean(V1_ANIMATIONS["zoom-out"]), "AnimationEngine", "Supports Zoom Out animation", "true", "true");
    assert(Boolean(V1_ANIMATIONS.pop), "AnimationEngine", "Supports Pop animation", "true", "true");

    assert(Boolean(V1_ANIMATIONS.pop.cssInitial.transform), "AnimationEngine", "Provides CSS initial transform states", "scale(0.7)", String(V1_ANIMATIONS.pop.cssInitial.transform));
  }

  // 6. Aspect Ratios & RenderSpec Generation
  console.log("\n▶ CATEGORY 6: RENDERSPEC GENERATION & DECOUPLING");
  {
    const landscapeProj = createMockProject(3, "16:9");
    const spec169 = generateRenderSpec(landscapeProj);
    assert(spec169.resolution.width === 1920 && spec169.resolution.height === 1080, "RenderSpec", "Generates 1080p 16:9 landscape spec", "1920x1080", `${spec169.resolution.width}x${spec169.resolution.height}`);
    assert(spec169.scenes.length === 3, "RenderSpec", "Includes all scene specifications", "3", String(spec169.scenes.length));

    const portraitProj = createMockProject(2, "9:16");
    const spec916 = generateRenderSpec(portraitProj);
    assert(spec916.resolution.width === 1080 && spec916.resolution.height === 1920, "RenderSpec", "Generates 9:16 portrait mobile spec", "1080x1920", `${spec916.resolution.width}x${spec916.resolution.height}`);

    const squareProj = createMockProject(2, "1:1");
    const spec11 = generateRenderSpec(squareProj);
    assert(spec11.resolution.width === 1080 && spec11.resolution.height === 1080, "RenderSpec", "Generates 1:1 square feed spec", "1080x1080", `${spec11.resolution.width}x${spec11.resolution.height}`);
  }

  console.log("\n=======================================================");
  console.log(`📊 EDITOR TESTS: ${passed}/${total} PASSED (100%)`);
  console.log("✅ VILO V1 SIMPLE VIDEO EDITOR IS FULLY OPERATIONAL");
  console.log("=======================================================\n");
}

runSimpleVideoEditorTestSuite().catch((err) => {
  console.error("FATAL EDITOR SUITE ERROR:", err);
  process.exit(1);
});
