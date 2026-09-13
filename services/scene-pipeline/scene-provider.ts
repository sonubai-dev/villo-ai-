/**
 * Vilo V1 Scene Provider & Generation Lock Engine
 * Manages atomic scene generation, single-scene regeneration,
 * and duplicate request prevention (in-flight locks).
 */

import { RenderableSceneUnit, GenerateSceneParams, SceneProcessingStatus } from "./types";
import { ttsProvider } from "@/services/avatar-voice/tts-provider";
import { avatarLibrary } from "@/services/avatar-voice/avatar-library";
import { voiceLibrary } from "@/services/avatar-voice/voice-library";

export interface ISceneProvider {
  readonly name: string;
  generateScene(
    params: GenerateSceneParams,
    onProgress?: (progress: number, stage: string) => void,
    abortSignal?: AbortSignal
  ): Promise<RenderableSceneUnit>;
  regenerateSingleScene(
    existing: RenderableSceneUnit,
    updates: Partial<RenderableSceneUnit>,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<RenderableSceneUnit>;
}

export class SceneProvider implements ISceneProvider {
  readonly name = "ViloSceneProvider";
  private static instance: SceneProvider;
  private activeLocks = new Set<string>(); // In-flight idempotency locks

  public static getInstance(): SceneProvider {
    if (!SceneProvider.instance) {
      SceneProvider.instance = new SceneProvider();
    }
    return SceneProvider.instance;
  }

  /**
   * Generates or regenerates a single renderable scene unit.
   * Enforces in-flight lock to prevent duplicate clicks / double requests.
   */
  public async generateScene(
    params: GenerateSceneParams,
    onProgress?: (progress: number, stage: string) => void,
    abortSignal?: AbortSignal
  ): Promise<RenderableSceneUnit> {
    const sceneId = params.scene.id || `sc-${Date.now()}`;
    const lockKey = `lock-scene-${sceneId}-${params.idempotencyKey || "default"}`;

    if (this.activeLocks.has(lockKey)) {
      throw new Error(`Scene ${sceneId} is already generating. Please wait for the current task to finish.`);
    }

    this.activeLocks.add(lockKey);

    try {
      if (abortSignal?.aborted) throw new Error("Scene generation cancelled.");

      onProgress?.(10, "Queuing scene render task...");
      await new Promise((r) => setTimeout(r, 150));

      const avatarId = params.scene.avatarId || "avatar-alex";
      const voiceId = params.scene.voiceId || "voice-emma";
      const avatarMeta = avatarLibrary.getAvatarById(avatarId);
      const voiceMeta = voiceLibrary.getVoiceById(voiceId);

      onProgress?.(30, "Synthesizing narration audio...");
      const narrationText = params.scene.narration || "Welcome to this scene.";

      const speechResult = await ttsProvider.generate(
        {
          text: narrationText,
          voiceId,
        },
        abortSignal
      );

      if (abortSignal?.aborted) throw new Error("Scene generation cancelled.");

      onProgress?.(65, "Binding presenter avatar layer & timings...");
      await new Promise((r) => setTimeout(r, 200));

      onProgress?.(90, "Compositing background & text overlays...");
      await new Promise((r) => setTimeout(r, 150));

      const calculatedDuration = Math.max(
        params.scene.duration || 6,
        speechResult.duration
      );

      const renderableUnit: RenderableSceneUnit = {
        id: sceneId,
        projectId: params.scene.projectId || "default-proj",
        order: params.scene.order ?? 0,
        title: params.scene.title || `Scene ${sceneId}`,
        narration: narrationText,
        voiceId,
        voiceAudioUrl: speechResult.audioUrl,
        voiceDuration: speechResult.duration,
        wordTimings: speechResult.wordTimings,
        avatarId,
        avatarVideoUrl: avatarMeta.previewVideo,
        avatarLayout: params.scene.avatarLayout || "circle-bottom-right",
        showAvatar: params.scene.showAvatar ?? true,
        backgroundUrl:
          params.scene.backgroundUrl ||
          "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80",
        backgroundType: params.scene.backgroundType || "image",
        motionPreset: params.scene.motionPreset || "cinematic-push",
        onScreenText: params.scene.onScreenText || "SCENE OVERVIEW",
        captions: params.scene.captions || {
          enabled: true,
          style: "creator",
          position: "bottom",
          fontSize: "medium",
          highlightColor: "#38bdf8",
          textColor: "#ffffff",
        },
        duration: calculatedDuration,
        status: "completed",
        progressPercent: 100,
        statusMessage: "Scene ready for preview and rendering",
        updatedAt: new Date().toISOString(),
      };

      onProgress?.(100, "Scene generation complete");
      return renderableUnit;
    } catch (err: any) {
      console.error(`[SceneProvider] Generation failed for scene ${sceneId}:`, err);
      throw err;
    } finally {
      this.activeLocks.delete(lockKey);
    }
  }

  public async regenerateSingleScene(
    existing: RenderableSceneUnit,
    updates: Partial<RenderableSceneUnit>,
    onProgress?: (progress: number, stage: string) => void
  ): Promise<RenderableSceneUnit> {
    return this.generateScene(
      {
        scene: { ...existing, ...updates },
        regenerateVoice: updates.narration !== undefined || updates.voiceId !== undefined,
        regenerateAvatar: updates.avatarId !== undefined,
        idempotencyKey: `regen-${Date.now()}`,
      },
      onProgress
    );
  }
}

export const sceneProvider = SceneProvider.getInstance();
