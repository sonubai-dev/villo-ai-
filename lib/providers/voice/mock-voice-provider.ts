/**
 * Mock Voice Provider
 * Deterministic TTS simulation with integrated audio caching.
 */

import { Voice } from "@/lib/types";
import { IVoiceProvider, SpeechGenerationInput, SpeechGenerationOutput } from "./types";
import { audioCacheManager } from "./audio-cache";
import { MOCK_VOICES } from "../mock/mock-voice";

export class MockVoiceProvider implements IVoiceProvider {
  public name = "MockVoiceProvider";

  async getVoices(): Promise<Voice[]> {
    await new Promise((r) => setTimeout(r, 60));
    return MOCK_VOICES;
  }

  async generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput> {
    const cacheKey = audioCacheManager.computeCacheKey(input);
    const storagePath = audioCacheManager.getStoragePath(input, cacheKey);

    // 1. Check Cache Layer First
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

    // 2. Generate Simulated TTS Audio (Cache Miss)
    await new Promise((r) => setTimeout(r, 120));
    const words = input.text.split(/\s+/).filter(Boolean);
    const speed = input.speed ?? 1.0;
    const baseDuration = Math.max(3, Math.ceil(words.length / (2.6 * speed)));

    const audioUrl = "https://actions.google.com/sounds/v1/speech/greeting_female.ogg";

    // Generate word timestamps
    const wordDuration = baseDuration / (words.length || 1);
    const wordsTimings = words.map((word, idx) => ({
      word,
      start: idx * wordDuration,
      end: (idx + 1) * wordDuration,
    }));

    // 3. Save to Cache
    await audioCacheManager.saveCachedAudio(input, cacheKey, audioUrl, baseDuration, storagePath);

    return {
      audioUrl,
      duration: baseDuration,
      cacheHit: false,
      cacheKey,
      storagePath,
      wordsTimings,
    };
  }
}
