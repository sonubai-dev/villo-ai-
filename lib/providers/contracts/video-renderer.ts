/**
 * Video Renderer Interface for Vilo V1
 * Coordinates final multi-pass scene compositing, audio mixing, and video container export.
 */

import { Project } from "@/lib/types";

export interface RenderOptions {
  resolution: "720p" | "1080p" | "4k";
  format: "mp4" | "webm" | "mov";
  fps?: number;
  quality?: "standard" | "high" | "ultra";
}

export interface RenderProgressEvent {
  progress: number; // 0 - 100
  stage: string;
  log: string;
}

export interface RenderOutput {
  jobId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  resolution: string;
  fps: number;
  format: string;
  fileSizeBytes: number;
}

export interface IVideoRenderer {
  readonly name: string;
  renderProject(
    project: Project,
    options: RenderOptions,
    onProgress?: (event: RenderProgressEvent) => void
  ): Promise<RenderOutput>;
}

export class MockVideoRenderer implements IVideoRenderer {
  readonly name = "MockVideoRenderer";

  async renderProject(
    project: Project,
    options: RenderOptions,
    onProgress?: (event: RenderProgressEvent) => void
  ): Promise<RenderOutput> {
    const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0) || 15;

    const stages: RenderProgressEvent[] = [
      { progress: 15, stage: "Synthesizing Narration Tracks", log: "Rendering TTS waveforms for all scenes" },
      { progress: 35, stage: "Compositing Visual Layers", log: "Applying background framing and motion keyframes" },
      { progress: 55, stage: "Overlaying Presenter Avatar", log: "Syncing talking head and transparency bounds" },
      { progress: 75, stage: "Generating Dynamic Captions", log: "Burning word-level pop highlights onto stream" },
      { progress: 90, stage: "Encoding H.264 MP4 Container", log: `Encoding ${options.resolution} @ ${options.fps || 30}fps` },
      { progress: 100, stage: "Render Complete", log: "Final video stream packaged and uploaded to storage" },
    ];

    for (const st of stages) {
      await new Promise((r) => setTimeout(r, 450));
      onProgress?.(st);
    }

    const resMap: Record<string, string> = {
      "720p": "1280x720",
      "1080p": "1920x1080",
      "4k": "3840x2160",
    };

    return {
      jobId: `render-${Date.now()}`,
      videoUrl: project.exportVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-modern-city-streets-with-traffic-at-night-42475-large.mp4",
      thumbnailUrl: project.thumbnail || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80",
      duration: totalDuration,
      resolution: resMap[options.resolution] || "1920x1080",
      fps: options.fps || 30,
      format: options.format,
      fileSizeBytes: Math.round(totalDuration * 1.15 * 1024 * 1024), // ~1.15MB per second
    };
  }
}
