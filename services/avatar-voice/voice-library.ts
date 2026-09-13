/**
 * Vilo V1 Voice Library
 * Comprehensive catalog of neural voice models supporting accents,
 * preview audio playback, speed/pitch controls, and provider decoupling.
 */

import { VoiceItem, VoiceStyle, VoiceGender } from "./types";

export const VOICE_LIBRARY: VoiceItem[] = [
  {
    id: "voice-emma",
    name: "Emma",
    language: "English (US)",
    accent: "American (Standard)",
    gender: "female",
    style: "Conversational",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google US English",
    rate: 1.0,
    pitch: 1.0,
    metadata: { sampleRate: 44100, supportedLanguages: ["en-US"] },
  },
  {
    id: "voice-daniel",
    name: "Daniel",
    language: "English (US)",
    accent: "American (Deep & Clear)",
    gender: "male",
    style: "Authoritative",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google UK English Male",
    rate: 1.0,
    pitch: 1.0,
    metadata: { sampleRate: 44100, supportedLanguages: ["en-US"] },
  },
  {
    id: "voice-sofia",
    name: "Sofia",
    language: "English (UK)",
    accent: "British (RP)",
    gender: "female",
    style: "Professional",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google UK English Female",
    rate: 1.0,
    pitch: 1.05,
    metadata: { sampleRate: 44100, supportedLanguages: ["en-GB"] },
  },
  {
    id: "voice-arjun",
    name: "Arjun",
    language: "English (India)",
    accent: "Indian (Neutral)",
    gender: "male",
    style: "Warm",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google हिन्दी",
    rate: 1.0,
    pitch: 1.0,
    metadata: { sampleRate: 44100, supportedLanguages: ["en-IN", "hi-IN"] },
  },
  {
    id: "voice-priya",
    name: "Priya",
    language: "English (India)",
    accent: "Indian (Modern)",
    gender: "female",
    style: "Enthusiastic",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google हिन्दी",
    rate: 1.05,
    pitch: 1.1,
    metadata: { sampleRate: 44100, supportedLanguages: ["en-IN", "hi-IN"] },
  },
  {
    id: "voice-lucas",
    name: "Lucas",
    language: "English (AU)",
    accent: "Australian",
    gender: "male",
    style: "Narrative",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google UK English Male",
    rate: 1.0,
    pitch: 0.95,
    metadata: { sampleRate: 44100, supportedLanguages: ["en-AU"] },
  },
  {
    id: "voice-elena",
    name: "Elena",
    language: "Spanish",
    accent: "Castilian",
    gender: "female",
    style: "Professional",
    provider: "elevenlabs",
    previewAudio: "https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg",
    speechSynthesisVoice: "Google español",
    rate: 1.0,
    pitch: 1.0,
    metadata: { sampleRate: 44100, supportedLanguages: ["es-ES", "es-MX"] },
  },
];

export interface VoiceFilterParams {
  gender?: VoiceGender | "all";
  language?: string;
  style?: string;
  searchQuery?: string;
}

export class VoiceLibraryService {
  private static instance: VoiceLibraryService;

  public static getInstance(): VoiceLibraryService {
    if (!VoiceLibraryService.instance) {
      VoiceLibraryService.instance = new VoiceLibraryService();
    }
    return VoiceLibraryService.instance;
  }

  public listVoices(params?: VoiceFilterParams): VoiceItem[] {
    let list = [...VOICE_LIBRARY];

    if (params?.gender && params.gender !== "all") {
      list = list.filter((v) => v.gender === params.gender);
    }
    if (params?.language && params.language !== "All") {
      list = list.filter((v) => v.language.toLowerCase().includes(params.language!.toLowerCase()));
    }
    if (params?.style && params.style !== "All") {
      list = list.filter((v) => v.style.toLowerCase() === params.style?.toLowerCase());
    }
    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.language.toLowerCase().includes(q) ||
          v.accent.toLowerCase().includes(q) ||
          v.style.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getVoiceById(id: string): VoiceItem {
    return VOICE_LIBRARY.find((v) => v.id === id) || VOICE_LIBRARY[0];
  }
}

export const voiceLibrary = VoiceLibraryService.getInstance();
