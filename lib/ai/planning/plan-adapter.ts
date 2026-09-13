/**
 * Plan to Execution Adapter
 * Bridges the gap between AI-generated VideoPlan objects and Vilo's internal deterministic rendering engine.
 * Converts VideoPlan into Scene[], Project, or VideoGenerationRequest.
 */

import { VideoPlan, ScenePlan, CameraMovementType, MotionStyleType, CaptionAnimationType } from "./types";
import { Scene, Project, MotionPreset, CaptionStyle, CaptionSettings } from "@/lib/types";

export class PlanAdapter {
  private static instance: PlanAdapter;

  public static getInstance(): PlanAdapter {
    if (!PlanAdapter.instance) {
      PlanAdapter.instance = new PlanAdapter();
    }
    return PlanAdapter.instance;
  }

  /**
   * Maps AI Camera/Motion types to internal deterministic MotionPreset.
   */
  public mapToMotionPreset(cameraType: CameraMovementType, motionType?: MotionStyleType): MotionPreset {
    const combined = `${cameraType}_${motionType || ""}`.toLowerCase();

    if (combined.includes("zoomout") || combined.includes("zoom-out")) return "zoom-out";
    if (combined.includes("zoomin") || combined.includes("zoom-in")) return "zoom-in";
    if (combined.includes("panleft") || combined.includes("pan-left")) return "pan-left";
    if (combined.includes("panright") || combined.includes("pan-right")) return "pan-right";
    if (combined.includes("panup") || combined.includes("pan-up")) return "pan-up";
    if (combined.includes("pandown") || combined.includes("pan-down")) return "pan-down";
    if (combined.includes("dynamicpush") || combined.includes("camerapush")) return "cinematic-push";
    if (combined.includes("cinematic")) return "cinematic-push";
    if (combined.includes("slowzoom") || combined.includes("slowpush")) return "slow-zoom";

    return "zoom-in";
  }

  /**
   * Maps AI Caption animation type to internal CaptionStyle.
   */
  public mapToCaptionStyle(style: CaptionAnimationType): CaptionStyle {
    switch (style) {
      case "highlight":
        return "creator";
      case "bold":
        return "bold";
      case "clean":
        return "clean";
      case "minimal":
        return "minimal";
      case "typewriter":
      case "pop":
      case "bounce":
      default:
        return "creator";
    }
  }

  /**
   * Converts a VideoPlan into internal Scene[] entities for the video renderer.
   */
  public planToScenes(plan: VideoPlan, projectId: string, defaultAvatarId: string = "avatar-sophia", defaultVoiceId: string = "voice-emma"): Scene[] {
    return plan.scenes.map((sp, idx) => {
      const motionPreset = this.mapToMotionPreset(sp.camera.type, sp.motion.type);
      const captionStyle = this.mapToCaptionStyle(sp.caption.style);

      const captions: CaptionSettings = {
        enabled: true,
        style: captionStyle,
        position: sp.caption.position || "bottom",
        fontSize: sp.caption.fontSize || "medium",
        highlightColor: sp.caption.highlightColor || "#38bdf8",
        textColor: "#ffffff",
      };

      const defaultImages = [
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1600&auto=format&fit=crop&q=80",
      ];

      return {
        id: sp.id || `scene-${projectId}-${idx + 1}`,
        projectId,
        order: sp.sceneNumber || idx + 1,
        title: sp.title || `Scene ${idx + 1}`,
        script: sp.script,
        image: defaultImages[idx % defaultImages.length],
        prompt: sp.visualPrompt,
        motionPreset,
        cameraEffect: motionPreset,
        motionSpeed: sp.motion.speed ?? 1.0,
        motionStrength: sp.motion.intensity ?? 75,
        avatarId: sp.avatarId || defaultAvatarId,
        avatarLayout: "fullscreen-presenter",
        showAvatar: sp.avatar ?? true,
        voiceId: defaultVoiceId,
        duration: sp.duration,
        transition: sp.transition || "fade",
        transitionDuration: 0.5,
        captions,
        voiceVolume: 1.0,
        backgroundMusicVolume: 0.25,
      };
    });
  }

  /**
   * Converts a VideoPlan into a full Vilo Project entity.
   */
  public planToProject(plan: VideoPlan, userId: string, projectId?: string): Project {
    const pId = projectId || `proj-${Date.now()}`;
    const scenes = this.planToScenes(plan, pId);
    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

    const defaultCaptions: CaptionSettings = {
      enabled: true,
      style: plan.globalCaptionPlan ? this.mapToCaptionStyle(plan.globalCaptionPlan.style) : "creator",
      position: plan.globalCaptionPlan?.position || "bottom",
      fontSize: plan.globalCaptionPlan?.fontSize || "medium",
      highlightColor: plan.globalCaptionPlan?.highlightColor || "#38bdf8",
      textColor: "#ffffff",
    };

    return {
      id: pId,
      userId,
      title: plan.title,
      type: "avatar",
      status: "draft",
      thumbnail: scenes[0]?.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
      duration: totalDuration,
      aspectRatio: plan.aspectRatio,
      scenes,
      globalCaptions: defaultCaptions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

export const planAdapter = PlanAdapter.getInstance();
