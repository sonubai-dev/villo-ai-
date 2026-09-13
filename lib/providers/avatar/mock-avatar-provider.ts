/**
 * Mock Avatar Provider
 * Deterministic in-memory simulation of external avatar rendering providers with caching.
 */

import { IAvatarProvider, AvatarVideoInput, AvatarVideoOutput, AvatarJobStatus } from "./types";
import { avatarCacheManager } from "./avatar-cache";

export class MockAvatarProvider implements IAvatarProvider {
  public name = "MockAvatarProvider";
  private jobs = new Map<string, AvatarVideoOutput>();
  private timers = new Map<string, NodeJS.Timeout>();

  async createAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoOutput> {
    const cacheKey = avatarCacheManager.computeCacheKey(input);
    const cached = await avatarCacheManager.getCachedAvatar(cacheKey);

    if (cached) {
      const cachedJobId = `cached-avatar-${cacheKey.slice(0, 10)}`;
      const cachedOutput: AvatarVideoOutput = {
        providerJobId: cachedJobId,
        status: "completed",
        videoUrl: cached.videoUrl,
        duration: cached.duration,
        metadata: { ...input.metadata, cached: true },
      };
      this.jobs.set(cachedJobId, cachedOutput);
      return cachedOutput;
    }

    const providerJobId = `mock-avatar-job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const duration = Math.max(5, Math.ceil((input.script || "Welcome").split(" ").length / 2.5));

    const initialOutput: AvatarVideoOutput = {
      providerJobId,
      status: "queued",
      duration,
      metadata: input.metadata,
    };

    this.jobs.set(providerJobId, initialOutput);

    // Asynchronously advance to processing (100ms) then completed (300ms)
    const t1 = setTimeout(() => {
      const current = this.jobs.get(providerJobId);
      if (current && current.status !== "cancelled") {
        this.jobs.set(providerJobId, { ...current, status: "processing" });
      }
    }, 100);

    const t2 = setTimeout(async () => {
      const current = this.jobs.get(providerJobId);
      if (current && current.status !== "cancelled") {
        const videoUrl = "https://assets.mixkit.co/videos/preview/mixkit-modern-city-streets-with-traffic-at-night-42475-large.mp4";
        this.jobs.set(providerJobId, {
          ...current,
          status: "completed",
          videoUrl,
        });
        await avatarCacheManager.saveCachedAvatar(input, cacheKey, videoUrl, duration);
      }
    }, 300);

    this.timers.set(`${providerJobId}-1`, t1);
    this.timers.set(`${providerJobId}-2`, t2);

    return initialOutput;
  }

  async getJobStatus(providerJobId: string): Promise<AvatarVideoOutput> {
    const job = this.jobs.get(providerJobId);
    if (!job) {
      throw new Error(`[MockAvatarProvider] Job ${providerJobId} not found`);
    }
    return job;
  }

  async cancelJob(providerJobId: string): Promise<void> {
    const job = this.jobs.get(providerJobId);
    if (!job) return;

    // Clear pending timers
    clearTimeout(this.timers.get(`${providerJobId}-1`));
    clearTimeout(this.timers.get(`${providerJobId}-2`));

    this.jobs.set(providerJobId, {
      ...job,
      status: "cancelled",
      error: "Job cancelled by client",
    });
  }
}
