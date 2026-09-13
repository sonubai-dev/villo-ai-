/**
 * Client-Safe AI Service with Low-Cost Hybrid Optimization
 * - Calls secure server-side API routes so API keys are never exposed.
 * - Uses local PlanOptimizer for zero-cost deterministic styling/motion updates.
 * - Provides graceful fallback to MockAIProvider in offline/demo modes.
 */

import {
  ScriptGenerationInput,
  ScriptGenerationOutput,
  ImageAnalysisInput,
  ImageAnalysisOutput,
  DocumentAnalysisInput,
  DocumentAnalysisOutput,
  SceneGenerationInput,
  SceneGenerationOutput,
  VideoPlan,
  VideoPlanningInput,
  ScriptRewriteInput,
  ScriptRewriteOutput,
  MotionVFXRecommendationInput,
  MotionVFXRecommendationOutput,
  DeterministicDelta,
} from "@/lib/ai";
import { MockAIProvider } from "@/lib/ai/mock-provider";
import { planOptimizer } from "@/lib/ai/planning/plan-optimizer";

export class AIService {
  private static instance: AIService;
  private fallback = new MockAIProvider();

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * 1. Plan Video (Generates structured VideoPlan JSON for deterministic rendering engine)
   */
  async planVideo(input: VideoPlanningInput): Promise<VideoPlan> {
    try {
      const res = await fetch("/api/ai/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] planVideo API route error, using local fallback:", err.message);
      return this.fallback.planVideo(input);
    }
  }

  /**
   * 2. Rewrite Script (Cheap tier model)
   */
  async rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput> {
    try {
      const res = await fetch("/api/ai/script/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] rewriteScript API route error, using local fallback:", err.message);
      return this.fallback.rewriteScript(input);
    }
  }

  /**
   * 3. Recommend Motion and VFX
   */
  async recommendMotionAndVFX(input: MotionVFXRecommendationInput): Promise<MotionVFXRecommendationOutput> {
    try {
      const res = await fetch("/api/ai/motion-vfx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] recommendMotionAndVFX API route error, using local fallback:", err.message);
      return this.fallback.recommendMotionAndVFX(input);
    }
  }

  /**
   * 4. Zero-Cost Deterministic Delta Update (NEVER calls AI!)
   * Used when only camera, motion, caption styling, or VFX parameters are tweaked.
   */
  applyDeterministicDelta(basePlan: VideoPlan, delta: DeterministicDelta): VideoPlan {
    return planOptimizer.applyDeterministicDelta(basePlan, delta).plan;
  }

  /**
   * 5. Legacy Script Generation
   */
  async generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationOutput> {
    try {
      const res = await fetch("/api/ai/script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] API route error, using local fallback:", err.message);
      return this.fallback.generateScript(input);
    }
  }

  /**
   * 6. Legacy Image Analysis
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput> {
    try {
      const res = await fetch("/api/ai/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] API route error, using local fallback:", err.message);
      return this.fallback.analyzeImage(input);
    }
  }

  /**
   * 7. Legacy Document Analysis
   */
  async analyzeDocument(input: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
    try {
      const res = await fetch("/api/ai/analyze-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] API route error, using local fallback:", err.message);
      return this.fallback.analyzeDocument(input);
    }
  }

  /**
   * 8. Legacy Scene Generation
   */
  async generateScenes(input: SceneGenerationInput): Promise<SceneGenerationOutput> {
    try {
      const res = await fetch("/api/ai/scenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const json = await res.json();
      return json.data;
    } catch (err: any) {
      console.warn("[AIService] API route error, using local fallback:", err.message);
      return this.fallback.generateScenes(input);
    }
  }
}

export const aiService = AIService.getInstance();
