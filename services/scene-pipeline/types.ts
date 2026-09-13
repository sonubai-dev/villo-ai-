/**
 * Vilo V1 Scene Pipeline - Type Definitions
 * Represents modular renderable scene units with progress tracking,
 * audio waveforms, avatar layers, and visual transformations.
 */

import { CaptionSettings, MotionPreset, AvatarLayout } from "@/lib/types";
import { WordTimingItem } from "@/services/avatar-voice/types";

export type SceneProcessingStatus = "queued" | "processing" | "completed" | "failed";

export interface RenderableSceneUnit {
  id: string;
  projectId: string;
  order: number;
  title: string;
  narration: string;
  voiceId: string;
  voiceAudioUrl?: string;
  voiceDuration: number;
  wordTimings: WordTimingItem[];
  avatarId: string;
  avatarVideoUrl?: string;
  avatarLayout: AvatarLayout;
  showAvatar: boolean;
  backgroundUrl: string;
  backgroundType: "image" | "video" | "gradient" | "solid";
  motionPreset: MotionPreset;
  onScreenText: string;
  captions: CaptionSettings;
  duration: number; // in seconds
  status: SceneProcessingStatus;
  progressPercent: number; // 0 - 100
  statusMessage?: string;
  error?: string;
  updatedAt: string;
}

export interface GenerateSceneParams {
  scene: Partial<RenderableSceneUnit>;
  regenerateVoice?: boolean;
  regenerateAvatar?: boolean;
  idempotencyKey?: string;
}
