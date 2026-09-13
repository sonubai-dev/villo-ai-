/**
 * Vendor-Agnostic Avatar Provider Interface & Models
 */

import { AspectRatio } from "@/lib/types";

export type AvatarJobStatus = "queued" | "processing" | "completed" | "failed" | "cancelled";

export interface AvatarVideoInput {
  avatarId: string;
  script?: string;
  audioUrl?: string;
  resolution?: "720p" | "1080p" | "4k";
  aspectRatio?: AspectRatio;
  backgroundUrl?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface AvatarVideoOutput {
  providerJobId: string;
  status: AvatarJobStatus;
  videoUrl?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface IAvatarProvider {
  name: string;
  createAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoOutput>;
  getJobStatus(providerJobId: string): Promise<AvatarVideoOutput>;
  cancelJob(providerJobId: string): Promise<void>;
}
