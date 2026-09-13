"use client";

import React, { useState } from "react";
import { 
  Film, 
  UserSquare2, 
  Mic2, 
  Scissors, 
  Sparkles, 
  Volume2, 
  Music,
  Type,
  ZoomIn,
  ZoomOut,
  Layers
} from "lucide-react";
import { Project, Scene, MotionPreset } from "@/lib/types";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";
import { Button } from "@/components/ui/button";

interface TimelineProps {
  project: Project;
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onSplitScene?: (sceneId: string) => void;
}

export function Timeline({
  project,
  activeSceneId,
  onSelectScene,
  onSplitScene,
}: TimelineProps) {
  const [timelineScale, setTimelineScale] = useState<number>(1);
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0) || 1;

  return (
    <div className="flex h-48 w-full flex-col border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shrink-0">
      {/* Timeline Controls Header & Time Ruler */}
      <div className="flex h-9 items-center justify-between border-b border-slate-800/80 px-4 text-[11px] text-slate-400 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 uppercase tracking-wider">
            <Film className="h-3.5 w-3.5 text-sky-400" />
            <span>Multi-Track Timeline</span>
          </div>

          {onSplitScene && activeSceneId && (
            <button
              onClick={() => onSplitScene(activeSceneId)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700/60 transition-colors"
              title="Split active scene"
            >
              <Scissors className="h-3 w-3 text-sky-400" />
              <span>Split Scene</span>
            </button>
          )}
        </div>

        {/* Timeline Zoom & Rulers */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-8 font-mono text-[10px] text-slate-500">
            <span>00:00</span>
            <span>00:05</span>
            <span>00:10</span>
            <span>00:15</span>
            <span>00:20</span>
            <span>00:25</span>
            <span>00:30</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-0.5 border border-slate-800">
            <button
              onClick={() => setTimelineScale(Math.max(0.8, timelineScale - 0.2))}
              className="p-1 hover:text-white"
              title="Zoom out"
            >
              <ZoomOut className="h-3 w-3" />
            </button>
            <span className="font-mono text-[10px] px-1 text-slate-300">{Math.round(timelineScale * 100)}%</span>
            <button
              onClick={() => setTimelineScale(Math.min(2.5, timelineScale + 0.2))}
              className="p-1 hover:text-white"
              title="Zoom in"
            >
              <ZoomIn className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Track Canvas Area */}
      <div className="flex-1 overflow-x-auto p-3 space-y-2.5">
        {/* TRACK 1: SCENES / VIDEO BLOCKS */}
        <div className="flex items-center gap-2" style={{ minWidth: `${100 * timelineScale}%` }}>
          <div className="flex w-24 items-center gap-1.5 text-[11px] font-bold text-slate-300 shrink-0">
            <Film className="h-3.5 w-3.5 text-sky-400" />
            <span>Video Track</span>
          </div>

          <div className="flex flex-1 items-center gap-1.5 h-12">
            {project.scenes.map((scene, idx) => {
              const isActive = scene.id === activeSceneId;
              const widthPct = Math.max(12, (scene.duration / totalDuration) * 100);
              const preset: MotionPreset = scene.motionPreset || (scene.cameraEffect as MotionPreset) || "zoom-in";

              return (
                <div
                  key={scene.id}
                  onClick={() => onSelectScene(scene.id)}
                  style={{ width: `${widthPct}%` }}
                  className={`group relative flex h-full items-center justify-between overflow-hidden rounded-xl border p-1.5 cursor-pointer transition-all ${
                    isActive
                      ? "border-sky-500 bg-sky-500/20 shadow-md shadow-sky-500/10 ring-1 ring-sky-400"
                      : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-9 w-12 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                      <img src={scene.image} alt="Scene" className="h-full w-full object-cover" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-bold text-white truncate">
                        {idx + 1}. {scene.title || `Scene ${idx + 1}`}
                      </p>
                      <p className="text-[9px] text-sky-400 truncate font-mono capitalize">
                        {preset.replace("-", " ")} · {scene.duration}s
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK 2: TEXT OVERLAY & CAPTIONS TRACK */}
        <div className="flex items-center gap-2" style={{ minWidth: `${100 * timelineScale}%` }}>
          <div className="flex w-24 items-center gap-1.5 text-[11px] font-semibold text-slate-400 shrink-0">
            <Type className="h-3.5 w-3.5 text-amber-400" />
            <span>Captions</span>
          </div>

          <div className="flex flex-1 items-center gap-1.5 h-6">
            {project.scenes.map((scene) => {
              const widthPct = Math.max(12, (scene.duration / totalDuration) * 100);
              const textSnippet = scene.textOverlay?.content || scene.script.slice(0, 25) + "...";

              return (
                <div
                  key={scene.id}
                  style={{ width: `${widthPct}%` }}
                  className="flex h-full items-center rounded-md border border-amber-500/30 bg-amber-500/10 px-2 text-[9px] font-medium text-amber-300 truncate"
                >
                  <span className="truncate">&quot;{textSnippet}&quot;</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRACK 3: AUDIO & VOICE TRACK */}
        <div className="flex items-center gap-2" style={{ minWidth: `${100 * timelineScale}%` }}>
          <div className="flex w-24 items-center gap-1.5 text-[11px] font-semibold text-slate-400 shrink-0">
            <Music className="h-3.5 w-3.5 text-emerald-400" />
            <span>Audio / Voice</span>
          </div>

          <div className="flex flex-1 items-center gap-1.5 h-7">
            {project.scenes.map((scene) => {
              const widthPct = Math.max(12, (scene.duration / totalDuration) * 100);

              return (
                <div
                  key={scene.id}
                  style={{ width: `${widthPct}%` }}
                  className="flex h-full items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 text-[10px] text-emerald-300"
                >
                  <span className="truncate text-[9px] font-semibold">
                    {scene.backgroundMusicTitle || "Soundtrack"} ({scene.duration}s)
                  </span>
                  <div className="flex items-center gap-0.5 opacity-70">
                    <div className="h-2 w-0.5 bg-emerald-400 rounded-full animate-pulse" />
                    <div className="h-3.5 w-0.5 bg-emerald-400 rounded-full" />
                    <div className="h-1.5 w-0.5 bg-emerald-400 rounded-full animate-pulse" />
                    <div className="h-4 w-0.5 bg-emerald-400 rounded-full" />
                    <div className="h-2.5 w-0.5 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
