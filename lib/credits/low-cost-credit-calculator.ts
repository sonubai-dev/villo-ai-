/**
 * Granular Low-Cost AI Credit Calculator for Vilo AI
 * Enforces the core rule:
 * "Credits are consumed ONLY for actual un-cached paid AI operations.
 *  Motion graphics, captions, transitions, camera motion, and FFmpeg rendering are 100% FREE."
 */

import { VideoPlan } from "@/lib/ai/planning/types";

export interface AICostBreakdown {
  aiPlanningCost: number;
  voiceCost: number;
  avatarCost: number;
  lipSyncCost: number;
  motionGraphicsCost: 0;
  captionsCost: 0;
  transitionsCost: 0;
  cameraMotionCost: 0;
  renderingCost: 0;
  totalCredits: number;
  breakdown: Array<{ item: string; cost: number; cached: boolean; description: string }>;
}

export interface CachedOperationsState {
  planCached?: boolean;
  voiceCached?: boolean;
  avatarCached?: boolean;
  lipSyncCached?: boolean;
  useLocalLipSync?: boolean;
}

export class LowCostCreditCalculator {
  private static instance: LowCostCreditCalculator;

  public static getInstance(): LowCostCreditCalculator {
    if (!LowCostCreditCalculator.instance) {
      LowCostCreditCalculator.instance = new LowCostCreditCalculator();
    }
    return LowCostCreditCalculator.instance;
  }

  /**
   * Calculates granular credit cost based on requested plan and cache hits.
   */
  public calculateCost(
    plan: VideoPlan,
    cachedState: CachedOperationsState = {}
  ): AICostBreakdown {
    const duration = plan.targetDuration || 15;
    const durationMultiplier = Math.max(1, Math.ceil(duration / 15));

    // 1. AI Planning (2 credits base, 0 if cached)
    const aiPlanningCost = cachedState.planCached ? 0 : 2;

    // 2. ElevenLabs Voice (3 credits per 15s, 0 if cached)
    const voiceCost = cachedState.voiceCached ? 0 : 3 * durationMultiplier;

    // 3. Avatar Video Generation (5 credits per 15s, 0 if cached)
    const hasAvatar = plan.scenes.some((s) => s.avatar !== false);
    const avatarCost = !hasAvatar || cachedState.avatarCached ? 0 : 5 * durationMultiplier;

    // 4. Lip Sync (5 credits per 15s for remote API, 0 if cached or local GPU)
    const lipSyncCost =
      !hasAvatar || cachedState.lipSyncCached || cachedState.useLocalLipSync
        ? 0
        : 5 * durationMultiplier;

    const totalCredits = aiPlanningCost + voiceCost + avatarCost + lipSyncCost;

    const breakdown = [
      {
        item: "AI Video Storyboard Planning",
        cost: aiPlanningCost,
        cached: Boolean(cachedState.planCached),
        description: cachedState.planCached ? "Reused from AI cache (FREE)" : "Structured AI scene analysis",
      },
      {
        item: "Neural Voice Synthesis (ElevenLabs)",
        cost: voiceCost,
        cached: Boolean(cachedState.voiceCached),
        description: cachedState.voiceCached ? "Reused from audio cache (FREE)" : `Neural TTS (${duration}s)`,
      },
      {
        item: "Photorealistic AI Avatar Video",
        cost: avatarCost,
        cached: Boolean(cachedState.avatarCached),
        description: cachedState.avatarCached ? "Reused from avatar cache (FREE)" : `Avatar generation (${duration}s)`,
      },
      {
        item: "Phoneme Lip-Sync Alignment",
        cost: lipSyncCost,
        cached: Boolean(cachedState.lipSyncCached || cachedState.useLocalLipSync),
        description: cachedState.useLocalLipSync
          ? "Local GPU compute (FREE)"
          : cachedState.lipSyncCached
          ? "Reused from lip-sync cache (FREE)"
          : `Remote Lip-Sync (${duration}s)`,
      },
      {
        item: "Deterministic Motion Graphics",
        cost: 0,
        cached: false,
        description: "Internal canvas compositing (FREE)",
      },
      {
        item: "Karaoke Captions & Typography",
        cost: 0,
        cached: false,
        description: "Internal typography engine (FREE)",
      },
      {
        item: "Transitions & Visual Effects",
        cost: 0,
        cached: false,
        description: "Internal shader engine (FREE)",
      },
      {
        item: "Camera Movements (Push/Pan/Zoom)",
        cost: 0,
        cached: false,
        description: "Internal 3D transform matrix (FREE)",
      },
      {
        item: "FFmpeg Hardware Video Encoding",
        cost: 0,
        cached: false,
        description: "Internal rendering worker (FREE)",
      },
    ];

    return {
      aiPlanningCost,
      voiceCost,
      avatarCost,
      lipSyncCost,
      motionGraphicsCost: 0,
      captionsCost: 0,
      transitionsCost: 0,
      cameraMotionCost: 0,
      renderingCost: 0,
      totalCredits,
      breakdown,
    };
  }
}

export const lowCostCreditCalculator = LowCostCreditCalculator.getInstance();
