/**
 * Mock Avatar Provider for Avatar Motion Pipeline
 * Ready to be swapped with HeyGen / D-ID / Synthesia provider.
 */

import { IAvatarProvider, AvatarVideoInput, AvatarVideoResult } from "./types";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";

export class MockAvatarProvider implements IAvatarProvider {
  public name = "MockAvatarProvider (HeyGen / D-ID Interface Compatible)";

  async generateAvatarVideo(input: AvatarVideoInput): Promise<AvatarVideoResult> {
    // Simulate phoneme lip-sync and presenter video generation latency (2s)
    await new Promise((res) => setTimeout(res, 2000));

    const avatar = MOCK_AVATARS.find((a) => a.id === input.avatarId) || MOCK_AVATARS[0];

    return {
      avatarVideoUrl: avatar.previewVideo || "https://assets.mixkit.co/videos/preview/mixkit-young-woman-talking-on-video-call-42880-large.mp4",
      duration: Math.max(6, Math.ceil(input.script.split(" ").length / 2.5)),
    };
  }
}
