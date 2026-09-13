import { VideoProvider, VideoGenerationInput, VideoGenerationResult } from "../types";

export class MockVideoProvider implements VideoProvider {
  async generateVideo(
    input: VideoGenerationInput,
    onProgress?: (progress: number, stage: string, log: string) => void
  ): Promise<VideoGenerationResult> {
    const totalScenes = input.project.scenes.length || 1;
    const totalDuration = input.project.scenes.reduce((acc, s) => acc + s.duration, 0) || 20;

    const stages = [
      { progress: 15, stage: "analyzing", log: "✓ Analyzing project metadata and scene hierarchy..." },
      { progress: 35, stage: "scenes", log: `✓ Processed ${totalScenes} visual background compositions and motion paths` },
      { progress: 55, stage: "avatar", log: "✓ Generated neural avatar lip-sync facial landmarks and head poses" },
      { progress: 75, stage: "voice", log: "✓ Synthesized multi-track audio and synchronized caption phonemes" },
      { progress: 92, stage: "rendering", log: `✓ Compositing high-definition ${input.resolution || "1080p"} video frames with transitions` },
      { progress: 100, stage: "completed", log: "✓ Final video rendered successfully and ready for export!" },
    ];

    for (const step of stages) {
      await new Promise((r) => setTimeout(r, 800));
      onProgress?.(step.progress, step.stage, step.log);
    }

    // Default to first scene thumbnail or high quality fallback
    const thumbnail = input.project.scenes[0]?.image || input.project.thumbnail;

    return {
      jobId: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: thumbnail,
      duration: totalDuration,
      fileSizeBytes: 14200000, // ~14.2 MB
      format: input.format || "mp4",
    };
  }
}
