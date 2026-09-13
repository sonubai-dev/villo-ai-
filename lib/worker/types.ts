/**
 * Self-Hosted Media Worker Types & Interfaces
 */

import { Scene, AspectRatio, MotionPreset, TransitionType } from "@/lib/types";
import { VideoPlan, ScenePlan, VFXPlan, CaptionPlan, CameraPlan, MotionPlan } from "@/lib/ai/planning/types";

export interface WorkerJobClaim {
  jobId: string;
  workerId: string;
  claimedAt: string;
  expiresAt: string;
  status: "claimed" | "processing" | "completed" | "released";
}

export interface MediaProcessingTask {
  jobId: string;
  projectId: string;
  userId: string;
  videoPlan: VideoPlan;
  audioTrackUrl?: string;
  avatarVideoUrl?: string;
  syncedVideoUrl?: string;
  aspectRatio: AspectRatio;
  resolution: "720p" | "1080p" | "4k";
  format: "mp4" | "webm" | "mov";
  fps?: number;
}

export interface WorkerProcessingResult {
  jobId: string;
  outputVideoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fileSizeBytes: number;
  renderTimeMs: number;
  workerId: string;
  tempFilesCleaned: boolean;
}
