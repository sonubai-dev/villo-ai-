/**
 * Production Gemini AI Provider for Low-Cost Hybrid Video Engine
 * Uses tiered model routing, deterministic prompt caching, Zod validation,
 * automated JSON repair, and fallback to MockAIProvider when unconfigured.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  AIProvider,
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
} from "./types";
import {
  ScriptGenerationOutputSchema,
  ImageAnalysisOutputSchema,
  DocumentAnalysisOutputSchema,
  SceneGenerationOutputSchema,
} from "./schemas";
import {
  VideoPlanSchema,
  ScriptRewriteOutputSchema,
  MotionVFXRecommendationOutputSchema,
} from "./planning/schemas";
import { safeParseAndRepairJson } from "./json-repair";
import { withTimeout, withRetry } from "./rate-limiter";
import { MockAIProvider } from "./mock-provider";
import { aiModelRouter, ModelTier } from "./routing/model-router";
import { aiCacheManager } from "./caching/ai-cache";

export class GeminiAIProvider implements AIProvider {
  public name = "GeminiAIProvider";
  private genAI: GoogleGenerativeAI | null = null;
  private fallbackProvider = new MockAIProvider();

  constructor(apiKey?: string) {
    const key =
      apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (key) {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  private getGenerativeModel(tier: ModelTier = "standard") {
    if (!this.genAI) return null;
    const config = aiModelRouter.routeTask("video_planning", tier);

    return this.genAI.getGenerativeModel({
      model: config.modelName,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    });
  }

  /**
   * 1. Plan Full Video (Creates VideoPlan JSON for deterministic rendering engine)
   */
  async planVideo(input: VideoPlanningInput): Promise<VideoPlan> {
    const tier: ModelTier = "standard";

    return (
      await aiCacheManager.getOrExecute<VideoPlan>(
        "video_planning",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.planVideo(input);
          }

          const prompt = `
You are the Chief AI Screenwriter & Storyboard Director for Vilo AI.
Plan a structured, multi-scene video storyboard on the topic: "${input.topic}".
Target Tone: ${input.tone || "professional"}.
Target Duration: ${input.targetDurationSeconds || 15} seconds.
Aspect Ratio: ${input.aspectRatio || "9:16"}.
Include Presenter Avatar: ${input.includeAvatar ?? true}.
${input.additionalGuidelines ? `Guidelines: ${input.additionalGuidelines}` : ""}

Return ONLY a valid JSON object strictly matching this schema:
{
  "id": "plan-generated",
  "title": "Short Punchy Title",
  "summary": "Brief 1-sentence storyboard summary",
  "topic": "${input.topic}",
  "tone": "${input.tone || "professional"}",
  "targetDuration": ${input.targetDurationSeconds || 15},
  "aspectRatio": "${input.aspectRatio || "9:16"}",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene Title",
      "script": "Narration text for avatar (15-30 words)",
      "duration": 5,
      "avatar": true,
      "motion": { "type": "cameraPush", "speed": 1.0, "intensity": 50 },
      "vfx": [{ "type": "glow", "intensity": 0.3, "blendMode": "screen", "startTime": 0, "duration": 5 }],
      "caption": { "style": "highlight", "level": "word", "highlightColor": "#38bdf8", "position": "bottom" },
      "camera": { "type": "slowPush", "framing": "medium", "speed": 1.0 },
      "visualPrompt": "Photorealistic visual prompt for scene background",
      "suggestedVisualType": "image",
      "transition": "fade",
      "keywords": ["keyword1", "keyword2"]
    }
  ],
  "globalCaptionPlan": {
    "style": "highlight",
    "level": "word",
    "highlightColor": "#38bdf8",
    "position": "bottom"
  }
}
`;

          try {
            return await withRetry(
              async () => {
                const res = await withTimeout(model.generateContent(prompt), 15000);
                const text = res.response.text();
                const parsed = safeParseAndRepairJson(text, VideoPlanSchema);
                if (!parsed.success || !parsed.data) {
                  throw new Error(parsed.error || "Failed to parse VideoPlan schema");
                }

                return {
                  ...parsed.data,
                  metadata: {
                    modelTier: tier,
                    modelName: aiModelRouter.routeTask("video_planning", tier).modelName,
                    cached: false,
                    generatedAt: new Date().toISOString(),
                  },
                } as VideoPlan;
              },
              { maxRetries: 2 }
            );
          } catch (err: any) {
            console.warn("[GeminiAIProvider] planVideo failed, using fallback:", err.message);
            return this.fallbackProvider.planVideo(input);
          }
        }
      )
    ).data;
  }

  /**
   * 2. Rewrite Script (Cheap tier model)
   */
  async rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput> {
    const tier: ModelTier = "cheap";

    return (
      await aiCacheManager.getOrExecute<ScriptRewriteOutput>(
        "script_rewrite",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.rewriteScript(input);
          }

          const prompt = `
Rewrite the following video script with the goal: "${input.goal}".
Target Tone: ${input.targetTone || "professional"}.
Original Script: "${input.script}"

Return ONLY valid JSON:
{
  "originalScript": "${input.script}",
  "rewrittenScript": "Rewritten concise and impactful narration",
  "estimatedDuration": number,
  "wordCount": number,
  "improvementsMade": ["improvement 1", "improvement 2"]
}
`;

          try {
            const res = await withTimeout(model.generateContent(prompt), 10000);
            const text = res.response.text();
            const parsed = safeParseAndRepairJson(text, ScriptRewriteOutputSchema);
            if (!parsed.success || !parsed.data) {
              throw new Error(parsed.error || "Failed to parse ScriptRewrite schema");
            }
            return parsed.data;
          } catch (err: any) {
            console.warn("[GeminiAIProvider] rewriteScript failed, using fallback:", err.message);
            return this.fallbackProvider.rewriteScript(input);
          }
        }
      )
    ).data;
  }

  /**
   * 3. Recommend Motion and VFX (Cheap tier model)
   */
  async recommendMotionAndVFX(input: MotionVFXRecommendationInput): Promise<MotionVFXRecommendationOutput> {
    const tier: ModelTier = "cheap";

    return (
      await aiCacheManager.getOrExecute<MotionVFXRecommendationOutput>(
        "motion_vfx_recommendation",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.recommendMotionAndVFX(input);
          }

          const prompt = `
Analyze this scene script and recommend the optimal camera motion, motion preset, VFX, and caption style:
Script: "${input.scriptSnippet}"
Duration: ${input.duration}s
Mood: ${input.mood || "neutral"}

Return ONLY valid JSON:
{
  "recommendedCamera": { "type": "slowPush | dynamicPush | cinematic | static", "framing": "medium | closeUp", "speed": 1.0 },
  "recommendedMotion": { "type": "cameraPush | zoomIn | bounce | subtleFloat", "speed": 1.0, "intensity": 50 },
  "recommendedVFX": [{ "type": "glow | lightLeak | speedLines | particles", "intensity": 0.3, "blendMode": "screen", "startTime": 0, "duration": ${input.duration} }],
  "recommendedCaption": { "style": "highlight | pop | bold", "level": "word", "highlightColor": "#38bdf8", "position": "bottom" },
  "reasoning": "Brief explanation of pacing and visual alignment"
}
`;

          try {
            const res = await withTimeout(model.generateContent(prompt), 10000);
            const text = res.response.text();
            const parsed = safeParseAndRepairJson(text, MotionVFXRecommendationOutputSchema);
            if (!parsed.success || !parsed.data) {
              throw new Error(parsed.error || "Failed to parse MotionVFX schema");
            }
            return parsed.data;
          } catch (err: any) {
            console.warn("[GeminiAIProvider] recommendMotionAndVFX failed, using fallback:", err.message);
            return this.fallbackProvider.recommendMotionAndVFX(input);
          }
        }
      )
    ).data;
  }

  /**
   * 4. Legacy Script Generation
   */
  async generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationOutput> {
    const tier: ModelTier = "standard";

    return (
      await aiCacheManager.getOrExecute<ScriptGenerationOutput>(
        "script_generation",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.generateScript(input);
          }

          const prompt = `
Generate a structured video script on the topic: "${input.topic}".
Target Tone: ${input.tone || "professional"}.
Target Platform: ${input.targetPlatform || "general"}.
Scene Count: ${input.sceneCount || 3}.
Audience: ${input.audience || "General Audience"}.

Return strictly valid JSON matching this schema:
{
  "title": "string",
  "summary": "string",
  "tone": "${input.tone || "professional"}",
  "targetDuration": number,
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "string",
      "script": "Narration text for avatar speaker (20-40 words)",
      "duration": 7,
      "visualPrompt": "Photorealistic visual prompt for AI video generation",
      "motionPreset": "zoom-in | zoom-out | pan-left | pan-right | cinematic-push | slow-zoom",
      "transition": "fade | slide-left | dissolve | zoom",
      "cameraFraming": "wide-angle | medium-shot | close-up"
    }
  ]
}
`;

          try {
            const res = await withTimeout(model.generateContent(prompt), 15000);
            const text = res.response.text();
            const parsed = safeParseAndRepairJson(text, ScriptGenerationOutputSchema);
            if (!parsed.success || !parsed.data) {
              throw new Error(parsed.error || "Failed to parse ScriptGeneration schema");
            }
            return parsed.data;
          } catch (err: any) {
            console.warn("[GeminiAIProvider] generateScript failed, using fallback:", err.message);
            return this.fallbackProvider.generateScript(input);
          }
        }
      )
    ).data;
  }

  /**
   * 5. Legacy Image Analysis (Strong tier model)
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput> {
    const tier: ModelTier = "strong";

    return (
      await aiCacheManager.getOrExecute<ImageAnalysisOutput>(
        "image_analysis",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.analyzeImage(input);
          }

          const prompt = `
Perform visual segmentation and storyboard breakdown for this image URL: "${input.imageUrl}".
Context: "${input.context || "General Image"}"

Return strictly valid JSON matching this schema:
{
  "title": "Visual Analysis Title",
  "description": "Detailed visual description",
  "mainSubject": "Core focal subject",
  "visualTone": "cinematic",
  "detectedRegions": [
    {
      "id": "region-1",
      "label": "Subject 1",
      "x": 10, "y": 10, "width": 40, "height": 60,
      "suggestedScript": "Narration highlighting region 1",
      "motionPreset": "zoom-in"
    }
  ],
  "suggestedScenes": [
    {
      "sceneNumber": 1,
      "title": "Scene 1",
      "script": "Narration text",
      "duration": 7,
      "visualPrompt": "Visual prompt",
      "motionPreset": "zoom-in",
      "transition": "fade",
      "cameraFraming": "medium-shot"
    }
  ]
}
`;

          try {
            const res = await withTimeout(model.generateContent(prompt), 20000);
            const text = res.response.text();
            const parsed = safeParseAndRepairJson(text, ImageAnalysisOutputSchema);
            if (!parsed.success || !parsed.data) {
              throw new Error(parsed.error || "Failed to parse ImageAnalysis schema");
            }
            return parsed.data;
          } catch (err: any) {
            console.warn("[GeminiAIProvider] analyzeImage failed, using fallback:", err.message);
            return this.fallbackProvider.analyzeImage(input);
          }
        }
      )
    ).data;
  }

  /**
   * 6. Legacy Document Analysis (Strong tier model)
   */
  async analyzeDocument(input: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
    const tier: ModelTier = "strong";

    return (
      await aiCacheManager.getOrExecute<DocumentAnalysisOutput>(
        "document_analysis",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.analyzeDocument(input);
          }

          const prompt = `
Analyze and extract structured slides from this presentation text:
"${input.documentText.slice(0, 3000)}"

Return strictly valid JSON matching this schema:
{
  "documentTitle": "Presentation Title",
  "summary": "Brief executive summary",
  "keyTakeaways": ["takeaway 1", "takeaway 2"],
  "slides": [
    {
      "slideNumber": 1,
      "headline": "Headline",
      "bulletPoints": ["point 1", "point 2"],
      "suggestedScript": "Narration text for slide",
      "visualSummary": "Visual description",
      "suggestedMotion": "zoom-in",
      "duration": 7
    }
  ]
}
`;

          try {
            const res = await withTimeout(model.generateContent(prompt), 20000);
            const text = res.response.text();
            const parsed = safeParseAndRepairJson(text, DocumentAnalysisOutputSchema);
            if (!parsed.success || !parsed.data) {
              throw new Error(parsed.error || "Failed to parse DocumentAnalysis schema");
            }
            return parsed.data;
          } catch (err: any) {
            console.warn("[GeminiAIProvider] analyzeDocument failed, using fallback:", err.message);
            return this.fallbackProvider.analyzeDocument(input);
          }
        }
      )
    ).data;
  }

  /**
   * 7. Legacy Scene Generation
   */
  async generateScenes(input: SceneGenerationInput): Promise<SceneGenerationOutput> {
    const tier: ModelTier = "standard";

    return (
      await aiCacheManager.getOrExecute<SceneGenerationOutput>(
        "scene_segmentation",
        input,
        tier,
        async () => {
          const model = this.getGenerativeModel(tier);
          if (!model) {
            return this.fallbackProvider.generateScenes(input);
          }

          const prompt = `
Generate structured video scenes for prompt: "${input.prompt}".
Scene count: ${input.sceneCount || 3}.

Return strictly valid JSON matching this schema:
{
  "title": "Storyboard for ${input.prompt}",
  "totalDuration": 21,
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Scene Title",
      "script": "Narration text (20-35 words)",
      "duration": 7,
      "visualPrompt": "Cinematic visual description",
      "motionPreset": "zoom-in",
      "transition": "fade",
      "cameraFraming": "medium-shot"
    }
  ]
}
`;

          try {
            const res = await withTimeout(model.generateContent(prompt), 15000);
            const text = res.response.text();
            const parsed = safeParseAndRepairJson(text, SceneGenerationOutputSchema);
            if (!parsed.success || !parsed.data) {
              throw new Error(parsed.error || "Failed to parse SceneGeneration schema");
            }
            return parsed.data;
          } catch (err: any) {
            console.warn("[GeminiAIProvider] generateScenes failed, using fallback:", err.message);
            return this.fallbackProvider.generateScenes(input);
          }
        }
      )
    ).data;
  }
}
