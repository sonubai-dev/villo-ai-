/**
 * Mock Lip-Sync Provider
 * Fast, deterministic, zero-cost lip-sync simulation with automatic caching.
 */

import { ILipSyncProvider, LipSyncInput, LipSyncResult } from "./types";
import { lipSyncCacheManager } from "./lipsync-cache";

export class MockLipSyncProvider implements ILipSyncProvider {
  readonly name = "MockLipSyncProvider";

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async synchronize(input: LipSyncInput): Promise<LipSyncResult> {
    const startTime = Date.now();
    const cacheKey = lipSyncCacheManager.computeCacheKey(input);

    // 1. Check Lip-Sync Cache
    const cached = await lipSyncCacheManager.getCachedLipSync(cacheKey);
    if (cached) {
      return {
        syncedVideoUrl: cached.syncedVideoUrl,
        duration: cached.duration,
        phonemeCount: cached.phonemeCount,
        syncAccuracy: cached.syncAccuracy,
        cached: true,
        providerUsed: cached.providerUsed,
        latencyMs: Date.now() - startTime,
      };
    }

    // 2. Simulate fast phoneme calculation
    const words = input.wordTimings ? input.wordTimings.length : Math.max(8, Math.round(input.duration * 2.5));
    const phonemes = words * 3;
    const accuracy = 0.94 + Math.random() * 0.04;

    const result: Omit<LipSyncResult, "cached"> = {
      syncedVideoUrl: input.avatarVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-camera-close-up-50586-large.mp4",
      duration: input.duration,
      phonemeCount: phonemes,
      syncAccuracy: Math.round(accuracy * 100) / 100,
      providerUsed: "mock",
      modelName: "mock-lipsync-engine-v2",
      latencyMs: Date.now() - startTime,
    };

    // 3. Save to Cache
    await lipSyncCacheManager.saveCachedLipSync(input, cacheKey, result);

    return {
      ...result,
      cached: false,
    };
  }
}
