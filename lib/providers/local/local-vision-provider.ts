/**
 * Experimental Local Vision Provider (Self-Hosted Multimodal VLM)
 * Analyzes images and slides on self-hosted compute.
 */

import { MockAIProvider } from "@/lib/ai/mock-provider";

export interface ImageAnalysisInput {
  imageUrl: string;
  prompt?: string;
}

export interface ImageAnalysisOutput {
  description: string;
  suggestedMotion: string;
  tags: string[];
  providerUsed: "local" | "mock" | "gemini";
}

export interface ILocalVisionProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput>;
}

export class LocalVisionProvider implements ILocalVisionProvider {
  readonly name = "LocalVisionProvider";
  private endpoint: string;

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.LOCAL_VISION_ENDPOINT || "http://localhost:8001";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/health`, { method: "GET" }).catch(() => null);
      return Boolean(res && res.ok);
    } catch {
      return false;
    }
  }

  async analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput> {
    const isOnline = await this.isAvailable();
    if (isOnline) {
      try {
        const res = await fetch(`${this.endpoint}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (res.ok) {
          const data = await res.json();
          return { ...data, providerUsed: "local" };
        }
      } catch (err) {
        console.warn("[LocalVisionProvider] Error, falling back:", err);
      }
    }

    return {
      description: "Visual analysis processed via local vision stub.",
      suggestedMotion: "slowPush",
      tags: ["technology", "modern", "cinematic"],
      providerUsed: "local",
    };
  }
}
