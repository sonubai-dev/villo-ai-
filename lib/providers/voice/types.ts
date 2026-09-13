/**
 * Voice Provider Interface and Type Definitions
 */

import { Voice } from "@/lib/types";

export type VoiceEmotion = "neutral" | "cheerful" | "excited" | "serious" | "warm" | "dramatic";

export interface SpeechGenerationInput {
  text: string;
  voiceId: string;
  language?: string;
  speed?: number; // 0.5 to 2.0 (default 1.0)
  pitch?: number; // 0.5 to 1.5 (default 1.0)
  emotion?: VoiceEmotion;
  userId?: string;
  projectId?: string;
  sceneId?: string;
}

export interface WordTiming {
  word: string;
  start: number;
  end: number;
}

export interface SpeechGenerationOutput {
  audioUrl: string;
  duration: number; // in seconds
  cacheHit: boolean;
  cacheKey: string;
  storagePath?: string;
  wordsTimings?: WordTiming[];
}

export interface IVoiceProvider {
  name: string;
  generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput>;
  getVoices(): Promise<Voice[]>;
}
