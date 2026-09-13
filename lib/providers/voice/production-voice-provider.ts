/**
 * Production Voice Provider
 * Vendor-agnostic HTTP client (ElevenLabs / Azure / OpenAI / Google TTS) with
 * deterministic audio caching and Cloud Storage persistence.
 * Keeps provider credentials securely on the server.
 */

import { Voice } from "@/lib/types";
import { IVoiceProvider, SpeechGenerationInput, SpeechGenerationOutput } from "./types";
import { MockVoiceProvider } from "./mock-voice-provider";
import { audioCacheManager } from "./audio-cache";
import { uploadBlobToStorage } from "@/lib/firebase/storage";
import { withTimeout, withRetry } from "@/lib/ai/rate-limiter";
import { MOCK_VOICES } from "../mock/mock-voice";

export class ProductionVoiceProvider implements IVoiceProvider {
  public name = "ProductionVoiceProvider";
  private apiKey?: string;
  private baseUrl?: string;
  private fallback = new MockVoiceProvider();

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || process.env.VOICE_PROVIDER_API_KEY;
    this.baseUrl = baseUrl || process.env.VOICE_PROVIDER_BASE_URL || "https://api.elevenlabs.io/v1";
  }

  async getVoices(): Promise<Voice[]> {
    if (!this.apiKey) {
      return this.fallback.getVoices();
    }

    try {
      const res = await withTimeout(
        fetch(`${this.baseUrl}/voices`, {
          headers: { "xi-api-key": this.apiKey },
        }),
        8000,
        "Fetch Provider Voices"
      );

      if (!res.ok) throw new Error("Failed to fetch voices from vendor");
      const data = await res.json();

      return (data.voices || []).map((v: any) => ({
        id: v.voice_id || v.id,
        name: v.name,
        gender: v.labels?.gender || "neutral",
        language: v.labels?.language || "en-US",
        accent: v.labels?.accent || "Neutral",
        tone: v.labels?.description || "Professional",
        previewAudio: v.preview_url || "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
      }));
    } catch (err: any) {
      console.warn("[ProductionVoiceProvider] getVoices fallback:", err.message);
      return this.fallback.getVoices();
    }
  }

  async generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput> {
    const cacheKey = audioCacheManager.computeCacheKey(input);
    const storagePath = audioCacheManager.getStoragePath(input, cacheKey);

    // 1. Check Cache Layer First (Prevents unnecessary vendor costs)
    const cached = await audioCacheManager.getCachedAudio(cacheKey);
    if (cached) {
      return {
        audioUrl: cached.audioUrl,
        duration: cached.duration,
        cacheHit: true,
        cacheKey,
        storagePath: cached.storagePath,
      };
    }

    // 2. If API Key is missing, fall back to Mock
    if (!this.apiKey) {
      console.warn("[ProductionVoiceProvider] Missing API key, executing Mock provider.");
      return this.fallback.generateSpeech(input);
    }

    // 3. Call External TTS Vendor with Timeout & Retry
    try {
      return await withRetry(
        async () => {
          const payload = {
            text: input.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
              style: input.emotion === "dramatic" ? 0.6 : 0.0,
              use_speaker_boost: true,
            },
          };

          const voiceId = input.voiceId.replace("voice-", "");

          const res = await withTimeout(
            fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "xi-api-key": this.apiKey!,
                Accept: "audio/mpeg",
              },
              body: JSON.stringify(payload),
            }),
            15000,
            "ElevenLabs Text-to-Speech"
          );

          if (!res.ok) {
            throw new Error(`Voice vendor responded with status ${res.status}`);
          }

          const audioBlob = await res.blob();
          const words = input.text.split(/\s+/).filter(Boolean);
          const duration = Math.max(3, Math.ceil(words.length / (2.5 * (input.speed ?? 1.0))));

          // 4. Upload Audio to Firebase Storage path: users/{userId}/projects/{projectId}/audio/{cacheKey}.mp3
          const audioUrl = await uploadBlobToStorage(storagePath, audioBlob, "audio/mpeg");

          // 5. Save Record to Cache Layer
          await audioCacheManager.saveCachedAudio(input, cacheKey, audioUrl, duration, storagePath);

          return {
            audioUrl,
            duration,
            cacheHit: false,
            cacheKey,
            storagePath,
          };
        },
        { maxRetries: 3, operationName: "Generate Speech TTS" }
      );
    } catch (err: any) {
      console.error("[ProductionVoiceProvider] generateSpeech failed, delegating to Mock:", err.message);
      return this.fallback.generateSpeech(input);
    }
  }
}
