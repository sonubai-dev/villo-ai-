"use client";

import React, { useState, useEffect } from "react";
import { 
  FileText, 
  UserSquare2, 
  Move, 
  Type, 
  Play, 
  Pause, 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Layers,
  Palette,
  Volume2,
  Sliders,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Clock,
  Shuffle,
  Music,
  Upload,
  FolderOpen,
  Camera
} from "lucide-react";
import { 
  Scene, 
  AvatarLayout, 
  MotionPreset, 
  TransitionType, 
  CaptionStyle, 
  CaptionPosition,
  TextOverlay
} from "@/lib/types";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";
import { MOCK_VOICES } from "@/lib/providers/mock/mock-voice";
import { SpeechEngine } from "@/lib/speech-engine";
import { STYLE_PRESETS, MOTION_PRESET_METADATA } from "@/lib/mock-media";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const MediaPickerModal = dynamic(
  () => import("./media-picker-modal").then((m) => m.MediaPickerModal),
  { ssr: false }
);

interface SceneInspectorProps {
  scene: Scene;
  onUpdateScene: (updates: Partial<Scene>) => void;
}

const MOTION_PRESETS_LIST: { id: MotionPreset; name: string; icon: any; desc: string }[] = [
  { id: "zoom-in", name: "Zoom In", icon: ZoomIn, desc: "Smooth center push" },
  { id: "zoom-out", name: "Zoom Out", icon: ZoomOut, desc: "Smooth wide pull" },
  { id: "pan-left", name: "Pan Left", icon: ArrowLeft, desc: "Horizontal left track" },
  { id: "pan-right", name: "Pan Right", icon: ArrowRight, desc: "Horizontal right track" },
  { id: "pan-up", name: "Pan Up", icon: ArrowUp, desc: "Vertical tilt upward" },
  { id: "pan-down", name: "Pan Down", icon: ArrowDown, desc: "Vertical tilt downward" },
  { id: "slow-zoom", name: "Slow Zoom", icon: Sliders, desc: "Subtle 4% documentary drift" },
  { id: "cinematic-push", name: "Cinematic Push", icon: Maximize2, desc: "Dynamic forward dolly" },
  { id: "cinematic-pull", name: "Cinematic Pull", icon: Minimize2, desc: "Dramatic reveal pull" },
  { id: "none", name: "Static Frame", icon: Camera, desc: "Locked tripod frame" },
];

const TRANSITIONS_LIST: { id: TransitionType; name: string }[] = [
  { id: "fade", name: "Cross Fade" },
  { id: "dissolve", name: "Dissolve" },
  { id: "zoom", name: "Zoom Transition" },
  { id: "slide-left", name: "Slide Left" },
  { id: "slide-right", name: "Slide Right" },
  { id: "wipe-left", name: "Wipe Left" },
  { id: "wipe-right", name: "Wipe Right" },
  { id: "glitch", name: "Cyber Glitch" },
  { id: "blur", name: "Gaussian Blur" },
  { id: "cut", name: "Hard Cut" },
];

const FONTS_LIST = [
  { id: "Inter", name: "Inter (Modern Sans)" },
  { id: "Space Grotesk", name: "Space Grotesk (Tech)" },
  { id: "Playfair Display", name: "Playfair (Luxury Serif)" },
  { id: "Montserrat", name: "Montserrat (Bold Display)" },
  { id: "Roboto Mono", name: "Roboto Mono (Code/Mono)" },
];

export function SceneInspector({ scene, onUpdateScene }: SceneInspectorProps) {
  const [activeTab, setActiveTab] = useState("image");
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [isEnhancingScript, setIsEnhancingScript] = useState(false);
  const [isGeneratingVisual, setIsGeneratingVisual] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerCategory, setMediaPickerCategory] = useState<"images" | "music" | "all">("images");

  // Local debounced state for high-frequency text inputs to prevent editor re-render lag
  const [localScript, setLocalScript] = useState(scene.script || "");
  const [localPrompt, setLocalPrompt] = useState(scene.prompt || "");

  useEffect(() => {
    setLocalScript(scene.script || "");
  }, [scene.id, scene.script]);

  useEffect(() => {
    setLocalPrompt(scene.prompt || "");
  }, [scene.id, scene.prompt]);

  useEffect(() => {
    if (localScript === scene.script) return;
    const timer = setTimeout(() => {
      onUpdateScene({ script: localScript });
    }, 250);
    return () => clearTimeout(timer);
  }, [localScript, scene.script]);

  useEffect(() => {
    if (localPrompt === scene.prompt) return;
    const timer = setTimeout(() => {
      onUpdateScene({ prompt: localPrompt });
    }, 300);
    return () => clearTimeout(timer);
  }, [localPrompt, scene.prompt]);

  const selectedVoice = MOCK_VOICES.find((v) => v.id === scene.voiceId) || MOCK_VOICES[0];
  const selectedAvatar = MOCK_AVATARS.find((a) => a.id === scene.avatarId) || MOCK_AVATARS[0];

  const handleTestSpeech = () => {
    if (isPlayingVoice) {
      SpeechEngine.getInstance().stop();
      setIsPlayingVoice(false);
      return;
    }

    setIsPlayingVoice(true);
    SpeechEngine.getInstance().speak({
      text: scene.script,
      language: selectedVoice.language,
      gender: selectedVoice.gender,
      pitch: selectedVoice.pitch,
      rate: selectedVoice.rate,
      onEnd: () => setIsPlayingVoice(false),
    });
  };

  const handleEnhanceScript = () => {
    setIsEnhancingScript(true);
    setTimeout(() => {
      onUpdateScene({
        script: `${scene.script} Notice the seamless visual transitions, pristine cinematic detail, and dynamic presenter pacing.`,
      });
      setIsEnhancingScript(false);
    }, 450);
  };

  const handleGenerateVisualPrompt = () => {
    setIsGeneratingVisual(true);
    setTimeout(() => {
      onUpdateScene({
        prompt: `High-end 8k architectural showcase of ${scene.title || "the scene"}, dramatic volumetric lighting, cinematic depth of field, anamorphic style`,
      });
      setIsGeneratingVisual(false);
    }, 400);
  };

  const currentMotionPreset = scene.motionPreset || (scene.cameraEffect as MotionPreset) || "zoom-in";

  return (
    <div className="flex h-full w-80 sm:w-96 flex-col border-l border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="h-3.5 w-3.5 text-sky-400" />
            <span>Scene Controls</span>
          </h3>
          <p className="text-[11px] text-slate-400 truncate max-w-[210px]">
            Editing: <span className="text-slate-200 font-semibold">{scene.title || "Scene"}</span>
          </p>
        </div>

        <Badge variant="glow" className="text-[10px] font-mono capitalize">
          {currentMotionPreset.replace("-", " ")}
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Navigation Tabs covering all 10 scene control sections */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full h-9 p-0.5 mb-3 bg-slate-900 border border-slate-800">
            <TabsTrigger value="image" className="text-[10px] px-1 py-1 gap-1" title="Image & Prompt">
              <ImageIcon className="h-3 w-3" />
              <span>Image</span>
            </TabsTrigger>
            <TabsTrigger value="motion" className="text-[10px] px-1 py-1 gap-1" title="Motion & Camera">
              <Move className="h-3 w-3" />
              <span>Motion</span>
            </TabsTrigger>
            <TabsTrigger value="camera" className="text-[10px] px-1 py-1 gap-1" title="Zoom, Pan & Rotation">
              <Sliders className="h-3 w-3" />
              <span>Camera</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="text-[10px] px-1 py-1 gap-1" title="Text & Captions">
              <Type className="h-3 w-3" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="audio" className="text-[10px] px-1 py-1 gap-1" title="Audio & Script">
              <Volume2 className="h-3 w-3" />
              <span>Audio</span>
            </TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------------- */}
          {/* TAB 1: IMAGE & PROMPT CONTROLS                       */}
          {/* ---------------------------------------------------- */}
          <TabsContent value="image" className="space-y-4">
            {/* Visual Image Preview & Media Library Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Scene Background Visual</label>
                <button
                  onClick={() => {
                    setMediaPickerCategory("images");
                    setMediaPickerOpen(true);
                  }}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
                >
                  <FolderOpen className="h-3 w-3" />
                  <span>Media Library</span>
                </button>
              </div>

              <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-900 group">
                <img src={scene.image} alt={scene.title || "Scene"} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant="glow"
                    onClick={() => {
                      setMediaPickerCategory("images");
                      setMediaPickerOpen(true);
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <FolderOpen className="h-3 w-3" />
                    <span>Replace Visual</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* AI Image Generation Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">AI Visual Prompt</label>
                <button
                  onClick={handleGenerateVisualPrompt}
                  disabled={isGeneratingVisual}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>{isGeneratingVisual ? "Generating..." : "AI Generate Prompt"}</span>
                </button>
              </div>
              <Textarea
                rows={3}
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                onBlur={() => onUpdateScene({ prompt: localPrompt })}
                placeholder="Describe the image environment, lighting, composition..."
                className="text-xs leading-relaxed"
              />
            </div>

            {/* Negative Prompt */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-400">Negative Prompt</label>
              <Input
                value={scene.negativePrompt || ""}
                onChange={(e) => onUpdateScene({ negativePrompt: e.target.value })}
                placeholder="blurry, distorted, artifacts, lowres"
                className="h-8 text-xs"
              />
            </div>

            {/* Style Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Visual Style Preset</label>
              <select
                value={scene.stylePreset || "cinematic"}
                onChange={(e) => onUpdateScene({ stylePreset: e.target.value })}
                className="h-8 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {STYLE_PRESETS.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label} — {style.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* AI Upscale & Fit Options */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Image Fit</label>
                <select
                  value={scene.imageFit || "cover"}
                  onChange={(e) => onUpdateScene({ imageFit: e.target.value as "cover" | "contain" })}
                  className="h-8 w-full rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs text-slate-300"
                >
                  <option value="cover">Cover (Fill Canvas)</option>
                  <option value="contain">Contain (Full Aspect)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">AI Upscale</label>
                <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs">
                  {["1x", "2x", "4x"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      className="flex-1 py-1 rounded-lg text-slate-400 hover:text-white font-mono text-[11px] focus:bg-slate-800 focus:text-sky-400"
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ---------------------------------------------------- */}
          {/* TAB 2: MOTION PRESETS & DURATION                     */}
          {/* ---------------------------------------------------- */}
          <TabsContent value="motion" className="space-y-4">
            {/* All 9 Motion Presets Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Motion Presets ({MOTION_PRESETS_LIST.length})
                </label>
                <span className="text-[10px] text-sky-400 font-mono">Live animated</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {MOTION_PRESETS_LIST.map((motion) => {
                  const Icon = motion.icon;
                  const isSelected = currentMotionPreset === motion.id;

                  return (
                    <button
                      key={motion.id}
                      onClick={() =>
                        onUpdateScene({
                          motionPreset: motion.id,
                          cameraEffect: motion.id,
                        })
                      }
                      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/15 text-white shadow-md shadow-sky-500/10 ring-1 ring-sky-500/40"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-900 hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isSelected ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? "text-sky-300" : "text-white"}`}>
                          {motion.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{motion.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Motion Speed & Strength */}
            <div className="space-y-3 pt-2 border-t border-slate-850">
              <Slider
                label="Motion Speed Rate"
                value={scene.motionSpeed ?? 1.0}
                min={0.5}
                max={2.0}
                step={0.1}
                onChange={(val) => onUpdateScene({ motionSpeed: val })}
              />

              <Slider
                label="Camera Motion Strength (%)"
                value={scene.motionStrength ?? 75}
                min={10}
                max={100}
                step={5}
                onChange={(val) => onUpdateScene({ motionStrength: val })}
              />
            </div>

            {/* Scene Duration Slider & Stepper */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-sky-400" />
                  <span>Scene Duration</span>
                </label>
                <span className="font-mono text-xs font-bold text-sky-400">{scene.duration}s</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={scene.duration}
                onChange={(e) => onUpdateScene({ duration: Number(e.target.value) })}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-800 accent-sky-400"
              />
            </div>

            {/* Transitions Grid */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Scene Transition Out</label>
                <span className="text-[10px] text-slate-400 capitalize">{scene.transition}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {TRANSITIONS_LIST.map((tr) => (
                  <button
                    key={tr.id}
                    onClick={() => onUpdateScene({ transition: tr.id })}
                    className={`px-2.5 py-1.5 rounded-lg border text-left text-xs transition-all ${
                      scene.transition === tr.id
                        ? "border-sky-500 bg-sky-500/10 text-sky-300 font-semibold"
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {tr.name}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ---------------------------------------------------- */}
          {/* TAB 3: CAMERA CONTROLS (ZOOM, PAN, ROTATION)         */}
          {/* ---------------------------------------------------- */}
          <TabsContent value="camera" className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3 space-y-1">
              <p className="text-xs font-bold text-white">Manual Keyframe Tuning</p>
              <p className="text-[11px] text-slate-400">
                Adjust precise zoom scale, lateral pan coordinates, and rotation angle.
              </p>
            </div>

            {/* Zoom Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Zoom Scale</span>
                <span className="font-mono text-sky-400 font-bold">{(scene.zoom ?? 1.0).toFixed(2)}x</span>
              </div>
              <Slider
                value={scene.zoom ?? 1.0}
                min={1.0}
                max={3.0}
                step={0.05}
                onChange={(val) => onUpdateScene({ zoom: val })}
              />
            </div>

            {/* Pan X Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Pan X Offset</span>
                <span className="font-mono text-sky-400 font-bold">{scene.panX ?? 0}%</span>
              </div>
              <Slider
                value={scene.panX ?? 0}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onUpdateScene({ panX: val })}
              />
            </div>

            {/* Pan Y Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Pan Y Offset</span>
                <span className="font-mono text-sky-400 font-bold">{scene.panY ?? 0}%</span>
              </div>
              <Slider
                value={scene.panY ?? 0}
                min={-100}
                max={100}
                step={1}
                onChange={(val) => onUpdateScene({ panY: val })}
              />
            </div>

            {/* Rotation Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Rotation Angle</span>
                <span className="font-mono text-sky-400 font-bold">{scene.rotation ?? 0}°</span>
              </div>
              <Slider
                value={scene.rotation ?? 0}
                min={-45}
                max={45}
                step={1}
                onChange={(val) => onUpdateScene({ rotation: val })}
              />
            </div>

            {/* Reset Camera Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdateScene({ zoom: 1.0, panX: 0, panY: 0, rotation: 0 })}
              className="w-full text-xs font-semibold gap-1.5"
            >
              <RotateCw className="h-3.5 w-3.5" />
              <span>Reset Camera Transform</span>
            </Button>
          </TabsContent>

          {/* ---------------------------------------------------- */}
          {/* TAB 4: TEXT OVERLAY & CAPTIONS                       */}
          {/* ---------------------------------------------------- */}
          <TabsContent value="text" className="space-y-4">
            {/* Custom Overlay Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Custom Title / Text Banner</label>
              <Input
                value={scene.textOverlay?.content || scene.overlayText || ""}
                onChange={(e) =>
                  onUpdateScene({
                    overlayText: e.target.value,
                    textOverlay: {
                      ...(scene.textOverlay || {
                        fontSize: "medium",
                        textColor: "#ffffff",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        position: "top",
                        animation: "slide-up",
                      }),
                      content: e.target.value,
                    },
                  })
                }
                placeholder="e.g. 42 Horizon Crest Penthouse"
                className="text-xs"
              />
            </div>

            {/* Typography selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Typography Font</label>
              <select
                value={scene.textOverlay?.fontFamily || "Inter"}
                onChange={(e) =>
                  onUpdateScene({
                    textOverlay: {
                      ...(scene.textOverlay || {
                        content: scene.title || "",
                        fontSize: "medium",
                        textColor: "#ffffff",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        position: "top",
                        animation: "slide-up",
                      }),
                      fontFamily: e.target.value,
                    },
                  })
                }
                className="h-8 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200"
              >
                {FONTS_LIST.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Text Position & Animation */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Position</label>
                <select
                  value={scene.textOverlay?.position || "top"}
                  onChange={(e) =>
                    onUpdateScene({
                      textOverlay: {
                        ...(scene.textOverlay || {
                          content: scene.title || "",
                          fontSize: "medium",
                          textColor: "#ffffff",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          animation: "slide-up",
                        }),
                        position: e.target.value as any,
                      },
                    })
                  }
                  className="h-8 w-full rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs text-slate-300"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 block mb-1">Animation</label>
                <select
                  value={scene.textOverlay?.animation || "slide-up"}
                  onChange={(e) =>
                    onUpdateScene({
                      textOverlay: {
                        ...(scene.textOverlay || {
                          content: scene.title || "",
                          fontSize: "medium",
                          textColor: "#ffffff",
                          backgroundColor: "rgba(0,0,0,0.7)",
                          position: "top",
                        }),
                        animation: e.target.value as any,
                      },
                    })
                  }
                  className="h-8 w-full rounded-xl border border-slate-800 bg-slate-900 px-2 text-xs text-slate-300"
                >
                  <option value="fade">Fade In</option>
                  <option value="slide">Slide In</option>
                  <option value="zoom-in">Zoom In</option>
                  <option value="zoom-out">Zoom Out</option>
                  <option value="pop">Pop In</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {/* Karaoke Subtitles Styling */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <label className="text-xs font-semibold text-slate-300">Karaoke Subtitles Style</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(["creator", "clean", "bold", "minimal", "business"] as CaptionStyle[]).map((st) => (
                  <button
                    key={st}
                    onClick={() =>
                      onUpdateScene({
                        captions: {
                          ...(scene.captions || {
                            enabled: true,
                            position: "bottom",
                            fontSize: "medium",
                            highlightColor: "#38bdf8",
                            textColor: "#ffffff",
                          }),
                          style: st,
                        },
                      })
                    }
                    className={`py-1.5 px-2 rounded-lg border text-center text-[11px] capitalize transition-all ${
                      (scene.captions?.style || "creator") === st
                        ? "border-sky-500 bg-sky-500/10 text-sky-300 font-semibold"
                        : "border-slate-800 bg-slate-900/40 text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ---------------------------------------------------- */}
          {/* TAB 5: AUDIO, NARRATION & AVATAR                     */}
          {/* ---------------------------------------------------- */}
          <TabsContent value="audio" className="space-y-4">
            {/* Narration Script */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Narration Script</label>
                <button
                  onClick={handleEnhanceScript}
                  disabled={isEnhancingScript}
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300"
                >
                  <Wand2 className="h-3 w-3" />
                  <span>{isEnhancingScript ? "Polishing..." : "AI Enhance"}</span>
                </button>
              </div>
              <Textarea
                rows={4}
                value={localScript}
                onChange={(e) => setLocalScript(e.target.value)}
                onBlur={() => onUpdateScene({ script: localScript })}
                placeholder="Enter what the presenter will say in this scene..."
                className="text-xs leading-relaxed"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>{localScript.split(/\s+/).filter(Boolean).length} words</span>
                <span>Est: ~{Math.max(3, Math.ceil(localScript.split(" ").length / 2.5))}s</span>
              </div>
            </div>

            {/* Voice selection & audio testing */}
            <div className="space-y-2 pt-1 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">AI Voice Model</label>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleTestSpeech}
                  className="h-6 text-[11px] px-2 gap-1"
                >
                  {isPlayingVoice ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{isPlayingVoice ? "Stop" : "Test Voice"}</span>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOCK_VOICES.map((voice) => {
                  const isSelected = voice.id === scene.voiceId;
                  return (
                    <button
                      key={voice.id}
                      onClick={() => onUpdateScene({ voiceId: voice.id })}
                      className={`p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/10 text-white"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <p className="text-xs font-bold">{voice.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{voice.tone} · {voice.accent}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background Music Selector */}
            <div className="space-y-2 pt-1 border-t border-slate-850">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Music className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Background Music</span>
                </label>
                <button
                  onClick={() => {
                    setMediaPickerCategory("music");
                    setMediaPickerOpen(true);
                  }}
                  className="text-[11px] text-sky-400 hover:underline"
                >
                  Browse Tracks
                </button>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 flex items-center justify-between">
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {scene.backgroundMusicTitle || "Ambient Future Chillwave"}
                  </p>
                  <p className="text-[10px] text-slate-400">Royalty-Free Audio Stream</p>
                </div>
                <Badge variant="glow" className="text-[9px]">Active</Badge>
              </div>
              <Slider
                label="Music Volume"
                value={Math.round((scene.backgroundMusicVolume ?? 0.35) * 100)}
                min={0}
                max={100}
                step={5}
                onChange={(val) => onUpdateScene({ backgroundMusicVolume: val / 100 })}
              />
            </div>

            {/* AI Avatar Overlay Toggle */}
            <div className="space-y-2 pt-1 border-t border-slate-850">
              <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <div>
                  <p className="text-xs font-bold text-white">Show Talking Presenter</p>
                  <p className="text-[10px] text-slate-400">Syncs lip movement to speech audio</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateScene({ showAvatar: !scene.showAvatar })}
                  className={`h-5 w-9 rounded-full transition-colors relative ${scene.showAvatar ? "bg-sky-500" : "bg-slate-800"}`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      scene.showAvatar ? "translate-x-4" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {scene.showAvatar && (
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {MOCK_AVATARS.slice(0, 4).map((avatar) => {
                    const isSelected = avatar.id === scene.avatarId;
                    return (
                      <button
                        key={avatar.id}
                        onClick={() => onUpdateScene({ avatarId: avatar.id, voiceId: avatar.defaultVoiceId })}
                        className={`group relative aspect-square rounded-xl overflow-hidden border transition-all ${
                          isSelected ? "border-sky-500 ring-2 ring-sky-500/40" : "border-slate-800 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={avatar.previewImage}
                          alt={avatar.name}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] font-bold text-white text-center py-0.5 truncate">
                          {avatar.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Media Picker Modal (Loaded on demand) */}
      {mediaPickerOpen && (
        <MediaPickerModal
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          categoryFilter={mediaPickerCategory}
          onSelect={(item) => {
            if (item.category === "images" || item.category === "videos") {
              onUpdateScene({ image: item.url });
            } else if (item.category === "music") {
              onUpdateScene({
                backgroundMusic: item.url,
                backgroundMusicTitle: item.title,
              });
            }
          }}
        />
      )}
    </div>
  );
}
