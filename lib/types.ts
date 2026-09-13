export type AspectRatio = "16:9" | "9:16" | "1:1" | "4:5";

export type ProjectStatus = "draft" | "processing" | "completed" | "failed";

export type CreationType = 
  | "avatar"
  | "image-video"
  | "presentation"
  | "image-splitter"
  | "script";

export type AvatarLayout = 
  | "circle-bottom-right"
  | "circle-bottom-left"
  | "side-by-side-left"
  | "side-by-side-right"
  | "fullscreen-presenter"
  | "floating-card";

export type MotionPreset = 
  | "none"
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down"
  | "slow-zoom"
  | "cinematic-push"
  | "cinematic-pull";

// Backwards-compatible CameraEffect alias for MotionPreset
export type CameraEffect = MotionPreset;

export type TransitionType = 
  | "none"
  | "fade"
  | "dissolve"
  | "zoom"
  | "slide-left"
  | "slide-right"
  | "wipe-left"
  | "wipe-right"
  | "glitch"
  | "blur"
  | "cut";

export type CaptionStyle = 
  | "clean"
  | "bold"
  | "creator"
  | "minimal"
  | "business";

export type CaptionPosition = "bottom" | "center" | "top";

export interface User {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar: string;
  photoURL?: string;
  credits: number;
  tier: "free" | "creator" | "pro" | "business" | "enterprise";
  plan?: "free" | "creator" | "pro" | "business" | "enterprise";
  createdAt?: string;
  updatedAt?: string;
  onboardingCompleted?: boolean;
}

export interface Avatar {
  id: string;
  name: string;
  gender: "male" | "female" | "non-binary";
  category: "Business" | "Creator" | "Teacher" | "Real Estate" | "Casual" | "Presenter" | "Professional";
  role: string;
  accent: string;
  previewImage: string;
  previewVideo?: string;
  defaultVoiceId: string;
  tags: string[];
}

export interface Voice {
  id: string;
  name: string;
  gender: "male" | "female";
  language: string;
  accent: string;
  tone: "Professional" | "Enthusiastic" | "Warm" | "Authoritative" | "Conversational" | "Calm";
  previewAudio?: string;
  speechSynthesisVoice?: string;
  pitch: number;
  rate: number;
}

export interface CaptionSettings {
  enabled: boolean;
  style: CaptionStyle;
  position: CaptionPosition;
  fontSize: "small" | "medium" | "large";
  highlightColor: string;
  textColor: string;
  backgroundColor?: string;
}

export interface TextOverlay {
  content: string;
  fontFamily?: string;
  fontSize?: "small" | "medium" | "large" | "hero";
  textColor?: string;
  backgroundColor?: string;
  position?: "top" | "center" | "bottom" | "left" | "right";
  animation?: "none" | "fade" | "slide-up" | "typewriter" | "pop" | "bounce";
}

export interface ImageCropBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface Scene {
  id: string;
  projectId: string;
  order: number;
  title?: string;
  script: string;
  image: string;
  imageFit?: "cover" | "contain";
  cropBox?: ImageCropBox;
  prompt?: string;
  negativePrompt?: string;
  cameraPrompt?: string;
  stylePreset?: string;
  motionPreset: MotionPreset;
  cameraEffect: CameraEffect; // Syncs with motionPreset
  motionSpeed?: number; // 0.5 to 2.0 (default: 1.0)
  motionStrength?: number; // 0 to 100 (default: 75)
  zoom?: number; // 1.0 to 3.0 (default: 1.0)
  panX?: number; // -100 to 100 (default: 0)
  panY?: number; // -100 to 100 (default: 0)
  rotation?: number; // -45 to 45 (default: 0)
  avatarId: string;
  avatarLayout: AvatarLayout;
  showAvatar: boolean;
  voiceId: string;
  duration: number; // in seconds
  transition: TransitionType;
  transitionDuration?: number; // in seconds
  captions?: CaptionSettings;
  textOverlay?: TextOverlay;
  overlayText?: string;
  backgroundMusic?: string;
  backgroundMusicTitle?: string;
  backgroundMusicVolume?: number; // 0.0 to 1.0
  voiceVolume?: number; // 0.0 to 1.0
}

export type SourceType = "script" | "pdf" | "manual" | "template";

export interface ProjectSourceFile {
  name: string;
  size?: number;
  url?: string;
  pageCount?: number;
}

export interface ProjectPresenterMeta {
  id: string;
  name: string;
  previewUrl: string;
  category?: string;
  role?: string;
}

export interface ProjectVoiceMeta {
  id: string;
  name: string;
  language: string;
  gender: string;
  tone?: string;
  previewAudioUrl?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  type: CreationType;
  sourceType?: SourceType;
  sourceFile?: ProjectSourceFile;
  script?: string;
  avatar?: ProjectPresenterMeta;
  voice?: ProjectVoiceMeta;
  status: ProjectStatus;
  thumbnail: string;
  duration: number; // total in seconds
  aspectRatio: AspectRatio;
  scenes: Scene[];
  globalCaptions: CaptionSettings;
  brandKitId?: string;
  createdAt: string;
  updatedAt: string;
  exportVideoUrl?: string;
  exportOptions?: ExportOptions;
}

export type VideoProject = Project;
export type VideoScene = Scene;
export type CaptionConfig = CaptionSettings;

export interface Template {
  id: string;
  title: string;
  category: "Real Estate" | "Product" | "Education" | "Instagram" | "YouTube" | "Business" | "Advertisement";
  duration: number;
  aspectRatio: AspectRatio;
  thumbnail: string;
  description: string;
  scenes: Omit<Scene, "id" | "projectId">[];
}

export interface GenerationProgress {
  stage: "analyzing" | "scenes" | "avatar" | "voice" | "rendering" | "completed" | "failed";
  progress: number; // 0 - 100
  currentStepIndex: number;
  stepMessage: string;
  logs: string[];
}

export interface ExportOptions {
  resolution: "720p" | "1080p" | "4k";
  framerate: "24fps" | "30fps" | "60fps";
  format: "mp4" | "mov" | "gif" | "webm";
  quality: "standard" | "high" | "ultra";
  includeWatermark: boolean;
}
