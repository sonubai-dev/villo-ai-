/**
 * Mock Video Provider for Avatar Motion Pipeline
 * Composites background, presenter layer, captions, and audio into final MP4.
 */

import { IVideoProvider, VideoRenderInput, VideoResult } from "./types";

export class MockVideoProvider implements IVideoProvider {
  public name = "MockVideoProvider (Multi-Track Video Compositor)";

  async renderVideo(
    input: VideoRenderInput,
    onProgress?: (progress: number, stage: string, log: string) => void
  ): Promise<VideoResult> {
    const steps = [
      { progress: 75, stage: "Rendering Video", log: "Compositing multi-layer video tracks and motion filtergraph..." },
      { progress: 85, stage: "Applying Captions", log: "Rendering dynamic subtitles and styled caption boxes..." },
      { progress: 95, stage: "Finalizing Video", log: "Encoding 1080p H.264 video container & audio mastering..." },
    ];

    for (const step of steps) {
      await new Promise((res) => setTimeout(res, 900));
      onProgress?.(step.progress, step.stage, step.log);
    }

    // Return high quality mock MP4 video container matching aspect ratio
    const videoUrl =
      input.aspectRatio === "9:16"
        ? "https://assets.mixkit.co/videos/preview/mixkit-vertical-portrait-of-a-woman-in-neon-lights-42996-large.mp4"
        : "https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-42880-large.mp4";

    return {
      videoUrl,
      thumbnailUrl: input.background.type === "image" ? input.background.value : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
      duration: input.duration,
      resolution: "1080p (1920x1080)",
      fps: 30,
      format: "MP4 (H.264/AAC)",
      fileSizeBytes: input.duration * 1024 * 1024 * 1.2, // ~1.2MB per sec
    };
  }
}
