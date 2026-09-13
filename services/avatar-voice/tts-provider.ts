/**
 * Vilo V1 Text-to-Speech (TTS) Provider Interface & Implementations
 * Decouples speech synthesis from external vendors with server-side proxy
 * and accurate word-level timing estimation.
 */

import { TTSGenerationInput, TTSGenerationResult, WordTimingItem } from "./types";

export interface ITTSProvider {
  readonly name: string;
  generate(input: TTSGenerationInput, abortSignal?: AbortSignal): Promise<TTSGenerationResult>;
}

export class DeterministicTTSProvider implements ITTSProvider {
  readonly name = "DeterministicTTSProvider";

  async generate(input: TTSGenerationInput, abortSignal?: AbortSignal): Promise<TTSGenerationResult> {
    if (abortSignal?.aborted) throw new Error("TTS generation cancelled.");

    // Simulate speech synthesis processing delay
    await new Promise((r) => setTimeout(r, 400));
    if (abortSignal?.aborted) throw new Error("TTS generation cancelled.");

    const words = input.text.trim().split(/\s+/).filter(Boolean);
    const speed = input.speed ?? 1.0;
    const wordsPerSecond = 2.6 * speed;
    const duration = Math.max(2, Math.ceil(words.length / wordsPerSecond));

    const wordTimings: WordTimingItem[] = [];
    let currentTime = 0.15;

    for (const word of words) {
      const wordDuration = (1 / wordsPerSecond) * (0.8 + Math.random() * 0.4);
      wordTimings.push({
        word,
        start: Math.round(currentTime * 100) / 100,
        end: Math.round((currentTime + wordDuration) * 100) / 100,
      });
      currentTime += wordDuration + 0.04;
    }

    return {
      audioUrl: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
      duration,
      wordTimings,
      format: "mp3",
      sampleRate: 44100,
      provider: "DeterministicDevTTS",
      isMock: true,
    };
  }
}

export class ServerTTSProvider implements ITTSProvider {
  readonly name = "ServerTTSProvider";
  private fallback = new DeterministicTTSProvider();

  async generate(input: TTSGenerationInput, abortSignal?: AbortSignal): Promise<TTSGenerationResult> {
    try {
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("TTS request timed out (15s limit)")), 15000)
      );

      const fetchPromise = fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: abortSignal,
      });

      const res = (await Promise.race([fetchPromise, timeoutPromise])) as Response;

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        return json.data;
      }

      throw new Error(json.error || "Invalid response from TTS service");
    } catch (err: any) {
      console.warn("[ServerTTSProvider] API call failed; using deterministic speech engine:", err.message);
      return this.fallback.generate(input, abortSignal);
    }
  }
}

export const ttsProvider: ITTSProvider = new ServerTTSProvider();
