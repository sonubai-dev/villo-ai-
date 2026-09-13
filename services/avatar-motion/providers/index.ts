/**
 * Provider Export & Registry
 */

import { IVoiceProvider, IAvatarProvider, IMotionProvider, IVideoProvider } from "./types";
import { MockVoiceProvider } from "./mock-voice-provider";
import { MockAvatarProvider } from "./mock-avatar-provider";
import { MockMotionProvider } from "./mock-motion-provider";
import { MockVideoProvider } from "./mock-video-provider";

export * from "./types";
export * from "./mock-voice-provider";
export * from "./mock-avatar-provider";
export * from "./mock-motion-provider";
export * from "./mock-video-provider";

export class AvatarMotionProviderRegistry {
  public static voiceProvider: IVoiceProvider = new MockVoiceProvider();
  public static avatarProvider: IAvatarProvider = new MockAvatarProvider();
  public static motionProvider: IMotionProvider = new MockMotionProvider();
  public static videoProvider: IVideoProvider = new MockVideoProvider();

  public static setVoiceProvider(provider: IVoiceProvider) {
    this.voiceProvider = provider;
  }

  public static setAvatarProvider(provider: IAvatarProvider) {
    this.avatarProvider = provider;
  }

  public static setMotionProvider(provider: IMotionProvider) {
    this.motionProvider = provider;
  }

  public static setVideoProvider(provider: IVideoProvider) {
    this.videoProvider = provider;
  }
}
