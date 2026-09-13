/**
 * AI Avatar + Motion Video Types & Presets
 */

import { AspectRatio } from "@/lib/types";

export type AvatarMotionPresetId =
  | "natural-talking"
  | "subtle-head-movement"
  | "hand-gestures"
  | "zoom-in"
  | "zoom-out"
  | "cinematic"
  | "dynamic"
  | "professional-presenter";

export interface AvatarMotionPreset {
  id: AvatarMotionPresetId;
  name: string;
  description: string;
  tag: string;
  iconName: string;
}

export type BackgroundType = "transparent" | "solid" | "gradient" | "image" | "video";

export interface BackgroundConfig {
  type: BackgroundType;
  value: string; // Color hex, gradient CSS, or image/video URL
  label: string;
}

export type VideoDurationOption = 10 | 15 | 20;

export interface ClonedVoice {
  id: string;
  name: string;
  description: string;
  accent: string;
  language: string;
  createdDate: string;
  previewAudio: string;
}

export const AVATAR_MOTION_PRESETS: AvatarMotionPreset[] = [
  {
    id: "natural-talking",
    name: "Natural Talking",
    description: "Relaxed, natural upper-body movement and cadence",
    tag: "Everyday",
    iconName: "Smile",
  },
  {
    id: "subtle-head-movement",
    name: "Subtle Head Movement",
    description: "Gentle head tilts, nodding, and eye contact",
    tag: "Subtle",
    iconName: "Activity",
  },
  {
    id: "hand-gestures",
    name: "Hand Gestures",
    description: "Expressive hand emphasizing key takeaways and metrics",
    tag: "Engaging",
    iconName: "Hand",
  },
  {
    id: "zoom-in",
    name: "Zoom In",
    description: "Smooth camera dolly-in toward the presenter",
    tag: "Focus",
    iconName: "ZoomIn",
  },
  {
    id: "zoom-out",
    name: "Zoom Out",
    description: "Expansive camera pull back revealing full studio staging",
    tag: "Reveal",
    iconName: "ZoomOut",
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Dramatic lighting adjustments and sweeping camera arc",
    tag: "Premium",
    iconName: "Film",
  },
  {
    id: "dynamic",
    name: "Dynamic",
    description: "High-energy pacing with rhythmic posture shifts",
    tag: "Social",
    iconName: "Zap",
  },
  {
    id: "professional-presenter",
    name: "Professional Presenter",
    description: "Polished corporate delivery suited for keynotes and updates",
    tag: "Enterprise",
    iconName: "Briefcase",
  },
];

export const BACKGROUND_PRESETS: BackgroundConfig[] = [
  { type: "transparent", value: "transparent", label: "Transparent (Alpha)" },
  { type: "solid", value: "#090d16", label: "Studio Dark" },
  { type: "solid", value: "#1e293b", label: "Slate Navy" },
  { type: "solid", value: "#0f172a", label: "Midnight Blue" },
  { type: "gradient", value: "linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)", label: "Cyber Sky" },
  { type: "gradient", value: "linear-gradient(135deg, #7c3aed 0%, #0f172a 100%)", label: "Violet Nebula" },
  { type: "gradient", value: "linear-gradient(135deg, #059669 0%, #022c22 100%)", label: "Emerald Glow" },
  { type: "image", value: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80", label: "Modern Office" },
  { type: "image", value: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80", label: "Studio Loft" },
  { type: "image", value: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80", label: "Luxury Villa" },
  { type: "image", value: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80", label: "Tech Boardroom" },
  { type: "video", value: "https://assets.mixkit.co/videos/preview/mixkit-modern-city-streets-with-traffic-at-night-42475-large.mp4", label: "City Night Lights" },
  { type: "video", value: "https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-42845-large.mp4", label: "Cyber Matrix" },
];
