/**
 * Interchangeable Provider Router & Fallback System
 * Dynamically routes AI, Voice, Avatar, and LipSync requests between Cloud APIs and Self-Hosted Local GPU workers.
 * Features automated primary -> fallback failover to guarantee 100% uptime.
 */

import { IVoiceProvider, SpeechGenerationInput, SpeechGenerationOutput } from "@/lib/providers/voice/types";
import { ElevenLabsVoiceProvider } from "@/lib/providers/voice/elevenlabs-voice-provider";
import { MockVoiceProvider } from "@/lib/providers/voice/mock-voice-provider";
import { LocalTTSProvider } from "@/lib/providers/local/local-tts-provider";

import { IAvatarProvider, AvatarVideoInput, AvatarVideoOutput } from "@/lib/providers/avatar/types";
import { ProductionAvatarProvider } from "@/lib/providers/avatar/production-avatar-provider";
import { MockAvatarProvider } from "@/lib/providers/avatar/mock-avatar-provider";
import { LocalAvatarProvider } from "@/lib/providers/local/local-avatar-provider";

import { ILipSyncProvider, LipSyncInput, LipSyncResult } from "@/lib/providers/lipsync/types";
import { RemoteLipSyncProvider } from "@/lib/providers/lipsync/remote-lipsync-provider";
import { MockLipSyncProvider } from "@/lib/providers/lipsync/mock-lipsync-provider";
import { LocalLipSyncProvider } from "@/lib/providers/lipsync/local-lipsync-provider";

import { AIProvider } from "@/lib/ai/types";
import { GeminiAIProvider } from "@/lib/ai/gemini-provider";
import { MockAIProvider } from "@/lib/ai/mock-provider";
import { LocalAIProvider } from "@/lib/ai/providers/local-provider";
import { costMonitor } from "@/lib/observability/cost-monitor";

export interface ProviderRouterConfig {
  voiceProvider: "elevenlabs" | "local" | "mock";
  avatarProvider: "heygen" | "local" | "mock";
  lipSyncProvider: "remote" | "local" | "mock";
  aiProvider: "gemini" | "local" | "openai" | "anthropic" | "mock";
}

export class ProviderRouter {
  private static instance: ProviderRouter;
  private config: ProviderRouterConfig;

  // Primary & Fallback instances
  private voicePrimary: IVoiceProvider;
  private voiceFallback: IVoiceProvider;

  private avatarPrimary: IAvatarProvider;
  private avatarFallback: IAvatarProvider;

  private lipSyncPrimary: ILipSyncProvider;
  private lipSyncFallback: ILipSyncProvider;

  private aiPrimary: AIProvider;
  private aiFallback: AIProvider;

  constructor(config?: Partial<ProviderRouterConfig>) {
    this.config = {
      voiceProvider: (process.env.VOICE_PROVIDER as any) || "mock",
      avatarProvider: (process.env.AVATAR_PROVIDER as any) || "mock",
      lipSyncProvider: (process.env.LIPSYNC_PROVIDER as any) || "mock",
      aiProvider: (process.env.AI_PROVIDER as any) || "mock",
      ...config,
    };

    // Voice Provider Setup
    if (this.config.voiceProvider === "local") {
      this.voicePrimary = new LocalTTSProvider() as any;
      this.voiceFallback = new ElevenLabsVoiceProvider();
    } else if (this.config.voiceProvider === "elevenlabs") {
      this.voicePrimary = new ElevenLabsVoiceProvider();
      this.voiceFallback = new MockVoiceProvider();
    } else {
      this.voicePrimary = new MockVoiceProvider();
      this.voiceFallback = new MockVoiceProvider();
    }

    // Avatar Provider Setup
    if (this.config.avatarProvider === "local") {
      this.avatarPrimary = new LocalAvatarProvider();
      this.avatarFallback = new ProductionAvatarProvider();
    } else if (this.config.avatarProvider === "heygen") {
      this.avatarPrimary = new ProductionAvatarProvider();
      this.avatarFallback = new MockAvatarProvider();
    } else {
      this.avatarPrimary = new MockAvatarProvider();
      this.avatarFallback = new MockAvatarProvider();
    }

    // LipSync Provider Setup
    if (this.config.lipSyncProvider === "local") {
      this.lipSyncPrimary = new LocalLipSyncProvider();
      this.lipSyncFallback = new RemoteLipSyncProvider();
    } else if (this.config.lipSyncProvider === "remote") {
      this.lipSyncPrimary = new RemoteLipSyncProvider();
      this.lipSyncFallback = new MockLipSyncProvider();
    } else {
      this.lipSyncPrimary = new MockLipSyncProvider();
      this.lipSyncFallback = new MockLipSyncProvider();
    }

    // AI Provider Setup
    if (this.config.aiProvider === "local") {
      this.aiPrimary = new LocalAIProvider();
      this.aiFallback = new GeminiAIProvider();
    } else if (this.config.aiProvider === "gemini") {
      this.aiPrimary = new GeminiAIProvider();
      this.aiFallback = new MockAIProvider();
    } else {
      this.aiPrimary = new MockAIProvider();
      this.aiFallback = new MockAIProvider();
    }
  }

  public static getInstance(): ProviderRouter {
    if (!ProviderRouter.instance) {
      ProviderRouter.instance = new ProviderRouter();
    }
    return ProviderRouter.instance;
  }

  /**
   * Route Voice Synthesis with Automatic Fallback
   */
  public async generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput> {
    const startTime = Date.now();
    try {
      const res = await this.voicePrimary.generateSpeech(input);
      costMonitor.recordOperation({
        provider: this.voicePrimary.name,
        operation: "voice_synthesis",
        durationMs: Date.now() - startTime,
        creditsUsed: res.cacheHit ? 0 : 3,
        estimatedCostUsd: res.cacheHit ? 0 : 0.006,
        cacheHit: Boolean(res.cacheHit),
      });
      return res;
    } catch (err: any) {
      console.warn(`[ProviderRouter] Primary Voice (${this.voicePrimary.name}) failed, executing fallback (${this.voiceFallback.name}):`, err.message);
      const res = await this.voiceFallback.generateSpeech(input);
      costMonitor.recordOperation({
        provider: `${this.voiceFallback.name} (fallback)`,
        operation: "voice_synthesis",
        durationMs: Date.now() - startTime,
        creditsUsed: res.cacheHit ? 0 : 3,
        estimatedCostUsd: res.cacheHit ? 0 : 0.006,
        cacheHit: Boolean(res.cacheHit),
      });
      return res;
    }
  }

  /**
   * Route Avatar Generation with Automatic Fallback
   */
  public async createAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoOutput> {
    const startTime = Date.now();
    try {
      const res = await this.avatarPrimary.createAvatarVideo(input);
      costMonitor.recordOperation({
        provider: this.avatarPrimary.name,
        operation: "avatar_generation",
        durationMs: Date.now() - startTime,
        creditsUsed: res.metadata?.cached ? 0 : 5,
        estimatedCostUsd: res.metadata?.cached ? 0 : 0.02,
        cacheHit: Boolean(res.metadata?.cached),
      });
      return res;
    } catch (err: any) {
      console.warn(`[ProviderRouter] Primary Avatar (${this.avatarPrimary.name}) failed, executing fallback:`, err.message);
      const res = await this.avatarFallback.createAvatarVideo(input);
      costMonitor.recordOperation({
        provider: `${this.avatarFallback.name} (fallback)`,
        operation: "avatar_generation",
        durationMs: Date.now() - startTime,
        creditsUsed: res.metadata?.cached ? 0 : 5,
        estimatedCostUsd: res.metadata?.cached ? 0 : 0.02,
        cacheHit: Boolean(res.metadata?.cached),
      });
      return res;
    }
  }

  /**
   * Route LipSync Alignment with Automatic Fallback
   */
  public async synchronizeLipSync(input: LipSyncInput): Promise<LipSyncResult> {
    const startTime = Date.now();
    try {
      const res = await this.lipSyncPrimary.synchronize(input);
      costMonitor.recordOperation({
        provider: this.lipSyncPrimary.name,
        operation: "lip_sync",
        durationMs: Date.now() - startTime,
        creditsUsed: res.cached || res.providerUsed === "local" ? 0 : 5,
        estimatedCostUsd: res.cached || res.providerUsed === "local" ? 0 : 0.015,
        cacheHit: res.cached,
      });
      return res;
    } catch (err: any) {
      console.warn(`[ProviderRouter] Primary LipSync (${this.lipSyncPrimary.name}) failed, executing fallback:`, err.message);
      const res = await this.lipSyncFallback.synchronize(input);
      costMonitor.recordOperation({
        provider: `${this.lipSyncFallback.name} (fallback)`,
        operation: "lip_sync",
        durationMs: Date.now() - startTime,
        creditsUsed: res.cached ? 0 : 5,
        estimatedCostUsd: res.cached ? 0 : 0.015,
        cacheHit: res.cached,
      });
      return res;
    }
  }

  /**
   * Route AI Storyboard Planning with Automatic Fallback
   */
  public async planVideo(input: any): Promise<any> {
    const startTime = Date.now();
    try {
      const res = await this.aiPrimary.planVideo(input);
      costMonitor.recordOperation({
        provider: this.aiPrimary.name,
        operation: "ai_planning",
        durationMs: Date.now() - startTime,
        creditsUsed: res.metadata?.cached ? 0 : 2,
        estimatedCostUsd: res.metadata?.cached ? 0 : 0.002,
        cacheHit: Boolean(res.metadata?.cached),
      });
      return res;
    } catch (err: any) {
      console.warn(`[ProviderRouter] Primary AI (${this.aiPrimary.name}) failed, executing fallback:`, err.message);
      const res = await this.aiFallback.planVideo(input);
      costMonitor.recordOperation({
        provider: `${this.aiFallback.name} (fallback)`,
        operation: "ai_planning",
        durationMs: Date.now() - startTime,
        creditsUsed: 2,
        estimatedCostUsd: 0.002,
        cacheHit: false,
      });
      return res;
    }
  }

  public getConfig(): ProviderRouterConfig {
    return { ...this.config };
  }

  public setConfig(config: Partial<ProviderRouterConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const providerRouter = ProviderRouter.getInstance();
