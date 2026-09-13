/**
 * Experimental Local Script Provider (Self-Hosted LLM / Ollama)
 * Allows executing AI script writing and scene planning on self-hosted compute.
 */

import { VideoPlanningInput, VideoPlan, ScriptRewriteInput, ScriptRewriteOutput } from "@/lib/ai/planning/types";
import { MockAIProvider } from "@/lib/ai/mock-provider";

export interface ILocalScriptProvider {
  readonly name: string;
  isAvailable(): Promise<boolean>;
  planVideo(input: VideoPlanningInput): Promise<VideoPlan>;
  rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput>;
}

export class LocalScriptProvider implements ILocalScriptProvider {
  readonly name = "LocalScriptProvider";
  private endpoint: string;
  private fallback = new MockAIProvider();

  constructor(endpoint?: string) {
    this.endpoint = endpoint || process.env.LOCAL_LLM_ENDPOINT || "http://localhost:11434";
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.endpoint}/api/tags`, { method: "GET" }).catch(() => null);
      return Boolean(res && res.ok);
    } catch {
      return false;
    }
  }

  async planVideo(input: VideoPlanningInput): Promise<VideoPlan> {
    const isOnline = await this.isAvailable();
    if (isOnline) {
      try {
        const response = await fetch(`${this.endpoint}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Plan a video for: ${input.topic}`,
            format: "json",
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.response);
          return {
            ...parsed,
            metadata: { modelTier: "cheap", modelName: "local-llama3-gpu", cached: false, tokenCost: 0 },
          };
        }
      } catch (err) {
        console.warn("[LocalScriptProvider] Local LLM error, falling back:", err);
      }
    }

    return this.fallback.planVideo(input);
  }

  async rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput> {
    const isOnline = await this.isAvailable();
    if (isOnline) {
      try {
        const response = await fetch(`${this.endpoint}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama3",
            prompt: `Rewrite script: ${input.script}`,
            format: "json",
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const parsed = JSON.parse(data.response);
          return parsed;
        }
      } catch (err) {
        console.warn("[LocalScriptProvider] Local rewrite error, falling back:", err);
      }
    }

    return this.fallback.rewriteScript(input);
  }
}
