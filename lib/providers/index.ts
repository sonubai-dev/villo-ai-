import { MockAvatarProvider, MOCK_AVATARS } from "./mock/mock-avatar";
import { MockVoiceProvider, MOCK_VOICES } from "./mock/mock-voice";
import { MockScriptProvider } from "./mock/mock-script";
import { MockVideoProvider } from "./mock/mock-video";
import { FirebaseAvatarProvider } from "./firebase/firebase-avatar";
import { FirebaseVoiceProvider } from "./firebase/firebase-voice";
import { FirebaseScriptProvider } from "./firebase/firebase-script";
import { FirebaseVideoProvider } from "./firebase/firebase-video";
import { AvatarProvider, VoiceProvider, ScriptProvider, VideoProvider } from "./types";

// Singleton instances of providers with built-in Firebase connection & mock fallback
export const avatarProvider: AvatarProvider = new FirebaseAvatarProvider();
export const voiceProvider: VoiceProvider = new FirebaseVoiceProvider();
export const scriptProvider: ScriptProvider = new FirebaseScriptProvider();
export const videoProvider: VideoProvider = new FirebaseVideoProvider();

export * from "./types";
export * from "./mock/mock-avatar";
export * from "./mock/mock-voice";
export * from "./mock/mock-script";
export * from "./mock/mock-video";
export * from "./firebase/firebase-avatar";
export * from "./firebase/firebase-voice";
export * from "./firebase/firebase-script";
export * from "./firebase/firebase-video";
export * from "./lipsync";

