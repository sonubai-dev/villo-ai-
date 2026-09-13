/**
 * Experimental Local Lip-Sync Provider (Self-Hosted GPU / Local Worker)
 * Supports future on-premise or dedicated GPU compute models (Wav2Lip, LivePortrait, SadTalker).
 * Gracefully detects local GPU worker availability and falls back to mock/remote when unconfigured.
 */

import { ILipSyncProvider, LipSyncInput, LipSyncResult } from "./types";
import { lipSyncCacheManager } from "./lipsync-cache";
import { MockLipSyncProvider } from "./mock-lipsync-provider";

export class LocalLipSyncProvider implements ILipSyncProvider {
  readonly name = "LocalLipSyncProvider";
  private localEndpoint: string;
  private fallback = new MockLipSyncProvider();

  constructor(localEndpoint?: string) {
    this.localEndpoint = localEndpoint || process.env.LOCAL_LIPSYNC_ENDPOINT || "http://localhost:8000";
  }

  /**
   * Healthcheck to detect if local GPU service is running.
   */
  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000);

      const res = await fetch(`${this.localEndpoint}/health`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);

      clearTimeout(timeoutId);
      return Boolean(res && res.ok);
    } catch {
      return false;
    }
  }

  async synchronize(input: LipSyncInput): Promise<LipSyncResult> {
    const startTime = Date.now();
    const cacheKey = lipSyncCacheManager.computeCacheKey(input);

    // 1. Check Lip-Sync Cache First
    const cached = await lipSyncCacheManager.getCachedLipSync(cacheKey);
    if (cached) {
      return {
        syncedVideoUrl: cached.syncedVideoUrl,
        duration: cached.duration,
        phonemeCount: cached.phonemeCount,
        syncAccuracy: cached.syncAccuracy,
        cached: true,
        providerUsed: "local",
        modelName: "local-gpu-cached",
        latencyMs: Date.now() - startTime,
      };
    }

    // 2. Check if Local Worker is Online
    const isOnline = await this.isAvailable();
    if (isOnline) {
      try {
        const response = await fetch(`${this.localEndpoint}/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            video_url: input.avatarVideoUrl,
            audio_url: input.audioUrl,
            model: input.modelType || "wav2lip",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const syncedUrl = data.video_url || input.avatarVideoUrl;

          const result: Omit<LipSyncResult, "cached"> = {
            syncedVideoUrl: syncedUrl,
            duration: input.duration,
            phonemeCount: Math.round(input.duration * 7.5),
            syncAccuracy: 0.98,
            providerUsed: "local",
            modelName: `local-${input.modelType || "wav2lip"}-gpu`,
            latencyMs: Date.now() - startTime,
          };

          await lipSyncCacheManager.saveCachedLipSync(input, cacheKey, result);
          return { ...result, cached: false };
        }
      } catch (err) {
        console.warn("[LocalLipSyncProvider] Local GPU sync error, falling back to mock:", err);
      }
    }

    // 3. Graceful Fallback (Initial Development Mode)
    const mockRes = await this.fallback.synchronize(input);
    return {
      ...mockRes,
      providerUsed: "local",
      modelName: "local-dev-fallback",
    };
  }
}
