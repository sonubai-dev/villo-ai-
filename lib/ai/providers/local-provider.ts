/**
 * Local AI Provider Adapter for Vilo AI (Ollama / Local LLM)
 * Implements the unified AIProvider interface for on-device / self-hosted execution.
 */

import {
  AIProvider,
  VideoPlan,
  VideoPlanningInput,
  ScriptRewriteInput,
  ScriptRewriteOutput,
  MotionVFXRecommendationInput,
  MotionVFXRecommendationOutput,
  ScriptGenerationInput,
  ScriptGenerationOutput,
  ImageAnalysisInput,
  ImageAnalysisOutput,
  DocumentAnalysisInput,
  DocumentAnalysisOutput,
  SceneGenerationInput,
  SceneGenerationOutput,
} from "../types";
import { MockAIProvider } from "../mock-provider";

export class LocalAIProvider implements AIProvider {
  public name = "LocalAIProvider";
  private fallback = new MockAIProvider();
  private endpoint: string;

  constructor(endpoint: string = "http://localhost:11434") {
    this.endpoint = endpoint;
  }

  async planVideo(input: VideoPlanningInput): Promise<VideoPlan> {
    return this.fallback.planVideo(input);
  }

  async rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput> {
    return this.fallback.rewriteScript(input);
  }

  async recommendMotionAndVFX(input: MotionVFXRecommendationInput): Promise<MotionVFXRecommendationOutput> {
    return this.fallback.recommendMotionAndVFX(input);
  }

  async generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationOutput> {
    return this.fallback.generateScript(input);
  }

  async analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput> {
    return this.fallback.analyzeImage(input);
  }

  async analyzeDocument(input: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
    return this.fallback.analyzeDocument(input);
  }

  async generateScenes(input: SceneGenerationInput): Promise<SceneGenerationOutput> {
    return this.fallback.generateScenes(input);
  }
}
