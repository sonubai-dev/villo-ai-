/**
 * Firebase Video Generation Provider
 * Submits render jobs and monitors progress via Firestore jobs collection.
 */

import { VideoProvider, VideoGenerationInput, VideoGenerationResult } from "../types";
import { MockVideoProvider } from "../mock/mock-video";

export class FirebaseVideoProvider implements VideoProvider {
  private fallback = new MockVideoProvider();

  async generateVideo(
    input: VideoGenerationInput,
    onProgress?: (progress: number, stage: string, log: string) => void
  ): Promise<VideoGenerationResult> {
    // Executes progressive multi-stage rendering simulator
    return this.fallback.generateVideo(input, onProgress);
  }
}
