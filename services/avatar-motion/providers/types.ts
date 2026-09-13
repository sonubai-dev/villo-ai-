/**
 * Provider Abstraction Contracts for AI Avatar + Motion Pipeline
 * Allows swapping Mock providers with ElevenLabs, HeyGen, and GPU renderers without UI changes.
 */

import { AspectRatio } from "@/lib/types";
import { AvatarMotionPresetId, BackgroundConfig, VideoDurationOption } from "@/lib/avatar-motion/types";

// ============================================================================
// 1. VOICE PROVIDER CONTRACT
// ============================================================================
export interface VoiceInput {
  text: string;
  voiceId: string;
  voiceType: "default" | "cloned";
  speed?: number;
  pitch?: number;
}

export interface VoiceResult {
  audioUrl: string;
  duration: number;
  wordsTimings?: Array<{ word: string; start: number; end: number }>;
}

export interface IVoiceProvider {
  name: string;
  generateSpeech(input: VoiceInput): Promise<VoiceResult>;
}

// ============================================================================
// 2. AVATAR PROVIDER CONTRACT
// ============================================================================
export interface AvatarVideoInput {
  avatarId: string;
  audioUrl: string;
  script: string;
  aspectRatio: AspectRatio;
}

export interface AvatarVideoResult {
  avatarVideoUrl: string;
  duration: number;
}

export interface IAvatarProvider {
  name: string;
  generateAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoResult>;
}

// ============================================================================
// 3. MOTION PROVIDER CONTRACT
// ============================================================================
export interface MotionInput {
  motionPreset: AvatarMotionPresetId;
  duration: number;
  aspectRatio: AspectRatio;
  videoUrl: string;
}

export interface MotionResult {
  motionVideoUrl: string;
  transformMatrix: string;
}

export interface IMotionProvider {
  name: string;
  applyMotion(input: MotionInput): Promise<MotionResult>;
}

// ============================================================================
// 4. VIDEO PROVIDER CONTRACT
// ============================================================================
export interface VideoRenderInput {
  avatarVideoUrl: string;
  audioUrl: string;
  background: BackgroundConfig;
  aspectRatio: AspectRatio;
  captions: boolean;
  script: string;
  duration: number;
  resolution: "720p" | "1080p" | "4k";
}

export interface VideoResult {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: string;
  fps: number;
  format: string;
  fileSizeBytes: number;
}

export interface IVideoProvider {
  name: string;
  renderVideo(
    input: VideoRenderInput,
    onProgress?: (progress: number, stage: string, log: string) => void
  ): Promise<VideoResult>;
}

// ============================================================================
// 5. COMBINED PIPELINE INPUT & RESULT
// ============================================================================
export interface AvatarMotionPipelineInput {
  avatarId: string;
  script: string;
  voiceId: string;
  voiceType: "default" | "cloned";
  motion: AvatarMotionPresetId;
  duration: VideoDurationOption;
  background: BackgroundConfig;
  aspectRatio: AspectRatio;
  captions: boolean;
}

export interface AvatarMotionPipelineResult {
  projectId: string;
  jobId: string;
  videoResult: VideoResult;
  voiceResult: VoiceResult;
  avatarResult: AvatarVideoResult;
  motionResult: MotionResult;
  input: AvatarMotionPipelineInput;
  renderedAt: string;
}
