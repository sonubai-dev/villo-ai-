/**
 * Voice Provider Factory and Module Exports
 */

export * from "./types";
export * from "./audio-cache";
export * from "./mock-voice-provider";
export * from "./production-voice-provider";

import { IVoiceProvider } from "./types";
import { MockVoiceProvider } from "./mock-voice-provider";
import { ProductionVoiceProvider } from "./production-voice-provider";

export function getVoiceProvider(): IVoiceProvider {
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_PROVIDERS === "true";
  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VOICE_PROVIDER_API_KEY;

  if (!useMock && apiKey) {
    return new ProductionVoiceProvider(apiKey);
  }

  return new MockVoiceProvider();
}

export const serverVoiceProvider = getVoiceProvider();
