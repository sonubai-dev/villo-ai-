/**
 * Unified AI Content Intelligence & Low-Cost Video Planning Interfaces
 */

import { MotionPreset, TransitionType } from "@/lib/types";
import {
  VideoPlan,
  ScenePlan,
  MotionPlan,
  VFXPlan,
  CaptionPlan,
  CameraPlan,
  VideoPlanningInput,
  ScriptRewriteInput,
  ScriptRewriteOutput,
  MotionVFXRecommendationInput,
  MotionVFXRecommendationOutput,
} from "./planning/types";

export * from "./planning/types";

export interface ScriptScenePlan {
  sceneNumber: number;
  title: string;
  script: string;
  duration: number; // in seconds
  visualPrompt: string;
  motionPreset: MotionPreset;
  transition: TransitionType;
  cameraFraming?: string;
  keywords?: string[];
}

export interface ScriptGenerationInput {
  topic: string;
  targetDurationSeconds?: number;
  tone?: "professional" | "enthusiastic" | "dramatic" | "educational" | "casual" | "promotional";
  audience?: string;
  targetPlatform?: "youtube" | "tiktok" | "instagram" | "linkedin" | "general";
  sceneCount?: number;
  additionalGuidelines?: string;
}

export interface ScriptGenerationOutput {
  title: string;
  summary: string;
  tone: string;
  targetDuration: number;
  scenes: ScriptScenePlan[];
}

export interface DetectedVisualRegion {
  id: string;
  label: string;
  x: number;      // 0 to 100 (% bounding box)
  y: number;
  width: number;
  height: number;
  suggestedScript: string;
  motionPreset: MotionPreset;
}

export interface ImageAnalysisInput {
  imageUrl: string;
  imageMimeType?: string;
  context?: string;
  splitMode?: "grid-2x2" | "columns-3" | "focus-zones" | "auto";
}

export interface ImageAnalysisOutput {
  title: string;
  description: string;
  mainSubject: string;
  visualTone: string;
  detectedRegions: DetectedVisualRegion[];
  suggestedScenes: ScriptScenePlan[];
}

export interface SlideAnalysis {
  slideNumber: number;
  headline: string;
  bulletPoints: string[];
  suggestedScript: string;
  visualSummary: string;
  suggestedMotion: MotionPreset;
  duration: number;
}

export interface DocumentAnalysisInput {
  documentText: string;
  documentType?: "presentation" | "article" | "pdf" | "outline";
  targetDurationPerSlide?: number;
}

export interface DocumentAnalysisOutput {
  documentTitle: string;
  summary: string;
  keyTakeaways: string[];
  slides: SlideAnalysis[];
}

export interface SceneGenerationInput {
  prompt: string;
  sceneCount?: number;
  stylePreset?: string;
  aspectRatio?: string;
}

export interface SceneGenerationOutput {
  title: string;
  totalDuration: number;
  scenes: ScriptScenePlan[];
}

/**
 * Unified Low-Cost Hybrid AI Provider Contract
 * AI handles high-leverage planning, analysis, and recommendations.
 * Deterministic engine handles video composition, styling, and rendering.
 */
export interface AIProvider {
  name: string;
  planVideo(input: VideoPlanningInput): Promise<VideoPlan>;
  rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput>;
  recommendMotionAndVFX(input: MotionVFXRecommendationInput): Promise<MotionVFXRecommendationOutput>;
  generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationOutput>;
  analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput>;
  analyzeDocument(input: DocumentAnalysisInput): Promise<DocumentAnalysisOutput>;
  generateScenes(input: SceneGenerationInput): Promise<SceneGenerationOutput>;
}
