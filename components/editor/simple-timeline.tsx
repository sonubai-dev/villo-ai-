"use client";

import React from "react";
import {
  Film,
  Plus,
  Copy,
  Trash2,
  Scissors,
  ArrowLeft,
  ArrowRight,
  Clock,
  User,
  Sliders,
  Undo2,
  Redo2,
} from "lucide-react";
import { Project, Scene } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SimpleTimelineProps {
  project: Project;
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onAddScene?: () => void;
  onDuplicateScene?: (sceneId: string) => void;
  onDeleteScene?: (sceneId: string) => void;
  onSplitScene?: (sceneId: string) => void;
  onMoveScene?: (index: number, direction: "left" | "right") => void;
  onChangeDuration?: (sceneId: string, duration: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function SimpleTimeline({
  project,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onSplitScene,
  onMoveScene,
  onChangeDuration,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
}: SimpleTimelineProps) {
  const totalDuration = project.scenes.reduce((sum, s) => sum + s.duration, 0) || 1;
  const activeSceneIndex = project.scenes.findIndex((s) => s.id === activeSceneId);

  return (
    <div className="flex h-44 w-full flex-col border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl shrink-0 z-20">
      {/* Top Controls Header */}
      <div className="flex h-9 items-center justify-between border-b border-slate-800/80 px-4 text-xs bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white text-xs">
            <Film className="h-3.5 w-3.5 text-sky-400" />
            <span>Scene Timeline ({project.scenes.length} Blocks)</span>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Total Runtime: ~{totalDuration}s
          </span>
        </div>

        {/* Action Controls for Selected Block */}
        <div className="flex items-center gap-1.5">
          {/* Undo / Redo Quick Buttons */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1 rounded-md text-xs transition-colors ${
              canUndo ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-600 cursor-not-allowed"
            }`}
            title="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1 rounded-md text-xs transition-colors ${
              canRedo ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-600 cursor-not-allowed"
            }`}
            title="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Split */}
          {onSplitScene && activeSceneId && (
            <button
              onClick={() => onSplitScene(activeSceneId)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700/60 transition-colors"
              title="Split active scene"
            >
              <Scissors className="h-3 w-3 text-sky-400" />
              <span>Split</span>
            </button>
          )}

          {/* Duplicate */}
          {onDuplicateScene && activeSceneId && (
            <button
              onClick={() => onDuplicateScene(activeSceneId)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700/60 transition-colors"
              title="Duplicate active scene"
            >
              <Copy className="h-3 w-3" />
              <span>Duplicate</span>
            </button>
          )}

          {/* Delete */}
          {onDeleteScene && activeSceneId && project.scenes.length > 1 && (
            <button
              onClick={() => onDeleteScene(activeSceneId)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[10px] font-semibold border border-rose-500/30 transition-colors"
              title="Delete scene"
            >
              <Trash2 className="h-3 w-3" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Blocks Scroll Area */}
      <div className="flex-1 overflow-x-auto p-3.5 flex items-center gap-3">
        {project.scenes.map((scene, idx) => {
          const isSelected = scene.id === activeSceneId;
          const words = (scene.script || "").split(/\s+/).filter(Boolean).length;

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`group relative flex flex-col justify-between h-24 min-w-[170px] max-w-[220px] shrink-0 rounded-2xl border p-2.5 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-sky-400 bg-sky-500/15 shadow-lg shadow-sky-500/20 scale-[1.02]"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900"
              }`}
            >
              {/* Scene Block Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-950 text-[10px] font-mono font-bold text-sky-400 border border-slate-800">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[90px]">
                    Scene {idx + 1}
                  </span>
                </div>

                {/* Duration Badge & Trim stepper */}
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={scene.duration}
                    onChange={(e) => onChangeDuration && onChangeDuration(scene.id, Number(e.target.value))}
                    className="h-5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 px-1 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value={3}>3s</option>
                    <option value={4}>4s</option>
                    <option value={5}>5s</option>
                    <option value={6}>6s</option>
                    <option value={8}>8s</option>
                    <option value={10}>10s</option>
                    <option value={15}>15s</option>
                  </select>
                </div>
              </div>

              {/* Script Snippet / Text */}
              <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                {scene.script || "Empty scene narration..."}
              </p>

              {/* Footer Meta & Reorder Arrows */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                <span className="truncate max-w-[80px] font-mono uppercase">
                  {scene.textOverlay?.content || scene.overlayText || scene.motionPreset || "Visual"}
                </span>

                {/* Reorder Buttons on Block */}
                {onMoveScene && (
                  <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onMoveScene(idx, "left")}
                      disabled={idx === 0}
                      className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Left"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onMoveScene(idx, "right")}
                      disabled={idx === project.scenes.length - 1}
                      className="h-4 w-4 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Right"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Scene Block Button */}
        {onAddScene && (
          <button
            onClick={onAddScene}
            className="flex flex-col items-center justify-center h-24 min-w-[110px] rounded-2xl border border-dashed border-slate-800 hover:border-sky-500/50 bg-slate-900/30 hover:bg-slate-900/80 text-slate-400 hover:text-sky-400 transition-all gap-1.5"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[11px] font-semibold">Add Scene</span>
          </button>
        )}
      </div>
    </div>
  );
}
