/**
 * Video Rendering Worker Types & Specifications
 */

import { Scene, AspectRatio, MotionPreset, TransitionType } from "@/lib/types";

export type OutputResolution = "720p" | "1080p" | "4k";
export type VideoCodec = "h264" | "hevc" | "vp9";
export type AudioCodec = "aac" | "mp3" | "opus";

export interface RenderDimensions {
  width: number;
  height: number;
}

export interface RenderSettings {
  aspectRatio: AspectRatio; // "16:9" | "9:16" | "1:1"
  resolution: OutputResolution;
  fps: number; // default 30
  videoCodec: VideoCodec; // default "h264"
  audioCodec: AudioCodec; // default "aac"
  bitrate: string; // e.g. "8M"
  crf: number; // default 21
}

export interface RenderJobPayload {
  projectId: string;
  generationJobId: string;
  userId: string;
  scenes: Scene[];
  assetUrls?: Record<string, string>; // sceneId -> imageUrl
  audioUrls?: Record<string, string>; // sceneId -> audioUrl
  avatarVideos?: Record<string, string>; // sceneId -> avatarVideoUrl
  backgroundMusicUrl?: string;
  backgroundMusicVolume?: number;
  renderSettings: RenderSettings;
}

export interface RenderJobResult {
  generationJobId: string;
  projectId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  fileSizeBytes: number;
  dimensions: RenderDimensions;
  fps: number;
  codec: string;
  renderTimeMs: number;
}
