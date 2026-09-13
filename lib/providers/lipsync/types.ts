/**
 * Vendor-Agnostic LipSync Provider Interface & Type Definitions
 * Supports Mock, Remote API, and Experimental Local GPU/Compute Models (Wav2Lip, LivePortrait, SadTalker).
 */

import { AspectRatio } from "@/lib/types";

export interface TimestampedWord {
  word: string;
  start: number;
  end: number;
}

export interface LipSyncInput {
  avatarVideoUrl: string;
  audioUrl: string;
  wordTimings?: TimestampedWord[];
  duration: number;
  aspectRatio?: AspectRatio;
  resolution?: "720p" | "1080p" | "4k";
  modelType?: "wav2lip" | "liveportrait" | "sadtalker" | "standard";
  userId?: string;
  projectId?: string;
}

export interface LipSyncResult {
  syncedVideoUrl: string;
  duration: number;
  phonemeCount: number;
  syncAccuracy: number;
  cached: boolean;
  providerUsed: "mock" | "remote" | "local";
  modelName?: string;
  latencyMs?: number;
}

export interface ILipSyncProvider {
  readonly name: string;
  synchronize(input: LipSyncInput): Promise<LipSyncResult>;
  isAvailable(): Promise<boolean>;
}
