import { Project, Scene, Avatar, Voice, MotionPreset, TransitionType } from "@/lib/types";

export interface ScriptInput {
  prompt: string;
  tone?: "Professional" | "Enthusiastic" | "Warm" | "Authoritative" | "Conversational" | "Calm";
  duration?: number; // 15, 30, 60 seconds
  language?: string;
  industry?: string;
  numberOfScenes?: number;
}

export interface GeneratedSceneData {
  sceneNumber: number;
  duration: number;
  script: string;
  visualPrompt: string;
  suggestedImage: string;
  cameraEffect: MotionPreset;
  transition: TransitionType;
}

export interface ScriptResult {
  title: string;
  summary?: string;
  scenes: GeneratedSceneData[];
  estimatedTotalDuration?: number;
  duration?: number;
}

export interface ScriptProvider {
  generateScript(input: ScriptInput): Promise<ScriptResult>;
}

export interface AvatarGenerationInput {
  avatarId: string;
  script: string;
  voiceId: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  backgroundUrl?: string;
}

export interface AvatarResult {
  avatarId: string;
  previewUrl: string;
  talkingAnimationUrl: string;
  duration: number;
}

export interface AvatarProvider {
  getAvatars(): Promise<Avatar[]>;
  getAvatarById(id: string): Promise<Avatar | null>;
  generateAvatarPreview(input: AvatarGenerationInput): Promise<AvatarResult>;
}

export interface VoiceInput {
  voiceId: string;
  text: string;
  speed?: number;
  pitch?: number;
}

export interface AudioResult {
  audioUrl: string;
  duration: number;
  wordsTimings?: { word: string; start: number; end: number }[];
}

export interface VoiceProvider {
  getVoices(): Promise<Voice[]>;
  getVoiceById(id: string): Promise<Voice | null>;
  generateSpeech(input: VoiceInput): Promise<AudioResult>;
}

export interface VideoGenerationInput {
  project: Project;
  resolution?: "720p" | "1080p" | "4k";
  format?: "mp4" | "webm";
}

export interface VideoGenerationResult {
  jobId: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  fileSizeBytes: number;
  format: "mp4" | "webm";
}

export interface VideoProvider {
  generateVideo(
    input: VideoGenerationInput,
    onProgress?: (progress: number, stage: string, log: string) => void
  ): Promise<VideoGenerationResult>;
}
