/**
 * Mock Motion Provider for Avatar Motion Pipeline
 * Applies camera motion transforms and keyframe stabilization.
 */

import { IMotionProvider, MotionInput, MotionResult } from "./types";

export class MockMotionProvider implements IMotionProvider {
  public name = "MockMotionProvider (Camera Transform Engine)";

  async applyMotion(input: MotionInput): Promise<MotionResult> {
    // Simulate motion matrix computation latency (1s)
    await new Promise((res) => setTimeout(res, 1000));

    const matrixMap: Record<string, string> = {
      "natural-talking": "matrix3d(1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1)",
      "subtle-head-movement": "matrix3d(1,0.02,0,0, -0.02,1,0,0, 0,0,1,0, 0,-2,0,1)",
      "hand-gestures": "matrix3d(1.02,0,0,0, 0,1.02,0,0, 0,0,1,0, 0,-4,0,1)",
      "zoom-in": "matrix3d(1.15,0,0,0, 0,1.15,0,0, 0,0,1,0, 0,0,0,1)",
      "zoom-out": "matrix3d(0.92,0,0,0, 0,0.92,0,0, 0,0,1,0, 0,0,0,1)",
      "cinematic": "matrix3d(1.08,0.01,0,0, -0.01,1.08,0,0, 0,0,1,0, 4,-2,0,1)",
      "dynamic": "matrix3d(1.05,-0.02,0,0, 0.02,1.05,0,0, 0,0,1,0, -3,-5,0,1)",
      "professional-presenter": "matrix3d(1.02,0,0,0, 0,1.02,0,0, 0,0,1,0, 0,-1,0,1)",
    };

    return {
      motionVideoUrl: input.videoUrl,
      transformMatrix: matrixMap[input.motionPreset] || matrixMap["natural-talking"],
    };
  }
}
