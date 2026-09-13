"use client";

import React, { useState, useEffect, useRef } from "react";
import { RenderableSceneUnit } from "@/services/scene-pipeline/types";
import { avatarLibrary } from "@/services/avatar-voice/avatar-library";
import { voiceLibrary } from "@/services/avatar-voice/voice-library";
import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  User,
  Volume2,
  Type,
  Maximize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export interface ScenePreviewProps {
  scene: RenderableSceneUnit;
  onUpdateScene: (updates: Partial<RenderableSceneUnit>) => void;
  onRegenerateScene: (sceneId: string, updates: Partial<RenderableSceneUnit>) => Promise<void>;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  className?: string;
}

export function ScenePreview({
  scene,
  onUpdateScene,
  onRegenerateScene,
  aspectRatio = "16:9",
  className = "",
}: ScenePreviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const avatar = avatarLibrary.getAvatarById(scene.avatarId);
  const voice = voiceLibrary.getVoiceById(scene.voiceId);

  // Playback timer & word-level caption highlight sync
  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;

    if (isPlaying) {
      startTime = performance.now() - currentTime * 1000;

      const loop = (now: number) => {
        const elapsed = (now - (startTime || now)) / 1000;
        if (elapsed >= scene.duration) {
          setCurrentTime(0);
          setIsPlaying(false);
          setActiveWordIndex(0);
        } else {
          setCurrentTime(elapsed);

          // Find active word in word timings
          if (scene.wordTimings && scene.wordTimings.length > 0) {
            const idx = scene.wordTimings.findIndex(
              (w) => elapsed >= w.start && elapsed <= w.end
            );
            if (idx !== -1) setActiveWordIndex(idx);
          }

          animationFrame = requestAnimationFrame(loop);
        }
      };

      animationFrame = requestAnimationFrame(loop);
    }

    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying, scene.duration, scene.wordTimings]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= scene.duration) setCurrentTime(0);
      setIsPlaying(true);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setErrorMessage(null);
    try {
      await onRegenerateScene(scene.id, {
        narration: scene.narration,
        avatarId: scene.avatarId,
        voiceId: scene.voiceId,
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to regenerate scene");
    } finally {
      setIsRegenerating(false);
    }
  };

  const wordsList = scene.narration.split(/\s+/).filter(Boolean);

  const aspectClass =
    aspectRatio === "9:16"
      ? "aspect-[9/16] max-h-[500px]"
      : aspectRatio === "1:1"
      ? "aspect-square max-h-[440px]"
      : "aspect-video max-h-[440px]";

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Scene Canvas Container */}
      <div className="relative mx-auto flex flex-col items-center justify-center">
        <div
          ref={containerRef}
          onClick={togglePlay}
          className={`relative w-full ${aspectClass} overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl cursor-pointer select-none group`}
        >
          {/* Layer 1: Background Visual with Motion Simulation */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out"
            style={{
              backgroundImage: `url(${scene.backgroundUrl})`,
              transform: isPlaying
                ? scene.motionPreset === "zoom-in"
                  ? "scale(1.1)"
                  : scene.motionPreset === "pan-left"
                  ? "translateX(-30px) scale(1.05)"
                  : scene.motionPreset === "pan-right"
                  ? "translateX(30px) scale(1.05)"
                  : "scale(1.05)"
                : "scale(1.0)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
          </div>

          {/* Layer 2: Avatar Presenter Layer */}
          {scene.showAvatar && (
            <div
              className={`absolute transition-all duration-300 z-10 ${
                scene.avatarLayout === "circle-bottom-right"
                  ? "bottom-4 right-4 h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-sky-400/80 shadow-2xl overflow-hidden bg-slate-900"
                  : scene.avatarLayout === "circle-bottom-left"
                  ? "bottom-4 left-4 h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-sky-400/80 shadow-2xl overflow-hidden bg-slate-900"
                  : scene.avatarLayout === "side-by-side-left"
                  ? "bottom-0 left-0 top-0 w-1/3 border-r border-slate-800 overflow-hidden bg-slate-900/80 backdrop-blur"
                  : "inset-0 flex items-center justify-center"
              }`}
            >
              <img
                src={avatar.thumbnail}
                alt={avatar.name}
                className={`h-full w-full object-cover transition-transform ${
                  isPlaying ? "scale-105" : "scale-100"
                }`}
              />

              {/* Talking Animation Ring */}
              {isPlaying && (
                <div className="absolute inset-0 rounded-full border-2 border-sky-400 animate-ping opacity-30 pointer-events-none" />
              )}
            </div>
          )}

          {/* Layer 3: On-Screen Text Overlay */}
          {scene.onScreenText && (
            <div className="absolute top-5 left-5 z-20">
              <span className="rounded-xl bg-black/80 px-3 py-1.5 text-xs font-mono font-extrabold tracking-wider text-sky-400 border border-sky-500/30 shadow-xl uppercase">
                {scene.onScreenText}
              </span>
            </div>
          )}

          {/* Layer 4: Dynamic Word-Level Captions */}
          {scene.captions?.enabled && (
            <div
              className={`absolute left-4 right-4 z-20 flex justify-center text-center ${
                scene.captions.position === "top"
                  ? "top-14"
                  : scene.captions.position === "center"
                  ? "top-1/2 -translate-y-1/2"
                  : "bottom-12"
              }`}
            >
              <div className="max-w-[85%] rounded-2xl bg-black/75 px-4 py-2 backdrop-blur border border-slate-800 shadow-2xl">
                <p className="text-xs sm:text-sm font-extrabold leading-relaxed text-white">
                  {wordsList.map((word, wIdx) => {
                    const isWordActive = wIdx === activeWordIndex && isPlaying;
                    return (
                      <span
                        key={wIdx}
                        className={`inline-block mr-1.5 transition-all duration-150 ${
                          isWordActive
                            ? "text-sky-300 scale-110 font-black underline decoration-sky-400 underline-offset-4"
                            : "text-slate-200"
                        }`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Play/Pause Center Indicator on Hover */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-500 text-white shadow-2xl">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </div>
          </div>

          {/* Playback Scrubber Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900/90 z-30">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-100"
              style={{ width: `${(currentTime / (scene.duration || 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Bar & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 backdrop-blur">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={togglePlay}
            className="h-9 px-3 rounded-xl bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-semibold gap-1.5"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
            <span>{isPlaying ? "Pause" : "Play Scene"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentTime(0);
              setIsPlaying(false);
            }}
            title="Reset"
            className="h-9 w-9 p-0 text-slate-400 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <span className="text-xs font-mono text-slate-400">
            00:0{Math.floor(currentTime)} / 00:0{scene.duration}
          </span>
        </div>

        {/* Scene Info Badges */}
        <div className="flex items-center gap-2 text-xs">
          <Badge variant="secondary" className="text-[11px] gap-1 bg-slate-950 border-slate-800">
            <User className="h-3 w-3 text-sky-400" />
            <span>{avatar.name}</span>
          </Badge>
          <Badge variant="secondary" className="text-[11px] gap-1 bg-slate-950 border-slate-800">
            <Volume2 className="h-3 w-3 text-emerald-400" />
            <span>{voice.name}</span>
          </Badge>
        </div>

        {/* Regeneration & Settings Actions */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="h-9 text-xs gap-1.5 text-sky-400 hover:text-sky-300"
          >
            <Wand2 className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
            <span>{isRegenerating ? "Regenerating..." : "Regen Scene"}</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`h-9 px-2.5 text-xs gap-1.5 ${
              isSettingsOpen ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Contextual Scene Settings Drawer */}
      {isSettingsOpen && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Scene Parameters</h4>
            <span className="text-[11px] text-slate-400 font-mono">ID: {scene.id}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Scene Duration</label>
              <select
                value={scene.duration}
                onChange={(e) => onUpdateScene({ duration: Number(e.target.value) })}
                className="h-9 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value={4}>4 Seconds</option>
                <option value={6}>6 Seconds</option>
                <option value={8}>8 Seconds</option>
                <option value={10}>10 Seconds</option>
                <option value={15}>15 Seconds</option>
              </select>
            </div>

            {/* Camera Motion */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Camera Move</label>
              <select
                value={scene.motionPreset || "cinematic-push"}
                onChange={(e) => onUpdateScene({ motionPreset: e.target.value as any })}
                className="h-9 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="cinematic-push">Cinematic Push</option>
                <option value="pan-left">Pan Left</option>
                <option value="pan-right">Pan Right</option>
                <option value="zoom-in">Zoom In</option>
                <option value="slow-zoom">Slow Zoom</option>
                <option value="none">Static</option>
              </select>
            </div>

            {/* Avatar Layout */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Presenter Layout</label>
              <select
                value={scene.avatarLayout || "circle-bottom-right"}
                onChange={(e) => onUpdateScene({ avatarLayout: e.target.value as any })}
                className="h-9 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="circle-bottom-right">Circle PiP (Right)</option>
                <option value="circle-bottom-left">Circle PiP (Left)</option>
                <option value="side-by-side-left">Side-by-Side</option>
                <option value="fullscreen-presenter">Fullscreen Presenter</option>
              </select>
            </div>

            {/* Caption Style */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold">Caption Preset</label>
              <select
                value={scene.captions?.style || "creator"}
                onChange={(e) =>
                  onUpdateScene({
                    captions: {
                      ...scene.captions,
                      enabled: true,
                      style: e.target.value as any,
                      position: scene.captions?.position || "bottom",
                      fontSize: scene.captions?.fontSize || "medium",
                      highlightColor: "#38bdf8",
                      textColor: "#ffffff",
                    },
                  })
                }
                className="h-9 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="creator">Creator Highlight (Neon)</option>
                <option value="clean">Clean Minimal</option>
                <option value="bold">Bold Impact</option>
                <option value="business">Business Professional</option>
              </select>
            </div>
          </div>

          {/* On Screen Headline */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-semibold text-slate-300">On-Screen Headline Text</label>
            <Input
              value={scene.onScreenText}
              onChange={(e) => onUpdateScene({ onScreenText: e.target.value })}
              placeholder="e.g. KEY PRODUCT HIGHLIGHT"
              className="text-xs font-mono uppercase bg-slate-950 border-slate-800"
            />
          </div>
        </div>
      )}
    </div>
  );
}
