"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  UserSquare2, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  Check, 
  ArrowRight, 
  Wand2, 
  Clock, 
  AlertTriangle, 
  Mic, 
  Plus, 
  Activity, 
  Smile, 
  Hand, 
  ZoomIn, 
  ZoomOut, 
  Film, 
  Zap, 
  Briefcase,
  Layers,
  Image as ImageIcon,
  Video as VideoIcon,
  Palette,
  Eye,
  Info,
  Radio,
  UploadCloud,
  CheckCircle2,
  Download,
  Edit3,
  RotateCcw,
  PlusCircle,
  Loader2,
  Share2
} from "lucide-react";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";
import { MOCK_VOICES } from "@/lib/providers/mock/mock-voice";
import { SpeechEngine } from "@/lib/speech-engine";
import { useAppStore } from "@/lib/store";
import { AspectRatio } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  AVATAR_MOTION_PRESETS, 
  BACKGROUND_PRESETS, 
  AvatarMotionPresetId, 
  BackgroundType, 
  VideoDurationOption,
  ClonedVoice
} from "@/lib/avatar-motion/types";
import { 
  avatarMotionPipelineService, 
  PipelineStage, 
  AvatarMotionPipelineResult 
} from "@/services/avatar-motion";

type StudioView = "config" | "generating" | "result";

const PIPELINE_STAGES: Array<{ id: PipelineStage; label: string; desc: string }> = [
  { id: "preparing_script", label: "Preparing script", desc: "Analyzing phonemes & duration pacing" },
  { id: "generating_voice", label: "Generating voice", desc: "Synthesizing neural speech audio" },
  { id: "animating_avatar", label: "Animating avatar", desc: "Generating lip-sync & facial keyframes" },
  { id: "applying_motion", label: "Applying motion", desc: "Calculating camera motion transform matrix" },
  { id: "rendering_video", label: "Rendering video", desc: "Compositing background, presenter & captions" },
  { id: "finalizing_video", label: "Finalizing video", desc: "Encoding 1080p MP4 container" },
];

function AvatarMotionStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAvatarId = searchParams.get("avatarId") || MOCK_AVATARS[0].id;

  const { deductCredits, user } = useAppStore();

  // Studio Flow View
  const [currentView, setCurrentView] = useState<StudioView>("config");

  // Core Configuration State
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(initialAvatarId);
  const [voiceTab, setVoiceTab] = useState<"default" | "cloned">("default");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(MOCK_VOICES[0].id);
  const [clonedVoices, setClonedVoices] = useState<ClonedVoice[]>([]);
  const [selectedClonedVoiceId, setSelectedClonedVoiceId] = useState<string | null>(null);

  const [script, setScript] = useState<string>(
    "Welcome to Vilo AI! Create short, high-converting visual videos with lifelike avatars and cinematic camera motion in seconds."
  );
  const [selectedMotion, setSelectedMotion] = useState<AvatarMotionPresetId>("natural-talking");
  const [duration, setDuration] = useState<VideoDurationOption>(15);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16");
  const [captions, setCaptions] = useState<boolean>(true);
  
  // Background State
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("gradient");
  const [selectedBackground, setSelectedBackground] = useState<string>(
    "linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)"
  );

  // Audio Playback & Helper States
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [isAiGeneratingScript, setIsAiGeneratingScript] = useState(false);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneName, setCloneName] = useState("");
  const [isCloning, setIsCloning] = useState(false);

  // Pipeline Execution State
  const [pipelineProgress, setPipelineProgress] = useState<number>(0);
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>("preparing_script");
  const [pipelineMessage, setPipelineMessage] = useState<string>("");
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [generatedResult, setGeneratedResult] = useState<AvatarMotionPipelineResult | null>(null);

  const selectedAvatar = MOCK_AVATARS.find((a) => a.id === selectedAvatarId) || MOCK_AVATARS[0];
  const selectedVoice = MOCK_VOICES.find((v) => v.id === selectedVoiceId) || MOCK_VOICES[0];
  const activeMotionObj = AVATAR_MOTION_PRESETS.find((m) => m.id === selectedMotion) || AVATAR_MOTION_PRESETS[0];
  const activeBackgroundObj = BACKGROUND_PRESETS.find((b) => b.value === selectedBackground) || {
    type: backgroundType,
    value: selectedBackground,
    label: "Custom Background",
  };

  // Duration Estimation
  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 2.5)); // ~2.5 words per second
  const isScriptTooLong = estimatedSeconds > duration;

  // Audio preview handler
  const handleTogglePreviewVoice = (voiceId: string, voiceData?: { language: string; gender: string; pitch?: number; rate?: number }) => {
    if (playingVoiceId === voiceId) {
      SpeechEngine.getInstance().stop();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voiceId);
    SpeechEngine.getInstance().speak({
      text: script.slice(0, 100) || "Hello, this is a live voice preview on Vilo AI.",
      language: voiceData?.language || "en-US",
      gender: (voiceData?.gender as any) || "female",
      pitch: voiceData?.pitch || 1.0,
      rate: voiceData?.rate || 1.0,
      onEnd: () => setPlayingVoiceId(null),
    });
  };

  // AI Script Enhancement
  const handleAiEnhanceScript = () => {
    setIsAiGeneratingScript(true);
    setTimeout(() => {
      if (duration === 10) {
        setScript("Transform your ideas into cinematic videos instantly with Vilo AI. Effortless, fast, and stunning.");
      } else if (duration === 15) {
        setScript(
          "Looking to scale your video content? Vilo AI combines photorealistic presenters, studio audio, and dynamic motion to bring your story to life."
        );
      } else {
        setScript(
          "Welcome to the next generation of visual storytelling. With Vilo AI, you can generate complete multi-scene videos with realistic avatars, smooth transitions, and studio voiceovers in minutes."
        );
      }
      setIsAiGeneratingScript(false);
    }, 400);
  };

  // Voice Clone Creation (Mock)
  const handleCreateVoiceClone = () => {
    if (!cloneName.trim()) return;
    setIsCloning(true);
    setTimeout(() => {
      const newClone: ClonedVoice = {
        id: `clone-${Date.now()}`,
        name: cloneName.trim(),
        description: "Custom Instant Voice Clone",
        accent: "Custom (Studio Sample)",
        language: "en-US",
        createdDate: "Just now",
        previewAudio: "https://actions.google.com/sounds/v1/speech/greeting_female.ogg",
      };
      setClonedVoices((prev) => [newClone, ...prev]);
      setSelectedClonedVoiceId(newClone.id);
      setIsCloning(false);
      setShowCloneModal(false);
      setCloneName("");
    }, 1200);
  };

  // Motion CSS Animation Classes for Hardware-Accelerated Live Preview
  const getMotionClass = () => {
    switch (selectedMotion) {
      case "subtle-head-movement":
        return "animate-avatar-subtle-head";
      case "hand-gestures":
        return "animate-avatar-hand-gestures";
      case "zoom-in":
        return "animate-avatar-zoom-in";
      case "zoom-out":
        return "animate-avatar-zoom-out";
      case "cinematic":
        return "animate-avatar-cinematic";
      case "dynamic":
        return "animate-avatar-dynamic";
      case "professional-presenter":
        return "animate-avatar-professional";
      case "natural-talking":
      default:
        return "animate-avatar-natural-talking";
    }
  };

  // Pipeline Execution Trigger
  const handleStartGeneration = async () => {
    if (!script.trim()) return;

    // Deduct 10 credits
    deductCredits(10);

    // Switch to generating view
    setCurrentView("generating");
    setPipelineProgress(0);
    setPipelineLogs([]);

    try {
      const result = await avatarMotionPipelineService.executePipeline(
        {
          avatarId: selectedAvatar.id,
          script,
          voiceId: voiceTab === "default" ? selectedVoice.id : selectedClonedVoiceId || selectedVoice.id,
          voiceType: voiceTab,
          motion: selectedMotion,
          duration,
          background: activeBackgroundObj,
          aspectRatio,
          captions,
        },
        (stage, progress, message, log) => {
          setPipelineStage(stage);
          setPipelineProgress(progress);
          setPipelineMessage(message);
          if (log) {
            setPipelineLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
          }
        }
      );

      setGeneratedResult(result);
      // Transition to result view
      setTimeout(() => {
        setCurrentView("result");
      }, 500);
    } catch (err: any) {
      console.error("Pipeline failed:", err);
      alert(err.message || "Failed to render video");
      setCurrentView("config");
    }
  };

  const getMotionIcon = (iconName: string) => {
    switch (iconName) {
      case "Smile": return <Smile className="h-4 w-4" />;
      case "Activity": return <Activity className="h-4 w-4" />;
      case "Hand": return <Hand className="h-4 w-4" />;
      case "ZoomIn": return <ZoomIn className="h-4 w-4" />;
      case "ZoomOut": return <ZoomOut className="h-4 w-4" />;
      case "Film": return <Film className="h-4 w-4" />;
      case "Zap": return <Zap className="h-4 w-4" />;
      case "Briefcase": return <Briefcase className="h-4 w-4" />;
      default: return <Smile className="h-4 w-4" />;
    }
  };

  const activeStageIndex = PIPELINE_STAGES.findIndex((s) => s.id === pipelineStage);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
            <UserSquare2 className="h-4 w-4" />
            <span>Create Video → AI Avatar + Motion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            AI Avatar + Motion Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Create high-converting short AI presenter videos with lifelike facial animations, camera motion transforms, and studio voices.
          </p>
        </div>

        {currentView === "config" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-slate-400">Credits:</span>
              <span className="font-bold text-sky-400 font-mono">10 Credits</span>
            </div>
            <Button
              onClick={handleStartGeneration}
              disabled={!script.trim()}
              variant="glow"
              size="md"
              className="gap-2 font-bold shadow-xl"
            >
              <Sparkles className="h-4 w-4" />
              <span>Generate Video</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: STUDIO CONFIGURATION & LIVE PREVIEW                               */}
      {/* ========================================================================= */}
      {currentView === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: CHOOSE AVATAR */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 border border-sky-400/30">
                    1
                  </span>
                  <label className="text-sm font-bold text-white">Choose AI Avatar</label>
                </div>
                <span className="text-xs text-sky-400 font-medium">
                  {selectedAvatar.name} · {selectedAvatar.category}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {MOCK_AVATARS.map((avatar) => {
                  const isSelected = avatar.id === selectedAvatarId;
                  return (
                    <button
                      key={avatar.id}
                      onClick={() => {
                        setSelectedAvatarId(avatar.id);
                        setSelectedVoiceId(avatar.defaultVoiceId);
                      }}
                      className={`group relative flex flex-col items-center overflow-hidden rounded-2xl border p-1.5 transition-all text-left ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-950 mb-1.5">
                        <img
                          src={avatar.previewImage}
                          alt={avatar.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                            <Check className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-white line-clamp-1">{avatar.name}</span>
                      <span className="text-[10px] text-slate-400 line-clamp-1">{avatar.role}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: ENTER SCRIPT */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 border border-sky-400/30">
                    2
                  </span>
                  <label className="text-sm font-bold text-white">Enter Script</label>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAiEnhanceScript}
                  disabled={isAiGeneratingScript}
                  className="h-7 text-xs text-sky-400 hover:text-sky-300 gap-1.5 p-0"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>{isAiGeneratingScript ? "Drafting..." : "Auto-Suggest Script"}</span>
                </Button>
              </div>

              <div className="relative">
                <Textarea
                  rows={3}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="What should your AI avatar say in this video?"
                  className="leading-relaxed resize-none text-xs sm:text-sm"
                />
                <span className="absolute bottom-2.5 right-3 text-[11px] font-mono text-slate-500">
                  {script.length} / 400 chars
                </span>
              </div>

              {/* Script Duration & Auto-Fit Warning */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    <span>
                      Your script is approximately <strong className="text-white font-mono">{estimatedSeconds} seconds</strong> ({wordCount} words).
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">Target: {duration}s</span>
                </div>

                {isScriptTooLong && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs animate-in fade-in duration-200">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>
                      Your script may exceed {duration} seconds. Shorten it or switch to {duration === 10 ? "15/20 seconds" : "20 seconds"}.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* STEP 3: CHOOSE VOICE */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 border border-sky-400/30">
                    3
                  </span>
                  <label className="text-sm font-bold text-white">Choose Voice</label>
                </div>

                {/* Voice Tabs */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setVoiceTab("default")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      voiceTab === "default" ? "bg-sky-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Default Voice
                  </button>
                  <button
                    onClick={() => setVoiceTab("cloned")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                      voiceTab === "cloned" ? "bg-sky-500 text-white shadow" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Cloned Voice
                  </button>
                </div>
              </div>

              {/* Default ElevenLabs-Style Voices */}
              {voiceTab === "default" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
                  {MOCK_VOICES.map((voice) => {
                    const isSelected = voice.id === selectedVoiceId;
                    const isPlaying = playingVoiceId === voice.id;

                    return (
                      <div
                        key={voice.id}
                        onClick={() => setSelectedVoiceId(voice.id)}
                        className={`flex flex-col justify-between p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-sky-500 bg-sky-500/10 shadow-sm"
                            : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-bold text-white">{voice.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {voice.gender === "female" ? "Female" : "Male"} · {voice.language} · {voice.accent.split(" ")[0]}
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-sky-400 shrink-0" />}
                        </div>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTogglePreviewVoice(voice.id, voice);
                            }}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-colors ${
                              isPlaying
                                ? "bg-sky-500 text-white border-sky-400"
                                : "bg-slate-950 border-slate-800 text-slate-300 hover:text-white"
                            }`}
                          >
                            {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                            <span>{isPlaying ? "Playing" : "Preview"}</span>
                          </button>
                          <span className="text-[10px] font-mono text-slate-500">{voice.tone}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cloned Voice Tab */}
              {voiceTab === "cloned" && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">My Cloned Voices</span>
                    <Button
                      onClick={() => setShowCloneModal(true)}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 border-slate-700 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Create Voice Clone</span>
                    </Button>
                  </div>

                  {clonedVoices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-xl border border-dashed border-slate-800 bg-slate-950/40">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
                        <Mic className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">No cloned voice yet</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Clone your own voice with a 30-second audio sample to generate personalized AI presenter videos.
                        </p>
                      </div>
                      <Button onClick={() => setShowCloneModal(true)} variant="glow" size="sm" className="gap-1.5 text-xs">
                        <Plus className="h-3.5 w-3.5" />
                        <span>Create Voice Clone</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {clonedVoices.map((clone) => {
                        const isSelected = clone.id === selectedClonedVoiceId;
                        return (
                          <div
                            key={clone.id}
                            onClick={() => setSelectedClonedVoiceId(clone.id)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected ? "border-sky-500 bg-sky-500/10" : "border-slate-800 bg-slate-950"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{clone.name}</span>
                              {isSelected && <Check className="h-4 w-4 text-sky-400" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">{clone.description} · {clone.createdDate}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* STEP 4: CHOOSE MOTION */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 border border-sky-400/30">
                    4
                  </span>
                  <label className="text-sm font-bold text-white">Choose Motion Preset</label>
                </div>
                <span className="text-xs text-sky-400 font-medium">{activeMotionObj.name}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVATAR_MOTION_PRESETS.map((motionItem) => {
                  const isSelected = motionItem.id === selectedMotion;
                  return (
                    <button
                      key={motionItem.id}
                      onClick={() => setSelectedMotion(motionItem.id)}
                      className={`flex flex-col justify-between p-3 rounded-2xl border text-left transition-all group ${
                        isSelected
                          ? "border-sky-500 bg-sky-500/10 shadow-sm ring-1 ring-sky-500/40"
                          : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className={`p-1.5 rounded-lg ${isSelected ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                          {getMotionIcon(motionItem.iconName)}
                        </div>
                        <Badge variant={isSelected ? "glow" : "secondary"} className="text-[9px] px-1.5 py-0">
                          {motionItem.tag}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">{motionItem.name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{motionItem.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 5: CHOOSE DURATION & ASPECT RATIO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Duration */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 border border-sky-400/30">
                    5
                  </span>
                  <label className="text-sm font-bold text-white">Video Duration</label>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {([10, 15, 20] as VideoDurationOption[]).map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setDuration(sec)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        duration === sec
                          ? "border-sky-500 bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/40"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      {sec} sec
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-white block">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["9:16", "16:9", "1:1"] as AspectRatio[]).map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        aspectRatio === ratio
                          ? "border-sky-500 bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/40"
                          : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 6: BACKGROUND STYLING */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-bold text-sky-400 border border-sky-400/30">
                    6
                  </span>
                  <label className="text-sm font-bold text-white">Scene Background</label>
                </div>

                {/* Background Types */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  {(["transparent", "solid", "gradient", "image", "video"] as BackgroundType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setBackgroundType(t);
                        const firstMatching = BACKGROUND_PRESETS.find((b) => b.type === t);
                        if (firstMatching) setSelectedBackground(firstMatching.value);
                      }}
                      className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors ${
                        backgroundType === t ? "bg-sky-500 text-white" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Presets */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {BACKGROUND_PRESETS.filter((b) => b.type === backgroundType).map((preset, idx) => {
                  const isSelected = selectedBackground === preset.value;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedBackground(preset.value)}
                      className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${
                        isSelected ? "border-sky-500 ring-2 ring-sky-500/40" : "border-slate-800 opacity-70 hover:opacity-100"
                      }`}
                      style={
                        preset.type === "solid"
                          ? { backgroundColor: preset.value }
                          : preset.type === "gradient"
                          ? { background: preset.value }
                          : preset.type === "transparent"
                          ? {
                              backgroundImage:
                                "repeating-conic-gradient(#334155 0% 25%, #1e293b 0% 50%) 50% / 12px 12px",
                            }
                          : {}
                      }
                    >
                      {preset.type === "image" && (
                        <img src={preset.value} alt={preset.label} className="h-full w-full object-cover" />
                      )}
                      {preset.type === "video" && (
                        <div className="relative h-full w-full bg-slate-950 flex items-center justify-center">
                          <VideoIcon className="h-4 w-4 text-sky-400" />
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 right-1 text-[8px] font-bold text-white bg-black/70 rounded px-1 truncate">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Preview Panel (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Composition Preview</span>
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-emerald-400 font-mono">Real-Time Sync</span>
                </div>
              </div>

              {/* Interactive Preview Canvas */}
              <div
                className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ${
                  aspectRatio === "9:16"
                    ? "aspect-[9/16] max-h-[520px] mx-auto"
                    : aspectRatio === "1:1"
                    ? "aspect-square max-h-[440px]"
                    : "aspect-video max-h-[380px]"
                }`}
              >
                {/* Layer 1: Background */}
                {backgroundType === "video" ? (
                  <video
                    src={selectedBackground}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : backgroundType === "image" ? (
                  <img
                    src={selectedBackground}
                    alt="Background"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : backgroundType === "transparent" ? (
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={{
                      backgroundImage: "repeating-conic-gradient(#1e293b 0% 25%, #0f172a 0% 50%) 50% / 20px 20px",
                    }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 h-full w-full"
                    style={
                      backgroundType === "solid"
                        ? { backgroundColor: selectedBackground }
                        : { background: selectedBackground }
                    }
                  />
                )}

                {/* Layer 2: Presenter with Hardware-Accelerated Animation */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div
                    className={`relative h-full w-full flex items-center justify-center transition-all ${getMotionClass()}`}
                  >
                    <img
                      src={selectedAvatar.previewImage}
                      alt={selectedAvatar.name}
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover object-top select-none pointer-events-none drop-shadow-2xl"
                    />
                  </div>
                </div>

                {/* Layer 3: Motion & Duration Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <Badge variant="glow" className="text-[10px] backdrop-blur-md bg-black/60 border-sky-400/40">
                    {activeMotionObj.name}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] backdrop-blur-md bg-black/60">
                    {duration}s
                  </Badge>
                </div>

                {/* Layer 4: Live Subtitles / Captions Overlay */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-black/80 p-2.5 backdrop-blur-md border border-white/10 shadow-2xl">
                  <p className="text-[11px] text-white font-semibold line-clamp-2 text-center">
                    "{script || "Your narration script will appear here..."}"
                  </p>
                </div>
              </div>

              {/* Specifications Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Presenter:</span>
                  <span className="font-bold text-white">{selectedAvatar.name} ({selectedAvatar.category})</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Narration Voice:</span>
                  <span className="font-bold text-white">
                    {voiceTab === "default" ? selectedVoice.name : clonedVoices.find((c) => c.id === selectedClonedVoiceId)?.name || "Cloned Voice"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Motion Preset:</span>
                  <span className="font-bold text-sky-400">{activeMotionObj.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Output Resolution:</span>
                  <span className="font-bold text-white">1080p · 30fps · H.264</span>
                </div>
              </div>

              {/* Launch CTA */}
              <div className="space-y-2 pt-1">
                <Button
                  onClick={handleStartGeneration}
                  disabled={!script.trim()}
                  variant="glow"
                  size="lg"
                  className="w-full font-bold shadow-2xl flex items-center justify-center gap-2 text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Video</span>
                  <span className="text-xs opacity-80 font-mono">· 10 Credits</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: REALISTIC GENERATION PIPELINE PROGRESS VIEW                       */}
      {/* ========================================================================= */}
      {currentView === "generating" && (
        <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 border border-sky-400/30 text-sky-400 shadow-2xl shadow-sky-500/20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Synthesizing AI Presenter Video</h2>
            <p className="text-sm text-slate-400">{pipelineMessage || "Processing multi-track generative pipeline..."}</p>
          </div>

          {/* Progress Percentage Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">Overall Progress</span>
              <span className="text-sky-400 font-mono font-bold">{pipelineProgress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-800 p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-500 shadow-lg shadow-sky-500/50"
                style={{ width: `${pipelineProgress}%` }}
              />
            </div>
          </div>

          {/* Stage Progress Checklist */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Generation Stages</h3>
            <div className="space-y-3">
              {PIPELINE_STAGES.map((stg, idx) => {
                const isPast = idx < activeStageIndex;
                const isCurrent = idx === activeStageIndex;

                return (
                  <div
                    key={stg.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isCurrent
                        ? "border-sky-500/50 bg-sky-500/10 shadow-lg shadow-sky-500/5"
                        : isPast
                        ? "border-slate-800/80 bg-slate-950/40 opacity-80"
                        : "border-slate-800/40 bg-slate-950/20 opacity-40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                          isPast
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : isCurrent
                            ? "bg-sky-500 text-white shadow-md shadow-sky-500/30"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isPast ? <Check className="h-4 w-4" /> : isCurrent ? <Loader2 className="h-4 w-4 animate-spin" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? "text-white" : isPast ? "text-slate-200" : "text-slate-500"}`}>
                          {stg.label}
                        </p>
                        <p className="text-[11px] text-slate-400">{stg.desc}</p>
                      </div>
                    </div>

                    {isCurrent && (
                      <Badge variant="glow" className="text-[10px]">Active</Badge>
                    )}
                    {isPast && (
                      <span className="text-[11px] text-emerald-400 font-semibold">Done</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Realtime Terminal Log */}
          {pipelineLogs.length > 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-[11px] text-slate-400 space-y-1 max-h-36 overflow-y-auto">
              {pipelineLogs.map((log, lIdx) => (
                <p key={lIdx} className="line-clamp-1">{log}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: COMPLETED RESULT & PLAYBACK STUDIO                                */}
      {/* ========================================================================= */}
      {currentView === "result" && generatedResult && (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-500/10 border border-emerald-500/30 p-5 rounded-3xl text-emerald-300">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Video Generation Complete!</h2>
                <p className="text-xs text-emerald-300/80">Your 1080p AI Avatar + Motion video is rendered and ready.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = generatedResult.videoResult.videoUrl;
                  link.download = `vilo-avatar-${Date.now()}.mp4`;
                  link.click();
                }}
                variant="glow"
                size="sm"
                className="gap-1.5 text-xs font-bold"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download MP4</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Video Preview Player (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div
                className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl ${
                  aspectRatio === "9:16"
                    ? "aspect-[9/16] max-h-[560px] mx-auto"
                    : aspectRatio === "1:1"
                    ? "aspect-square max-h-[460px]"
                    : "aspect-video"
                }`}
              >
                <video
                  src={generatedResult.videoResult.videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Right: Metadata Breakdown & Workflow CTAs (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Metadata Card */}
              <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Video Specifications</h3>
                
                <div className="divide-y divide-slate-800 text-xs">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="font-bold text-white">{generatedResult.videoResult.duration} Seconds</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Resolution</span>
                    <span className="font-bold text-white">{generatedResult.videoResult.resolution}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Avatar Presenter</span>
                    <span className="font-bold text-white">{selectedAvatar.name} ({selectedAvatar.category})</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Narration Voice</span>
                    <span className="font-bold text-white">
                      {voiceTab === "default" ? selectedVoice.name : clonedVoices.find((c) => c.id === selectedClonedVoiceId)?.name || "Cloned Voice"}
                    </span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Motion Preset</span>
                    <span className="font-bold text-sky-400">{activeMotionObj.name}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Aspect Ratio</span>
                    <span className="font-bold text-white">{aspectRatio}</span>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-400">Format</span>
                    <span className="font-bold text-white">{generatedResult.videoResult.format}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = generatedResult.videoResult.videoUrl;
                    link.download = `vilo-avatar-${Date.now()}.mp4`;
                    link.click();
                  }}
                  variant="glow"
                  size="md"
                  className="gap-2 font-bold"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>

                <Button
                  onClick={() => {
                    router.push(`/projects/${generatedResult.projectId}`);
                  }}
                  variant="outline"
                  size="md"
                  className="gap-2 font-bold border-slate-700 hover:bg-slate-800"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit in Studio</span>
                </Button>

                <Button
                  onClick={() => {
                    handleStartGeneration();
                  }}
                  variant="secondary"
                  size="md"
                  className="gap-2 font-bold bg-slate-800 hover:bg-slate-700"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Regenerate</span>
                </Button>

                <Button
                  onClick={() => {
                    setCurrentView("config");
                    setGeneratedResult(null);
                  }}
                  variant="ghost"
                  size="md"
                  className="gap-2 font-bold text-slate-300 hover:text-white"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Another</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Clone Creation Modal */}
      <Dialog open={showCloneModal} onOpenChange={setShowCloneModal} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-sky-400" />
            <span>Create AI Voice Clone</span>
          </DialogTitle>
          <DialogDescription>
            Record or upload a 30-second clean audio sample to create an instant neural voice clone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Voice Clone Name</label>
            <Input
              value={cloneName}
              onChange={(e) => setCloneName(e.target.value)}
              placeholder="e.g. My Personal Podcast Voice"
            />
          </div>

          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:border-sky-500 transition-colors">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 border border-sky-400/30">
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-white">Upload Audio Sample (WAV / MP3)</p>
            <p className="text-[10px] text-slate-400">Clear speech with minimal background noise</p>
          </div>

          <Button
            onClick={handleCreateVoiceClone}
            disabled={isCloning || !cloneName.trim()}
            variant="glow"
            size="md"
            className="w-full font-bold gap-2"
          >
            {isCloning ? (
              <span>Synthesizing Voice Model...</span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Create Instant Clone</span>
              </>
            )}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

export default function AvatarMotionStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading AI Avatar + Motion Studio...</div>}>
      <AvatarMotionStudioContent />
    </Suspense>
  );
}
