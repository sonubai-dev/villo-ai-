/**
 * Vilo V1 Avatar & Voice System - Type Definitions
 * Strict models for avatars, voices, and Text-to-Speech (TTS) generation.
 */

export type AvatarGender = "male" | "female" | "non-binary";

export type AvatarStyle =
  | "Professional"
  | "Creator"
  | "Teacher"
  | "Real Estate"
  | "Casual"
  | "Executive"
  | "Presenter";

export interface AvatarItem {
  id: string;
  name: string;
  thumbnail: string;
  previewVideo: string;
  gender: AvatarGender;
  style: AvatarStyle;
  language: string;
  provider: "heygen" | "did" | "mock_studio" | "local_blend";
  role: string;
  tags: string[];
  metadata?: {
    resolution?: string;
    transparentBackground?: boolean;
    aspectRatios?: ("16:9" | "9:16" | "1:1")[];
  };
}

export type VoiceGender = "male" | "female";

export type VoiceStyle =
  | "Professional"
  | "Enthusiastic"
  | "Warm"
  | "Authoritative"
  | "Conversational"
  | "Calm"
  | "Narrative";

export interface VoiceItem {
  id: string;
  name: string;
  language: string;
  accent: string;
  gender: VoiceGender;
  style: VoiceStyle;
  provider: "elevenlabs" | "azure" | "webspeech" | "mock_studio";
  previewAudio: string;
  speechSynthesisVoice?: string;
  rate?: number;
  pitch?: number;
  metadata?: {
    sampleRate?: number;
    supportedLanguages?: string[];
  };
}

export interface TTSGenerationInput {
  text: string;
  voiceId: string;
  language?: string;
  speed?: number; // 0.5 - 2.0 (default 1.0)
  pitch?: number; // 0.5 - 2.0 (default 1.0)
  idempotencyKey?: string;
}

export interface WordTimingItem {
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
}

export interface TTSGenerationResult {
  audioUrl: string;
  duration: number; // in seconds
  wordTimings: WordTimingItem[];
  format: "mp3" | "wav" | "ogg";
  sampleRate: number;
  provider: string;
  isMock: boolean;
}
