/**
 * Low-Cost Hybrid AI Video Planning Type Definitions
 * AI creates structured Plan objects (VideoPlan, ScenePlan, MotionPlan, VFXPlan, CaptionPlan, CameraPlan).
 * The deterministic rendering engine executes them.
 */

import { AspectRatio, MotionPreset, TransitionType } from "@/lib/types";

// ============================================================================
// 1. SUB-PLAN OBJECTS
// ============================================================================

export type CameraMovementType =
  | "static"
  | "slowPush"
  | "slowZoomIn"
  | "slowZoomOut"
  | "panLeft"
  | "panRight"
  | "panUp"
  | "panDown"
  | "dynamicPush"
  | "cinematic"
  | "handheld";

export interface CameraPlan {
  type: CameraMovementType;
  framing?: "wide" | "medium" | "closeUp" | "extremeCloseUp";
  speed?: number; // 0.5 to 2.0 (default: 1.0)
  targetFocus?: string;
}

export type MotionStyleType =
  | "cameraPush"
  | "zoomIn"
  | "zoomOut"
  | "panLeft"
  | "panRight"
  | "subtleFloat"
  | "handheld"
  | "static"
  | "bounce"
  | "pulse";

export interface MotionPlan {
  type: MotionStyleType;
  speed?: number; // 0.5 to 2.0
  intensity?: number; // 0 to 100
}

export type VFXType =
  | "glow"
  | "spark"
  | "smoke"
  | "fire"
  | "lightLeak"
  | "lensFlare"
  | "particles"
  | "energy"
  | "glitch"
  | "filmGrain"
  | "flash"
  | "speedLines";

export interface VFXPlan {
  type: VFXType;
  intensity?: number; // 0.0 to 1.0
  blendMode?: "screen" | "multiply" | "overlay" | "add" | "normal";
  startTime?: number; // offset in seconds
  duration?: number; // duration in seconds
}

export type CaptionAnimationType =
  | "highlight"
  | "pop"
  | "typewriter"
  | "bounce"
  | "clean"
  | "minimal"
  | "bold";

export interface CaptionPlan {
  style: CaptionAnimationType;
  level?: "word" | "sentence";
  highlightColor?: string;
  position?: "top" | "center" | "bottom";
  fontSize?: "small" | "medium" | "large";
}

// ============================================================================
// 2. SCENE & VIDEO PLAN
// ============================================================================

export interface ScenePlan {
  id?: string;
  sceneNumber: number;
  title: string;
  script: string;
  duration: number; // in seconds
  avatar: boolean;
  avatarId?: string;
  motion: MotionPlan;
  vfx: VFXPlan[];
  caption: CaptionPlan;
  camera: CameraPlan;
  visualPrompt?: string;
  suggestedVisualType?: "image" | "video" | "gradient" | "solid";
  transition?: TransitionType;
  keywords?: string[];
}

export interface VideoPlan {
  id: string;
  title: string;
  summary: string;
  topic?: string;
  tone: string;
  targetDuration: number;
  aspectRatio: AspectRatio;
  scenes: ScenePlan[];
  globalCaptionPlan?: CaptionPlan;
  metadata?: {
    modelTier?: "cheap" | "standard" | "strong";
    modelName?: string;
    cached?: boolean;
    tokenCost?: number;
    latencyMs?: number;
    generatedAt: string;
  };
}

// ============================================================================
// 3. INPUT / OUTPUT CONTRACTS FOR AI PLANNING
// ============================================================================

export interface VideoPlanningInput {
  topic: string;
  script?: string;
  targetDurationSeconds?: number;
  tone?: "professional" | "enthusiastic" | "dramatic" | "educational" | "casual" | "promotional";
  audience?: string;
  targetPlatform?: "youtube" | "tiktok" | "instagram" | "linkedin" | "general";
  aspectRatio?: AspectRatio;
  includeAvatar?: boolean;
  sceneCount?: number;
  additionalGuidelines?: string;
}

export interface ScriptRewriteInput {
  script: string;
  goal: "shorten" | "expand" | "change_tone" | "punchy" | "clarity";
  targetTone?: "professional" | "enthusiastic" | "dramatic" | "educational" | "casual" | "promotional";
  targetDurationSeconds?: number;
}

export interface ScriptRewriteOutput {
  originalScript: string;
  rewrittenScript: string;
  estimatedDuration: number;
  wordCount: number;
  improvementsMade: string[];
}

export interface MotionVFXRecommendationInput {
  scriptSnippet: string;
  sceneContext?: string;
  mood?: string;
  duration: number;
}

export interface MotionVFXRecommendationOutput {
  recommendedCamera: CameraPlan;
  recommendedMotion: MotionPlan;
  recommendedVFX: VFXPlan[];
  recommendedCaption: CaptionPlan;
  reasoning: string;
}
