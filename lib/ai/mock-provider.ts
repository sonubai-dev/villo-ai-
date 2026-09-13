/**
 * Mock AI Provider for Low-Cost Hybrid Video Engine
 * Fast, deterministic, zero-cost AI provider adhering strictly to Zod schemas.
 */

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
  ScriptScenePlan,
  VideoPlan,
  ScenePlan,
  VideoPlanningInput,
  ScriptRewriteInput,
  ScriptRewriteOutput,
  MotionVFXRecommendationInput,
  MotionVFXRecommendationOutput,
} from "./types";
import { MotionPreset, TransitionType } from "@/lib/types";
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

export class MockAIProvider implements AIProvider {
  public name = "MockAIProvider";

  /**
   * 1. Plan Full Video (Returns structured VideoPlan JSON)
   */
  async planVideo(input: VideoPlanningInput): Promise<VideoPlan> {
    const topic = input.topic || "AI Video Creation";
    const tone = input.tone || "professional";
    const totalDuration = input.targetDurationSeconds || 15;
    const sceneCount = input.sceneCount || (totalDuration <= 10 ? 2 : totalDuration <= 20 ? 3 : 4);
    const durationPerScene = Math.round(totalDuration / sceneCount);

    const scenes: ScenePlan[] = [];

    for (let i = 1; i <= sceneCount; i++) {
      const isFirst = i === 1;
      const isLast = i === sceneCount;

      scenes.push({
        sceneNumber: i,
        title: isFirst ? "Hook & Introduction" : isLast ? "Summary & Call to Action" : `Key Insights Part ${i}`,
        script: isFirst
          ? `Meet the next generation of visual storytelling with ${topic}.`
          : isLast
          ? `Start creating high-impact videos with ${topic} in seconds.`
          : `Explore how ${topic} transforms content workflows and scales production.`,
        duration: durationPerScene,
        avatar: input.includeAvatar ?? true,
        motion: {
          type: isFirst ? "cameraPush" : isLast ? "zoomOut" : "subtleFloat",
          speed: 1.0,
          intensity: 60,
        },
        vfx: [
          {
            type: isFirst ? "glow" : isLast ? "lightLeak" : "particles",
            intensity: 0.35,
            blendMode: "screen",
            startTime: 0,
            duration: durationPerScene,
          },
        ],
        caption: {
          style: "highlight",
          level: "word",
          highlightColor: "#38bdf8",
          position: "bottom",
          fontSize: "medium",
        },
        camera: {
          type: isFirst ? "dynamicPush" : isLast ? "slowZoomOut" : "slowPush",
          framing: isFirst ? "wide" : "medium",
          speed: 1.0,
        },
        visualPrompt: `High-fidelity cinematic visual representation of ${topic} with studio lighting`,
        suggestedVisualType: "image",
        transition: "fade",
        keywords: [topic, isFirst ? "intro" : isLast ? "cta" : "features"],
      });
    }

    const rawPlan = {
      id: `plan-${Date.now()}`,
      title: topic.charAt(0).toUpperCase() + topic.slice(1),
      summary: `AI storyboard plan for ${topic} crafted in ${tone} tone.`,
      topic,
      tone,
      targetDuration: totalDuration,
      aspectRatio: input.aspectRatio || "9:16",
      scenes,
      globalCaptionPlan: {
        style: "highlight",
        level: "word",
        highlightColor: "#38bdf8",
        position: "bottom",
        fontSize: "medium",
      },
      metadata: {
        modelTier: "cheap" as const,
        modelName: "mock-ai-engine",
        cached: false,
        tokenCost: 0,
        latencyMs: 5,
        generatedAt: new Date().toISOString(),
      },
    };

    return VideoPlanSchema.parse(rawPlan) as VideoPlan;
  }

  /**
   * 2. Rewrite Script
   */
  async rewriteScript(input: ScriptRewriteInput): Promise<ScriptRewriteOutput> {
    const original = input.script.trim();
    let rewritten = original;

    if (input.goal === "shorten") {
      const words = original.split(/\s+/);
      rewritten = words.slice(0, Math.max(10, Math.floor(words.length * 0.7))).join(" ") + ".";
    } else if (input.goal === "expand") {
      rewritten = `${original} Experience unmatched precision, faster turnaround, and limitless creative control.`;
    } else if (input.goal === "punchy") {
      rewritten = original.replace(/\b(very|really|quite|somewhat)\s+/gi, "").toUpperCase();
    } else if (input.goal === "change_tone") {
      const tonePrefix = input.targetTone === "enthusiastic" ? "🚀 Exciting news! " : "💡 Insight: ";
      rewritten = `${tonePrefix}${original}`;
    }

    const words = rewritten.split(/\s+/).filter(Boolean);
    const duration = Math.max(4, Math.ceil(words.length / 2.5));

    const raw = {
      originalScript: original,
      rewrittenScript: rewritten,
      estimatedDuration: duration,
      wordCount: words.length,
      improvementsMade: [`Applied ${input.goal} optimization`, `Optimized pacing for ${duration}s video`],
    };

    return ScriptRewriteOutputSchema.parse(raw) as ScriptRewriteOutput;
  }

  /**
   * 3. Recommend Motion and VFX
   */
  async recommendMotionAndVFX(input: MotionVFXRecommendationInput): Promise<MotionVFXRecommendationOutput> {
    const text = input.scriptSnippet.toLowerCase();
    const isEnergetic = text.includes("!") || text.includes("fast") || text.includes("now") || input.mood === "energetic";
    const isDramatic = text.includes("secret") || text.includes("future") || input.mood === "dramatic";

    const raw = {
      recommendedCamera: {
        type: isEnergetic ? "dynamicPush" : isDramatic ? "cinematic" : "slowPush",
        framing: isEnergetic ? "closeUp" : "medium",
        speed: isEnergetic ? 1.4 : 1.0,
      },
      recommendedMotion: {
        type: isEnergetic ? "bounce" : isDramatic ? "cameraPush" : "subtleFloat",
        speed: isEnergetic ? 1.3 : 1.0,
        intensity: isEnergetic ? 80 : 50,
      },
      recommendedVFX: [
        {
          type: isEnergetic ? "speedLines" : isDramatic ? "lightLeak" : "glow",
          intensity: 0.35,
          blendMode: "screen",
          startTime: 0,
          duration: input.duration || 5,
        },
      ],
      recommendedCaption: {
        style: isEnergetic ? "pop" : "highlight",
        level: "word",
        highlightColor: isEnergetic ? "#f59e0b" : "#38bdf8",
        position: "bottom",
        fontSize: isEnergetic ? "large" : "medium",
      },
      reasoning: `Selected ${isEnergetic ? "high-energy" : isDramatic ? "cinematic" : "balanced"} motion curves matching scene pace.`,
    };

    return MotionVFXRecommendationOutputSchema.parse(raw) as MotionVFXRecommendationOutput;
  }

  /**
   * 4. Legacy Script Generation
   */
  async generateScript(input: ScriptGenerationInput): Promise<ScriptGenerationOutput> {
    const topic = input.topic || "AI Video Creation";
    const tone = input.tone || "professional";
    const sceneCount = input.sceneCount || 3;

    const scenes: ScriptScenePlan[] = [
      {
        sceneNumber: 1,
        title: "Introduction & Hook",
        script: `Welcome to our comprehensive guide on ${topic}. Discover the transformative power of visual AI storytelling.`,
        duration: 8,
        visualPrompt: `Cinematic wide-angle establishing visual of ${topic} with modern lighting`,
        motionPreset: "zoom-in" as const,
        transition: "fade" as const,
        cameraFraming: "wide-angle",
        keywords: [topic, "intro", "innovation"],
      },
      {
        sceneNumber: 2,
        title: "Key Features & Breakdown",
        script: `Here we explore the key capabilities and practical applications that make ${topic} indispensable for creators.`,
        duration: 10,
        visualPrompt: `High-resolution detailed focus on key mechanics and modern workflows for ${topic}`,
        motionPreset: "pan-right" as const,
        transition: "slide-left" as const,
        cameraFraming: "medium-close-up",
        keywords: ["details", "features", "workflow"],
      },
      {
        sceneNumber: 3,
        title: "Conclusion & Call to Action",
        script: `Get started with ${topic} today to accelerate your video production workflow and captivate your audience.`,
        duration: 8,
        visualPrompt: `Inspiring closing visual with sleek branding aesthetic highlighting ${topic}`,
        motionPreset: "cinematic-push" as const,
        transition: "dissolve" as const,
        cameraFraming: "medium-shot",
        keywords: ["conclusion", "action", "cta"],
      },
    ].slice(0, sceneCount);

    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

    const rawOutput = {
      title: `${topic} - Complete Explainer`,
      summary: `A structured ${sceneCount}-scene video script covering ${topic} tailored for a ${tone} audience.`,
      tone,
      targetDuration: totalDuration,
      scenes,
    };

    return ScriptGenerationOutputSchema.parse(rawOutput);
  }

  /**
   * 5. Legacy Image Analysis
   */
  async analyzeImage(input: ImageAnalysisInput): Promise<ImageAnalysisOutput> {
    const rawOutput = {
      title: "Panoramic Visual Breakdown",
      description: "A high-resolution image with distinct visual focal points suitable for cinematic camera panning and scene extraction.",
      mainSubject: "Modern Architecture & Workspace",
      visualTone: "cinematic",
      detectedRegions: [
        {
          id: "region-1",
          label: "Primary Subject",
          x: 10,
          y: 15,
          width: 40,
          height: 70,
          suggestedScript: "Let's focus on the primary subject, showcasing architectural elegance and detail.",
          motionPreset: "zoom-in" as const,
        },
        {
          id: "region-2",
          label: "Supporting Context",
          x: 55,
          y: 20,
          width: 35,
          height: 60,
          suggestedScript: "Panning across to the secondary element, illustrating depth and ambient environment.",
          motionPreset: "pan-right" as const,
        },
      ],
      suggestedScenes: [
        {
          sceneNumber: 1,
          title: "Focal Zone 1",
          script: "Let's focus on the primary subject, showcasing architectural elegance and detail.",
          duration: 7,
          visualPrompt: "Close-up cinematic framing of architectural features",
          motionPreset: "zoom-in" as const,
          transition: "fade" as const,
          cameraFraming: "close-up",
          keywords: ["focus", "architecture"],
        },
        {
          sceneNumber: 2,
          title: "Focal Zone 2",
          script: "Panning across to the secondary element, illustrating depth and ambient environment.",
          duration: 8,
          visualPrompt: "Smooth horizontal pan revealing environmental context",
          motionPreset: "pan-right" as const,
          transition: "slide-left" as const,
          cameraFraming: "wide-angle",
          keywords: ["depth", "environment"],
        },
      ],
    };

    return ImageAnalysisOutputSchema.parse(rawOutput);
  }

  /**
   * 6. Legacy Document Analysis
   */
  async analyzeDocument(input: DocumentAnalysisInput): Promise<DocumentAnalysisOutput> {
    const rawOutput = {
      documentTitle: "Executive Strategic Overview",
      summary: "Comprehensive breakdown of key strategic milestones, market opportunities, and delivery roadmap.",
      keyTakeaways: [
        "Accelerate time-to-market with AI automation",
        "Maintain deterministic visual fidelity across rendering pipelines",
        "Scale multi-platform content creation effortlessly",
      ],
      slides: [
        {
          slideNumber: 1,
          headline: "Executive Summary",
          bulletPoints: ["Market Opportunity", "Strategic Vision", "Key Differentiators"],
          suggestedScript: "Welcome to our strategic briefing. Today we outline our core growth pillars and vision.",
          visualSummary: "Clean minimalist slide with header and three key pillars",
          suggestedMotion: "zoom-in" as const,
          duration: 7,
        },
        {
          slideNumber: 2,
          headline: "Core Architecture & Capabilities",
          bulletPoints: ["Unified AI Layer", "Deterministic Video Engine", "Real-time Feedback"],
          suggestedScript: "Our architecture combines AI planning intelligence with a high-performance rendering engine.",
          visualSummary: "Architecture diagram showing decoupled AI planning and rendering execution",
          suggestedMotion: "pan-right" as const,
          duration: 9,
        },
        {
          slideNumber: 3,
          headline: "Roadmap & Next Steps",
          bulletPoints: ["Phase 1: Rollout", "Phase 2: Scale", "Phase 3: Ecosystem"],
          suggestedScript: "Here is our execution roadmap designed for rapid iteration and sustainable scale.",
          visualSummary: "Timeline milestone progression from launch to global scale",
          suggestedMotion: "cinematic-push" as const,
          duration: 8,
        },
      ],
    };

    return DocumentAnalysisOutputSchema.parse(rawOutput);
  }

  /**
   * 7. Legacy Scene Generation
   */
  async generateScenes(input: SceneGenerationInput): Promise<SceneGenerationOutput> {
    const prompt = input.prompt || "Video Scenes";
    const sceneCount = input.sceneCount || 3;

    const scenes: ScriptScenePlan[] = Array.from({ length: sceneCount }, (_, idx) => ({
      sceneNumber: idx + 1,
      title: `Scene ${idx + 1}: ${prompt.slice(0, 24)}`,
      script: `This scene illustrates key aspect ${idx + 1} of ${prompt}, delivering clear visual engagement.`,
      duration: 6,
      visualPrompt: `Cinematic frame visualizing aspect ${idx + 1} of ${prompt}`,
      motionPreset: (idx % 2 === 0 ? "zoom-in" : "pan-right") as MotionPreset,
      transition: "fade" as TransitionType,
      cameraFraming: "medium-shot",
      keywords: ["scene", `aspect-${idx + 1}`],
    }));

    const rawOutput = {
      title: `Storyboard for: ${prompt}`,
      totalDuration: scenes.reduce((s, c) => s + c.duration, 0),
      scenes,
    };

    return SceneGenerationOutputSchema.parse(rawOutput);
  }
}
