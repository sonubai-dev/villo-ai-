/**
 * Strict Zod Schemas for Low-Cost Video Plans
 * Enforces structured JSON output and provides safe defaults.
 */

import { z } from "zod";

export const CameraMovementTypeEnum = z.enum([
  "static",
  "slowPush",
  "slowZoomIn",
  "slowZoomOut",
  "panLeft",
  "panRight",
  "panUp",
  "panDown",
  "dynamicPush",
  "cinematic",
  "handheld",
]);

export const CameraPlanSchema = z.object({
  type: CameraMovementTypeEnum.default("slowPush"),
  framing: z.enum(["wide", "medium", "closeUp", "extremeCloseUp"]).default("medium"),
  speed: z.number().min(0.1).max(3.0).default(1.0),
  targetFocus: z.string().optional(),
});

export const MotionStyleTypeEnum = z.enum([
  "cameraPush",
  "zoomIn",
  "zoomOut",
  "panLeft",
  "panRight",
  "subtleFloat",
  "handheld",
  "static",
  "bounce",
  "pulse",
]);

export const MotionPlanSchema = z.object({
  type: MotionStyleTypeEnum.default("cameraPush"),
  speed: z.number().min(0.1).max(3.0).default(1.0),
  intensity: z.number().min(0).max(100).default(50),
});

export const VFXTypeEnum = z.enum([
  "glow",
  "spark",
  "smoke",
  "fire",
  "lightLeak",
  "lensFlare",
  "particles",
  "energy",
  "glitch",
  "filmGrain",
  "flash",
  "speedLines",
]);

export const VFXPlanSchema = z.object({
  type: VFXTypeEnum.default("glow"),
  intensity: z.number().min(0.0).max(1.0).default(0.3),
  blendMode: z.enum(["screen", "multiply", "overlay", "add", "normal"]).default("screen"),
  startTime: z.number().min(0).default(0),
  duration: z.number().min(0.5).default(5.0),
});

export const CaptionAnimationTypeEnum = z.enum([
  "highlight",
  "pop",
  "typewriter",
  "bounce",
  "clean",
  "minimal",
  "bold",
]);

export const CaptionPlanSchema = z.object({
  style: CaptionAnimationTypeEnum.default("highlight"),
  level: z.enum(["word", "sentence"]).default("word"),
  highlightColor: z.string().default("#38bdf8"),
  position: z.enum(["top", "center", "bottom"]).default("bottom"),
  fontSize: z.enum(["small", "medium", "large"]).default("medium"),
});

export const ScenePlanSchema = z.object({
  id: z.string().optional(),
  sceneNumber: z.number().int().positive().default(1),
  title: z.string().min(1).default("Scene"),
  script: z.string().min(1),
  duration: z.number().positive().min(2).max(60).default(5),
  avatar: z.boolean().default(true),
  avatarId: z.string().optional(),
  motion: MotionPlanSchema.default({ type: "cameraPush", speed: 1.0, intensity: 50 }),
  vfx: z.array(VFXPlanSchema).default([]),
  caption: CaptionPlanSchema.default({ style: "highlight", level: "word", highlightColor: "#38bdf8", position: "bottom", fontSize: "medium" }),
  camera: CameraPlanSchema.default({ type: "slowPush", framing: "medium", speed: 1.0 }),
  visualPrompt: z.string().optional(),
  suggestedVisualType: z.enum(["image", "video", "gradient", "solid"]).default("image"),
  transition: z.enum(["none", "fade", "dissolve", "zoom", "slide-left", "slide-right", "wipe-left", "wipe-right", "glitch", "blur", "cut"]).default("fade"),
  keywords: z.array(z.string()).default([]),
});

export const VideoPlanSchema = z.object({
  id: z.string().default(() => `plan-${Date.now()}`),
  title: z.string().min(1).default("AI Video Plan"),
  summary: z.string().min(1).default("Structured scene-by-scene plan for deterministic execution."),
  topic: z.string().optional(),
  tone: z.string().default("professional"),
  targetDuration: z.number().positive().default(15),
  aspectRatio: z.enum(["16:9", "9:16", "1:1", "4:5"]).default("9:16"),
  scenes: z.array(ScenePlanSchema).min(1),
  globalCaptionPlan: CaptionPlanSchema.optional(),
  metadata: z.object({
    modelTier: z.enum(["cheap", "standard", "strong"]).optional(),
    modelName: z.string().optional(),
    cached: z.boolean().optional(),
    tokenCost: z.number().optional(),
    latencyMs: z.number().optional(),
    generatedAt: z.string().default(() => new Date().toISOString()),
  }).optional(),
});

export const ScriptRewriteOutputSchema = z.object({
  originalScript: z.string(),
  rewrittenScript: z.string().min(1),
  estimatedDuration: z.number().positive().default(10),
  wordCount: z.number().int().positive().default(20),
  improvementsMade: z.array(z.string()).default([]),
});

export const MotionVFXRecommendationOutputSchema = z.object({
  recommendedCamera: CameraPlanSchema,
  recommendedMotion: MotionPlanSchema,
  recommendedVFX: z.array(VFXPlanSchema).default([]),
  recommendedCaption: CaptionPlanSchema,
  reasoning: z.string().default("Optimized for engagement and pacing."),
});
