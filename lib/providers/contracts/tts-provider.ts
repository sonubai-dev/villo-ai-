/**
 * Text-to-Speech (TTS) Provider Interface for Vilo V1
 * Generates synthetic speech and word timings for accurate caption synchronization.
 */

import { Voice } from "@/lib/types";
import { MOCK_VOICES } from "@/lib/providers/mock/mock-voice";

export interface WordTiming {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface SpeechSynthesisInput {
  text: string;
  voiceId: string;
  speed?: number; // 0.5 - 2.0
  pitch?: number; // 0.5 - 2.0
  language?: string;
}

export interface SpeechSynthesisResult {
  audioUrl: string;
  duration: number; // in seconds
  wordTimings: WordTiming[];
  format: "mp3" | "wav" | "ogg";
  sampleRate: number;
}

export interface ITTSProvider {
  readonly name: string;
  listVoices(language?: string): Promise<Voice[]>;
  getVoice(id: string): Promise<Voice | null>;
  synthesize(input: SpeechSynthesisInput): Promise<SpeechSynthesisResult>;
}

export class MockTTSProvider implements ITTSProvider {
  readonly name = "MockTTSProvider";

  async listVoices(language?: string): Promise<Voice[]> {
    if (!language || language === "all") return MOCK_VOICES;
    return MOCK_VOICES.filter((v) => v.language.toLowerCase().includes(language.toLowerCase()));
  }

  async getVoice(id: string): Promise<Voice | null> {
    const found = MOCK_VOICES.find((v) => v.id === id);
    return found || MOCK_VOICES[0] || null;
  }

  async synthesize(input: SpeechSynthesisInput): Promise<SpeechSynthesisResult> {
    await new Promise((r) => setTimeout(r, 450));

    const words = input.text.trim().split(/\s+/).filter(Boolean);
    const speed = input.speed ?? 1.0;
    const wordsPerSecond = 2.5 * speed;
    const duration = Math.max(3, Math.ceil(words.length / wordsPerSecond));

    const wordTimings: WordTiming[] = [];
    let currentTime = 0.2;
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
    };
  }
}
