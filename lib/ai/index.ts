/**
 * AI Content Intelligence & Low-Cost Hybrid Video Engine Factory
 */

export * from "./types";
export * from "./schemas";
export * from "./json-repair";
export * from "./rate-limiter";
export * from "./mock-provider";
export * from "./gemini-provider";
export * from "./routing/model-router";
export * from "./caching/ai-cache";
export * from "./planning/types";
export * from "./planning/schemas";
export * from "./planning/plan-optimizer";
export * from "./planning/plan-adapter";
export * from "./providers/openai-provider";
export * from "./providers/anthropic-provider";
export * from "./providers/local-provider";

import { AIProvider } from "./types";
import { GeminiAIProvider } from "./gemini-provider";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./providers/openai-provider";
import { AnthropicProvider } from "./providers/anthropic-provider";
import { LocalAIProvider } from "./providers/local-provider";

export type SupportedAIProvider = "gemini" | "mock" | "openai" | "anthropic" | "local";

export class AIProviderFactory {
  private static defaultProvider: AIProvider | null = null;

  public static getProvider(providerType?: SupportedAIProvider): AIProvider {
    const useMock = process.env.NEXT_PUBLIC_USE_MOCK_PROVIDERS === "true";
    const selected = providerType || (process.env.AI_PROVIDER as SupportedAIProvider) || "gemini";

    if (useMock || selected === "mock") {
      return new MockAIProvider();
    }

    switch (selected) {
      case "gemini": {
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
        if (geminiKey) return new GeminiAIProvider(geminiKey);
        return new MockAIProvider();
      }
      case "openai":
        return new OpenAIProvider();
      case "anthropic":
        return new AnthropicProvider();
      case "local":
        return new LocalAIProvider();
      default:
        return new MockAIProvider();
    }
  }

  public static setCustomProvider(provider: AIProvider): void {
    AIProviderFactory.defaultProvider = provider;
  }
}

export function getAIProvider(): AIProvider {
  return AIProviderFactory.getProvider();
}

export const serverAIProvider = getAIProvider();
