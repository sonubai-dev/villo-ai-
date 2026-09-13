/**
 * Strict Zod Validation Schemas for AI Outputs
 * Guarantees schema compliance and runtime safety for all Gemini responses.
 */

import { z } from "zod";

export const MotionPresetEnum = z.enum([
  "none",
  "zoom-in",
  "zoom-out",
  "pan-left",
  "pan-right",
  "pan-up",
  "pan-down",
  "slow-zoom",
  "cinematic-push",
  "cinematic-pull",
]);

export const TransitionTypeEnum = z.enum([
  "none",
  "fade",
  "dissolve",
  "zoom",
  "slide-left",
  "slide-right",
  "wipe-left",
  "wipe-right",
  "glitch",
  "blur",
  "cut",
]);

export const ScriptScenePlanSchema = z.object({
  sceneNumber: z.number().int().positive().default(1),
  title: z.string().min(1).default("Scene"),
  script: z.string().min(1),
  duration: z.number().positive().min(2).max(60).default(6),
  visualPrompt: z.string().min(1).default("Cinematic high resolution visuals"),
  motionPreset: MotionPresetEnum.default("zoom-in"),
  transition: TransitionTypeEnum.default("fade"),
  cameraFraming: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const ScriptGenerationOutputSchema = z.object({
  title: z.string().min(1).default("AI Generated Video"),
  summary: z.string().min(1).default("Video storyboard script"),
  tone: z.string().default("professional"),
  targetDuration: z.number().positive().default(30),
  scenes: z.array(ScriptScenePlanSchema).min(1),
});

export const DetectedVisualRegionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
  suggestedScript: z.string().min(1),
  motionPreset: MotionPresetEnum.default("zoom-in"),
});

export const ImageAnalysisOutputSchema = z.object({
  title: z.string().min(1).default("Image Visual Analysis"),
  description: z.string().min(1),
  mainSubject: z.string().min(1),
  visualTone: z.string().default("cinematic"),
  detectedRegions: z.array(DetectedVisualRegionSchema).default([]),
  suggestedScenes: z.array(ScriptScenePlanSchema).min(1),
});

export const SlideAnalysisSchema = z.object({
  slideNumber: z.number().int().positive(),
  headline: z.string().min(1),
  bulletPoints: z.array(z.string()).default([]),
  suggestedScript: z.string().min(1),
  visualSummary: z.string().min(1),
  suggestedMotion: MotionPresetEnum.default("zoom-in"),
  duration: z.number().positive().min(2).max(60).default(7),
});

export const DocumentAnalysisOutputSchema = z.object({
  documentTitle: z.string().min(1).default("Presentation Document"),
  summary: z.string().min(1),
  keyTakeaways: z.array(z.string()).default([]),
  slides: z.array(SlideAnalysisSchema).min(1),
});

export const SceneGenerationOutputSchema = z.object({
  title: z.string().min(1).default("Generated Video Scenes"),
  totalDuration: z.number().positive().default(30),
  scenes: z.array(ScriptScenePlanSchema).min(1),
});
