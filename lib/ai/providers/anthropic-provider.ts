/**
 * Anthropic Claude Provider Adapter for Vilo AI
 * Implements the unified AIProvider interface for future Claude 3.5 Sonnet / Haiku integration.
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

export class AnthropicProvider implements AIProvider {
  public name = "AnthropicProvider";
  private fallback = new MockAIProvider();
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
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
