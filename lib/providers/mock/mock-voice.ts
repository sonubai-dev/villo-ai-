import { Voice } from "@/lib/types";
import { VoiceProvider, VoiceInput, AudioResult } from "../types";

export const MOCK_VOICES: Voice[] = [
  {
    id: "voice-emma",
    name: "Emma",
    gender: "female",
    language: "en-US",
    accent: "American",
    tone: "Conversational",
    pitch: 1.05,
    rate: 1.0,
    previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
  },
  {
    id: "voice-daniel",
    name: "Daniel",
    gender: "male",
    language: "en-US",
    accent: "American",
    tone: "Authoritative",
    pitch: 0.95,
    rate: 1.0,
    previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_male.ogg",
  },
  {
    id: "voice-sofia",
    name: "Sofia",
    gender: "female",
    language: "en-GB",
    accent: "British",
    tone: "Warm",
    pitch: 1.0,
    rate: 0.95,
    previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
  },
  {
    id: "voice-arjun",
    name: "Arjun",
    gender: "male",
    language: "en-IN",
    accent: "Indian",
    tone: "Enthusiastic",
    pitch: 1.0,
    rate: 1.05,
    previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_male.ogg",
  },
  {
    id: "voice-priya",
    name: "Priya",
    gender: "female",
    language: "hi-IN",
    accent: "Indian (Hindi/English)",
    tone: "Warm",
    pitch: 1.1,
    rate: 1.0,
    previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
  },
  {
    id: "voice-lucas",
    name: "Lucas",
    gender: "male",
    language: "en-AU",
    accent: "Australian",
    tone: "Calm",
    pitch: 0.98,
    rate: 0.95,
    previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_male.ogg",
  },
];

export class MockVoiceProvider implements VoiceProvider {
  async getVoices(): Promise<Voice[]> {
    await new Promise((r) => setTimeout(r, 80));
    return MOCK_VOICES;
  }

  async getVoiceById(id: string): Promise<Voice | null> {
    return MOCK_VOICES.find((v) => v.id === id) || null;
  }

  async generateSpeech(input: VoiceInput): Promise<AudioResult> {
    const words = input.text.split(/\s+/).filter(Boolean);
    const estimatedDuration = Math.max(3, Math.ceil(words.length / 2.6));
    
    // Generate word timestamps for karaoke caption sync
    const wordDuration = estimatedDuration / (words.length || 1);
    const wordsTimings = words.map((word, idx) => ({
      word,
      start: idx * wordDuration,
      end: (idx + 1) * wordDuration,
    }));

    return {
      audioUrl: "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
      duration: estimatedDuration,
      wordsTimings,
    };
  }
}
