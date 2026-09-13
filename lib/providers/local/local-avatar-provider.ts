/**
 * Experimental Local Avatar Provider (SadTalker / LivePortrait / AnimateAnyone)
 * Renders avatar video frames on self-hosted GPU compute.
 */

import { IAvatarProvider, AvatarVideoInput, AvatarVideoOutput } from "@/lib/providers/avatar/types";
import { MockAvatarProvider } from "@/lib/providers/avatar/mock-avatar-provider";
import { avatarCacheManager } from "@/lib/providers/avatar/avatar-cache";

export class LocalAvatarProvider implements IAvatarProvider {
  public readonly name = "LocalAvatarProvider";
  private endpoint: string;
  private fallback = new MockAvatarProvider();

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.LOCAL_AVATAR_ENDPOINT || "http://localhost:8003";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/health`, { method: "GET" }).catch(() => null);
      return Boolean(res && res.ok);
    } catch {
      return false;
    }
  }

  async createAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoOutput> {
    const cacheKey = avatarCacheManager.computeCacheKey(input);
    const cached = await avatarCacheManager.getCachedAvatar(cacheKey);

    if (cached) {
      return {
        providerJobId: `local-cached-${cacheKey.slice(0, 8)}`,
        status: "completed",
        videoUrl: cached.videoUrl,
        duration: cached.duration,
        metadata: { cached: true },
      };
    }

    const isOnline = await this.isAvailable();
    if (isOnline) {
      try {
        const response = await fetch(`${this.endpoint}/render-avatar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (response.ok) {
          const data = await response.json();
          const videoUrl = data.video_url || "https://assets.mixkit.co/videos/preview/mixkit-modern-city-streets-with-traffic-at-night-42475-large.mp4";
          const duration = data.duration || 10;

          await avatarCacheManager.saveCachedAvatar(input, cacheKey, videoUrl, duration);

          return {
            providerJobId: `local-avatar-${Date.now()}`,
            status: "completed",
            videoUrl,
            duration,
            metadata: { model: "local-liveportrait-gpu" },
          };
        }
      } catch (err) {
        console.warn("[LocalAvatarProvider] Local GPU error, falling back:", err);
      }
    }

    return this.fallback.createAvatarVideo(input);
  }

  async getJobStatus(providerJobId: string): Promise<AvatarVideoOutput> {
    return this.fallback.getJobStatus(providerJobId);
  }

  async cancelJob(providerJobId: string): Promise<void> {
    return this.fallback.cancelJob(providerJobId);
  }
}
