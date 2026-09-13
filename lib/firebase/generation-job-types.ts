/**
 * Firebase Generation Job & Control Plane Type Definitions
 * Represents generationJobs/{jobId} and generatedAssets/{hash} schemas.
 */

import { VideoPlan } from "@/lib/ai/planning/types";
import { AspectRatio } from "@/lib/types";

export type FirebaseJobStatus =
  | "queued"
  | "planning"
  | "voice_generating"
  | "avatar_generating"
  | "lip_sync"
  | "compositing"
  | "rendering"
  | "completed"
  | "failed"
  | "cancelled";

export interface VoiceJobSnapshot {
  id?: string;
  status: "queued" | "processing" | "completed" | "failed" | "skipped";
  audioUrl?: string;
  duration?: number;
  cached?: boolean;
  costCredits?: number;
  voiceId?: string;
  error?: string;
}

export interface AvatarJobSnapshot {
  id?: string;
  status: "queued" | "processing" | "completed" | "failed" | "skipped";
  videoUrl?: string;
  duration?: number;
  cached?: boolean;
  costCredits?: number;
  avatarId?: string;
  error?: string;
}

export interface LipSyncJobSnapshot {
  id?: string;
  status: "queued" | "processing" | "completed" | "failed" | "skipped";
  videoUrl?: string;
  duration?: number;
  cached?: boolean;
  costCredits?: number;
  phonemeCount?: number;
  accuracy?: number;
  providerUsed?: "mock" | "remote" | "local";
  error?: string;
}

export interface RenderJobSnapshot {
  id?: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress?: number; // 0 to 100
  workerId?: string;
  resolution?: "720p" | "1080p" | "4k";
  format?: "mp4" | "webm" | "mov";
  fps?: number;
  fileSizeBytes?: number;
  error?: string;
}

export interface FirebaseGenerationJob {
  id: string;
  userId: string;
  projectId: string;
  status: FirebaseJobStatus;
  progress: number; // 0 to 100
  currentStep: string;
  message?: string;
  videoPlan: VideoPlan;
  voiceJob?: VoiceJobSnapshot;
  avatarJob?: AvatarJobSnapshot;
  lipSyncJob?: LipSyncJobSnapshot;
  renderJob?: RenderJobSnapshot;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  // Credit metadata
  creditsCost: number;
  creditsReserved: boolean;
  creditsSettled: boolean;
  reservationTxId?: string;
  // Execution metadata
  idempotencyKey: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface GeneratedAsset {
  hash: string; // SHA-256
  type: "audio" | "avatar" | "lipsync" | "video_plan" | "render";
  provider: string;
  source: Record<string, any>;
  url: string;
  duration: number;
  createdAt: string;
  metadata?: Record<string, any>;
}
