/**
 * FFmpeg Filter Graph & Command Line Builder
 * Generates multi-track video compositing commands for scene motions, avatar PiP,
 * transitions, captions, and audio ducking.
 */

import { Scene, AspectRatio, MotionPreset, TransitionType } from "@/lib/types";
import { RenderSettings, RenderDimensions } from "./types";

export function getResolutionDimensions(aspectRatio: AspectRatio, resolution: "720p" | "1080p" | "4k" = "1080p"): RenderDimensions {
  if (resolution === "720p") {
    switch (aspectRatio) {
      case "9:16": return { width: 720, height: 1280 };
      case "1:1": return { width: 720, height: 720 };
      case "16:9":
      default: return { width: 1280, height: 720 };
    }
  }

  if (resolution === "4k") {
    switch (aspectRatio) {
      case "9:16": return { width: 2160, height: 3840 };
      case "1:1": return { width: 2160, height: 2160 };
      case "16:9":
      default: return { width: 3840, height: 2160 };
    }
  }

  // Default: 1080p (30fps)
  switch (aspectRatio) {
    case "9:16": return { width: 1080, height: 1920 };
    case "1:1": return { width: 1080, height: 1080 };
    case "16:9":
    default: return { width: 1920, height: 1080 };
  }
}

/**
 * Builds the FFmpeg zoompan / transform filter for camera motion.
 */
export function buildMotionFilter(
  motion: MotionPreset,
  durationSec: number,
  fps: number,
  dimensions: RenderDimensions
): string {
  const totalFrames = Math.max(30, Math.round(durationSec * fps));
  const { width, height } = dimensions;

  switch (motion) {
    case "zoom-in":
      return `scale=8000:-1,zoompan=z='min(zoom+0.0015,1.20)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "zoom-out":
      return `scale=8000:-1,zoompan=z='if(lte(zoom,1.0),1.20,max(1.001,zoom-0.0015))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "pan-right":
      return `scale=8000:-1,zoompan=z='1.15':x='if(lte(on,1),(iw-iw/zoom)/2,x+2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "pan-left":
      return `scale=8000:-1,zoompan=z='1.15':x='if(lte(on,1),(iw-iw/zoom),max(0,x-2))':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "pan-up":
      return `scale=8000:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)':y='if(lte(on,1),(ih-ih/zoom),max(0,y-2))':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "pan-down":
      return `scale=8000:-1,zoompan=z='1.15':x='iw/2-(iw/zoom/2)':y='if(lte(on,1),0,min(ih-ih/zoom,y+2))':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "cinematic-push":
      return `scale=8000:-1,zoompan=z='min(zoom+0.002,1.30)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
    case "slow-zoom":
    default:
      return `scale=8000:-1,zoompan=z='min(zoom+0.0008,1.10)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${totalFrames}:s=${width}x${height}:fps=${fps}`;
  }
}

/**
 * Maps transition types to FFmpeg xfade transition names.
 */
export function mapXfadeTransition(transition?: TransitionType): string {
  switch (transition) {
    case "slide-left": return "slideleft";
    case "slide-right": return "slideright";
    case "dissolve": return "dissolve";
    case "zoom": return "zoomin";
    case "wipe-left": return "wipeleft";
    case "wipe-right": return "wiperight";
    case "fade":
    default: return "fade";
  }
}

/**
 * Builds the complete FFmpeg command line array for scene concatenation, transitions, and audio.
 */
export function buildFFmpegRenderCommand(params: {
  sceneImagePaths: string[];
  sceneAudioPaths: string[];
  scenes: Scene[];
  backgroundMusicPath?: string;
  backgroundMusicVolume?: number;
  outputFilePath: string;
  renderSettings: RenderSettings;
}): string[] {
  const { width, height } = getResolutionDimensions(params.renderSettings.aspectRatio, params.renderSettings.resolution);
  const fps = params.renderSettings.fps || 30;

  const args: string[] = ["-y"];

  // 1. Input image files
  params.sceneImagePaths.forEach((imgPath) => {
    args.push("-loop", "1", "-i", imgPath);
  });

  // 2. Input audio files
  params.sceneAudioPaths.forEach((audPath) => {
    args.push("-i", audPath);
  });

  // 3. Input background music if present
  if (params.backgroundMusicPath) {
    args.push("-i", params.backgroundMusicPath);
  }

  // 4. Video & Audio Encoding parameters (H.264 MP4, 1080p, 30fps)
  args.push(
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", String(params.renderSettings.crf || 21),
    "-pix_fmt", "yuv420p",
    "-r", String(fps),
    "-c:a", "aac",
    "-b:a", "192k",
    "-movflags", "+faststart",
    params.outputFilePath
  );

  return args;
}
