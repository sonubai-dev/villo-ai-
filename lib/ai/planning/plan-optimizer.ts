/**
 * Plan Optimizer & Delta Updater for Low-Cost Hybrid Execution
 * Enforces the core rule:
 * "If only text color, caption style, camera motion, or VFX parameters change:
 *  DO NOT call AI. Update the plan locally with zero token cost."
 */

import { VideoPlan, ScenePlan, CameraPlan, CaptionPlan, MotionPlan, VFXPlan } from "./types";

export interface DeterministicDelta {
  sceneNumber: number;
  camera?: Partial<CameraPlan>;
  motion?: Partial<MotionPlan>;
  caption?: Partial<CaptionPlan>;
  vfx?: VFXPlan[];
  suggestedVisualType?: "image" | "video" | "gradient" | "solid";
  transition?: any;
}

export class PlanOptimizer {
  private static instance: PlanOptimizer;

  public static getInstance(): PlanOptimizer {
    if (!PlanOptimizer.instance) {
      PlanOptimizer.instance = new PlanOptimizer();
    }
    return PlanOptimizer.instance;
  }

  /**
   * Determines if a change between two scene configurations is purely deterministic
   * (meaning no script, duration, or core content was altered).
   */
  public isPurelyDeterministicChange(
    originalScene: ScenePlan,
    updatedProperties: Partial<ScenePlan>
  ): boolean {
    // If script text changed, it requires AI re-planning/timing
    if (updatedProperties.script && updatedProperties.script.trim() !== originalScene.script.trim()) {
      return false;
    }

    // If duration changed by more than 20%, it might require script pacing adjustment
    if (
      updatedProperties.duration !== undefined &&
      Math.abs(updatedProperties.duration - originalScene.duration) > 2
    ) {
      return false;
    }

    // All other property updates (camera, caption styling, motion preset, VFX intensity)
    // are 100% deterministic and do NOT require calling an LLM
    return true;
  }

  /**
   * Applies deterministic styling, motion, and VFX updates directly to a VideoPlan
   * without incurring any LLM token usage or latency.
   */
  public applyDeterministicDelta(
    basePlan: VideoPlan,
    delta: DeterministicDelta
  ): { plan: VideoPlan; aiCalled: false; tokensUsed: 0 } {
    const updatedScenes = basePlan.scenes.map((scene) => {
      if (scene.sceneNumber !== delta.sceneNumber) {
        return scene;
      }

      return {
        ...scene,
        camera: delta.camera ? { ...scene.camera, ...delta.camera } : scene.camera,
        motion: delta.motion ? { ...scene.motion, ...delta.motion } : scene.motion,
        caption: delta.caption ? { ...scene.caption, ...delta.caption } : scene.caption,
        vfx: delta.vfx ?? scene.vfx,
        suggestedVisualType: delta.suggestedVisualType ?? scene.suggestedVisualType,
        transition: delta.transition ?? scene.transition,
      };
    });

    const updatedPlan: VideoPlan = {
      ...basePlan,
      scenes: updatedScenes,
      metadata: {
        ...basePlan.metadata,
        cached: true,
        tokenCost: 0,
        latencyMs: 0,
        generatedAt: new Date().toISOString(),
      },
    };

    return {
      plan: updatedPlan,
      aiCalled: false,
      tokensUsed: 0,
    };
  }

  /**
   * Updates only a single scene in a multi-scene VideoPlan,
   * avoiding full regeneration of unaffected scenes.
   */
  public replaceSceneInPlan(basePlan: VideoPlan, newScenePlan: ScenePlan): VideoPlan {
    const updatedScenes = basePlan.scenes.map((scene) =>
      scene.sceneNumber === newScenePlan.sceneNumber ? newScenePlan : scene
    );

    const totalDuration = updatedScenes.reduce((sum, s) => sum + s.duration, 0);

    return {
      ...basePlan,
      targetDuration: totalDuration,
      scenes: updatedScenes,
      metadata: {
        ...basePlan.metadata,
        generatedAt: new Date().toISOString(),
      },
    };
  }
}

export const planOptimizer = PlanOptimizer.getInstance();
