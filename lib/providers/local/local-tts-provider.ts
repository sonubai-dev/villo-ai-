/**
 * Experimental Local TTS Provider (Coqui TTS / ChatTTS / Piper / Bark)
 * Synthesizes neural speech on self-hosted GPU worker.
 */

import { SpeechGenerationInput, SpeechGenerationOutput } from "@/lib/providers/voice/types";
import { MockVoiceProvider } from "@/lib/providers/voice/mock-voice-provider";
import { audioCacheManager } from "@/lib/providers/voice/audio-cache";

export interface ILocalTTSProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput>;
}

export class LocalTTSProvider implements ILocalTTSProvider {
  readonly name = "LocalTTSProvider";
  private endpoint: string;
  private fallback = new MockVoiceProvider();

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.LOCAL_TTS_ENDPOINT || "http://localhost:8002";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/health`, { method: "GET" }).catch(() => null);
      return Boolean(res && res.ok);
    } catch {
      return false;
    }
  }

  async generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput> {
    const cacheKey = audioCacheManager.computeCacheKey(input);
    const cached = await audioCacheManager.getCachedAudio(cacheKey);

    if (cached) {
      return {
        audioUrl: cached.audioUrl,
        duration: cached.duration,
        cacheHit: true,
        cacheKey: cached.cacheKey,
        storagePath: cached.storagePath,
      };
    }

    const isOnline = await this.isAvailable();
    if (isOnline) {
      try {
        const response = await fetch(`${this.endpoint}/synthesize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: input.text,
            voice_id: input.voiceId,
            speed: input.speed || 1.0,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const audioUrl = data.audio_url || "https://actions.google.com/sounds/v1/speech/greeting_female.ogg";
          const duration = data.duration || Math.max(3, Math.ceil(input.text.split(" ").length / 2.5));

          const saved = await audioCacheManager.saveCachedAudio(
            input,
            cacheKey,
            audioUrl,
            duration,
            `users/${input.userId || "local"}/projects/${input.projectId || "gen"}/audio/${cacheKey}.mp3`
          );

          return {
            audioUrl: saved.audioUrl,
            duration: saved.duration,
            cacheHit: false,
            cacheKey,
            storagePath: saved.storagePath,
          };
        }
      } catch (err) {
        console.warn("[LocalTTSProvider] Local TTS error, falling back:", err);
      }
    }

    return this.fallback.generateSpeech(input);
  }
}
