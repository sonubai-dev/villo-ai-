/**
 * OpenAI Provider Adapter for Vilo AI
 * Implements the unified AIProvider interface for future OpenAI GPT-4o / GPT-4o-mini integration.
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

export class OpenAIProvider implements AIProvider {
  public name = "OpenAIProvider";
  private fallback = new MockAIProvider();
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async planVideo(input: VideoPlanningInput): Promise<VideoPlan> {
    // In current tier, delegate to structured fallback or future OpenAI endpoint
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
