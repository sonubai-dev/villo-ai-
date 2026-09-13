/**
 * Mock Voice Provider for Avatar Motion Pipeline
 * Ready to be swapped with ElevenLabs API provider.
 */

import { IVoiceProvider, VoiceInput, VoiceResult } from "./types";

export class MockVoiceProvider implements IVoiceProvider {
  public name = "MockVoiceProvider (ElevenLabs Interface Compatible)";

  async generateSpeech(input: VoiceInput): Promise<VoiceResult> {
    // Simulate neural voice synthesis latency (1.2s)
    await new Promise((res) => setTimeout(res, 1200));

    const words = input.text.trim().split(/\s+/).filter(Boolean);
    const speed = input.speed ?? 1.0;
    const duration = Math.max(4, Math.ceil(words.length / (2.5 * speed)));

    const wordDuration = duration / (words.length || 1);
    const wordsTimings = words.map((word, idx) => ({
      word,
      start: idx * wordDuration,
      end: (idx + 1) * wordDuration,
    }));

    return {
      audioUrl: "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
      duration,
      wordsTimings,
    };
  }
}
