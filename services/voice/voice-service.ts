/**
 * Client-Safe Voice Service
 * Communicates with server-side TTS generation routes and retrieves voice catalogs.
 */

import { Voice } from "@/lib/types";
import { SpeechGenerationInput, SpeechGenerationOutput } from "@/lib/providers/voice/types";
import { MockVoiceProvider } from "@/lib/providers/voice/mock-voice-provider";

export class VoiceService {
  private static instance: VoiceService;
  private fallback = new MockVoiceProvider();

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  async getVoices(): Promise<Voice[]> {
    return this.fallback.getVoices();
  }

  async generateSpeech(input: SpeechGenerationInput): Promise<SpeechGenerationOutput> {
    try {
      const res = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Voice API responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[VoiceService] API route error, using local fallback:", err.message);
      return this.fallback.generateSpeech(input);
    }
  }
}

export const voiceService = VoiceService.getInstance();
