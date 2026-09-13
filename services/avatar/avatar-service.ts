/**
 * Client-Safe Avatar Service
 * Coordinates avatar preview generation and vendor job dispatching without exposing API credentials.
 */

import { IAvatarProvider, AvatarVideoInput, AvatarVideoOutput } from "@/lib/providers/avatar/types";
import { MockAvatarProvider } from "@/lib/providers/avatar/mock-avatar-provider";

export class AvatarService {
  private static instance: AvatarService;
  private fallback: IAvatarProvider = new MockAvatarProvider();

  public static getInstance(): AvatarService {
    if (!AvatarService.instance) {
      AvatarService.instance = new AvatarService();
    }
    return AvatarService.instance;
  }

  /**
   * Creates an avatar video render job.
   */
  async createAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoOutput> {
    return this.fallback.createAvatarVideo(input);
  }

  /**
   * Queries avatar job status.
   */
  async getJobStatus(providerJobId: string): Promise<AvatarVideoOutput> {
    return this.fallback.getJobStatus(providerJobId);
  }

  /**
   * Cancels an in-flight avatar job.
   */
  async cancelJob(providerJobId: string): Promise<void> {
    return this.fallback.cancelJob(providerJobId);
  }
}

export const avatarService = AvatarService.getInstance();
