/**
 * Vilo V1 - Render Specification Generator
 * Decouples Editor State from Rendering State.
 * Prepares a clean JSON-serializable specification ready for
 * Remotion, FFmpeg, or remote Cloud Render Workers.
 */

import { Project, Scene, AspectRatio, CaptionSettings, TextOverlay, MotionPreset } from "@/lib/types";

export interface RenderSpecScene {
  index: number;
  id: string;
  duration: number; // in seconds
  startTime: number;
  endTime: number;
  narration: string;
  voiceAudioUrl: string;
  avatar: {
    id: string;
    videoUrl?: string;
    layout: string;
    showAvatar: boolean;
  };
  background: {
    type: "image" | "video" | "solid" | "gradient";
    url: string;
    motionPreset: MotionPreset;
    motionSpeed: number;
  };
  textOverlay?: {
    text: string;
    fontSize?: string;
    alignment?: string;
    position?: string;
    animation?: string;
    visible?: boolean;
    color?: string;
  };
  captions: {
    enabled: boolean;
    style: string;
    position: string;
    fontSize: string;
    highlightColor: string;
    textColor: string;
    segments: Array<{
      startTime: number;
      endTime: number;
      text: string;
    }>;
  };
  transition: {
    type: string;
    duration: number;
  };
}

export interface RenderSpec {
  specVersion: "1.0.0";
  projectId: string;
  title: string;
  aspectRatio: AspectRatio;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  totalDuration: number;
  scenes: RenderSpecScene[];
  audioMix: {
    backgroundMusicUrl?: string;
    backgroundMusicVolume: number;
    voiceVolume: number;
    autoDuck: boolean;
  };
  outputFormat: "mp4" | "webm";
  createdAt: string;
}

export function generateRenderSpec(project: Project): RenderSpec {
  const resolutionMap: Record<AspectRatio, { width: number; height: number }> = {
    "16:9": { width: 1920, height: 1080 },
    "9:16": { width: 1080, height: 1920 },
    "1:1": { width: 1080, height: 1080 },
    "4:5": { width: 1080, height: 1350 },
  };

  let cumulativeTime = 0;

  const scenes: RenderSpecScene[] = project.scenes.map((scene, idx) => {
    const duration = scene.duration || 6;
    const startTime = cumulativeTime;
    const endTime = cumulativeTime + duration;
    cumulativeTime += duration;

    // Generate caption segments from narration words
    const words = (scene.script || "").trim().split(/\s+/).filter(Boolean);
    const wordsPerSec = Math.max(1.5, words.length / duration);
    const captionSegments = words.map((w, wIdx) => ({
      startTime: startTime + wIdx / wordsPerSec,
      endTime: startTime + (wIdx + 1) / wordsPerSec,
      text: w,
    }));

    const rawScene = scene as any;

    return {
      index: idx,
      id: scene.id,
      duration,
      startTime,
      endTime,
      narration: scene.script || "",
      voiceAudioUrl:
        rawScene.voiceAudioUrl ||
        "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      avatar: {
        id: scene.avatarId || "avatar-alex",
        videoUrl: rawScene.avatarVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
        layout: scene.avatarLayout || "circle-bottom-right",
        showAvatar: scene.showAvatar ?? true,
      },
      background: {
        type: rawScene.backgroundType || "image",
        url: scene.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
        motionPreset: scene.motionPreset || "zoom-in",
        motionSpeed: scene.motionSpeed || 1.0,
      },
      textOverlay: scene.textOverlay
        ? {
            text: scene.textOverlay.content || scene.overlayText || "",
            fontSize: scene.textOverlay.fontSize || "medium",
            alignment: "center",
            position: scene.textOverlay.position || "top",
            animation: scene.textOverlay.animation || "fade",
            visible: true,
            color: scene.textOverlay.textColor || "#ffffff",
          }
        : undefined,
      captions: {
        enabled: scene.captions?.enabled ?? true,
        style: scene.captions?.style || "creator",
        position: scene.captions?.position || "bottom",
        fontSize: scene.captions?.fontSize || "medium",
        highlightColor: scene.captions?.highlightColor || "#38bdf8",
        textColor: scene.captions?.textColor || "#ffffff",
        segments: captionSegments,
      },
      transition: {
        type: scene.transition || "fade",
        duration: scene.transitionDuration || 0.5,
      },
    };
  });

  return {
    specVersion: "1.0.0",
    projectId: project.id,
    title: project.title,
    aspectRatio: project.aspectRatio,
    resolution: resolutionMap[project.aspectRatio] || { width: 1920, height: 1080 },
    fps: 30,
    totalDuration: cumulativeTime,
    scenes,
    audioMix: {
      backgroundMusicUrl: project.scenes[0]?.backgroundMusic,
      backgroundMusicVolume: project.scenes[0]?.backgroundMusicVolume ?? 0.3,
      voiceVolume: project.scenes[0]?.voiceVolume ?? 1.0,
      autoDuck: true,
    },
    outputFormat: "mp4",
    createdAt: new Date().toISOString(),
  };
}
