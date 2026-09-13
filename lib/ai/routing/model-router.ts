/**
 * AI Model Router for Low-Cost Hybrid Execution
 * Dynamically routes AI tasks to the cheapest capable model tier.
 *
 * Tiers:
 * 1. CHEAP (gemini-1.5-flash-8b / flash-lite) -> Script rewrites, tone tweaks, motion/VFX suggestions
 * 2. STANDARD (gemini-1.5-flash) -> Scene segmentation, full video planning, script generation
 * 3. STRONG (gemini-1.5-pro) -> Multimodal visual understanding, document & slide extraction
 */

export type ModelTier = "cheap" | "standard" | "strong";

export type AITaskType =
  | "script_rewrite"
  | "caption_generation"
  | "motion_vfx_recommendation"
  | "scene_segmentation"
  | "video_planning"
  | "script_generation"
  | "image_analysis"
  | "document_analysis";

export interface ModelRouteConfig {
  tier: ModelTier;
  modelName: string;
  maxTokens: number;
  temperature: number;
  costPer1kTokensUsd: number;
  description: string;
}

export const MODEL_TIER_SPECS: Record<ModelTier, ModelRouteConfig> = {
  cheap: {
    tier: "cheap",
    modelName: "gemini-1.5-flash-8b",
    maxTokens: 512,
    temperature: 0.3,
    costPer1kTokensUsd: 0.0000375, // $0.0375 per 1M tokens
    description: "Ultra-fast, lowest-cost tier for deterministic rewrites and styling recommendations.",
  },
  standard: {
    tier: "standard",
    modelName: "gemini-1.5-flash",
    maxTokens: 1280,
    temperature: 0.5,
    costPer1kTokensUsd: 0.000075, // $0.075 per 1M tokens
    description: "Balanced reasoning tier for scene planning and structured script segmentation.",
  },
  strong: {
    tier: "strong",
    modelName: "gemini-1.5-pro",
    maxTokens: 2048,
    temperature: 0.4,
    costPer1kTokensUsd: 0.00125, // $1.25 per 1M tokens
    description: "High-intelligence tier for complex multimodal image understanding and slide extraction.",
  },
};

export class AIModelRouter {
  private static instance: AIModelRouter;

  public static getInstance(): AIModelRouter {
    if (!AIModelRouter.instance) {
      AIModelRouter.instance = new AIModelRouter();
    }
    return AIModelRouter.instance;
  }

  /**
   * Determine the optimal model route based on task complexity.
   */
  public routeTask(taskType: AITaskType, complexityOverride?: ModelTier): ModelRouteConfig {
    if (complexityOverride) {
      return MODEL_TIER_SPECS[complexityOverride];
    }

    switch (taskType) {
      case "script_rewrite":
      case "caption_generation":
      case "motion_vfx_recommendation":
        return MODEL_TIER_SPECS.cheap;

      case "scene_segmentation":
      case "video_planning":
      case "script_generation":
        return MODEL_TIER_SPECS.standard;

      case "image_analysis":
      case "document_analysis":
        return MODEL_TIER_SPECS.strong;

      default:
        return MODEL_TIER_SPECS.standard;
    }
  }

  /**
   * Estimate unit cost for an AI operation.
   */
  public estimateCost(tier: ModelTier, estimatedTotalTokens: number): number {
    const spec = MODEL_TIER_SPECS[tier];
    return (estimatedTotalTokens / 1000) * spec.costPer1kTokensUsd;
  }
}

export const aiModelRouter = AIModelRouter.getInstance();
