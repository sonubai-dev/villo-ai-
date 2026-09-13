/**
 * Vilo V1 Content Generation Engine - Type Definitions
 * Complete models for PDF extraction, structured script generation, and scene blueprints.
 */

export type ContentInputMode = "prompt" | "pdf" | "paste";

export type ScriptTone =
  | "Professional"
  | "Enthusiastic"
  | "Warm"
  | "Authoritative"
  | "Conversational"
  | "Direct"
  | "Educational";

export type GenerationStage =
  | "idle"
  | "preparing"
  | "extracting"
  | "generating"
  | "finalizing"
  | "complete"
  | "failed";

export interface ProgressState {
  stage: GenerationStage;
  percent: number;
  message: string;
  detail?: string;
}

export interface PDFValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ExtractedDocumentSection {
  index: number;
  heading: string;
  paragraphs: string[];
  bulletPoints: string[];
  rawText: string;
  wordCount: number;
}

export interface PDFExtractionResult {
  fileName: string;
  fileSizeBytes: number;
  fileType: string;
  pageCount: number;
  totalWordCount: number;
  sections: ExtractedDocumentSection[];
  cleanText: string;
  summary: string;
}

export interface StructuredScene {
  sceneId: number;
  duration: number; // seconds
  narration: string;
  visualDescription: string;
  onScreenText: string;
  transition: "fade" | "zoom" | "slide-left" | "slide-right" | "cut";
  captionText: string;
  suggestedImage?: string;
  motionPreset?: "none" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "cinematic-push" | "slow-zoom";
}

export interface StructuredScript {
  id: string;
  title: string;
  topic?: string;
  hook: string;
  introduction: string;
  mainPoints: string[];
  cta: string;
  scenes: StructuredScene[];
  targetDurationSeconds: number;
  totalWordCount: number;
  tone: ScriptTone;
  sourceType: ContentInputMode;
  sourceFileName?: string;
  createdAt: string;
}

export interface ContentGenerationRequest {
  mode: ContentInputMode;
  prompt?: string;
  pastedText?: string;
  pdfFile?: File;
  extractedDoc?: PDFExtractionResult;
  tone?: ScriptTone;
  targetDurationSeconds?: number;
  sceneCount?: number;
  language?: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
}
