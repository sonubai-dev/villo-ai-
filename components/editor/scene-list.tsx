"use client";

import React from "react";
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Clock, 
  Volume2, 
  User, 
  Move,
  Layers,
  Scissors,
  Sparkles
} from "lucide-react";
import { Scene, MotionPreset } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";

interface SceneListProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelectScene: (sceneId: string) => void;
  onAddScene: () => void;
  onDuplicateScene: (sceneId: string) => void;
  onDeleteScene: (sceneId: string) => void;
  onSplitScene?: (sceneId: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export function SceneList({
  scenes,
  activeSceneId,
  onSelectScene,
  onAddScene,
  onDuplicateScene,
  onDeleteScene,
  onSplitScene,
  onMoveUp,
  onMoveDown,
}: SceneListProps) {
  return (
    <div className="flex h-full w-72 sm:w-80 flex-col border-r border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Story Scenes ({scenes.length})
          </span>
        </div>

        <Button
          onClick={onAddScene}
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-2.5 gap-1 bg-slate-900 border-slate-700/70 text-sky-300 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Scene</span>
        </Button>
      </div>

      {/* Vertical Scene List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {scenes.map((scene, idx) => {
          const isActive = scene.id === activeSceneId;
          const avatar = MOCK_AVATARS.find((a) => a.id === scene.avatarId) || MOCK_AVATARS[0];
          const preset: MotionPreset = scene.motionPreset || (scene.cameraEffect as MotionPreset) || "zoom-in";

          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(scene.id)}
              className={`group relative flex flex-col rounded-2xl border p-2.5 cursor-pointer transition-all duration-150 ${
                isActive
                  ? "border-sky-500/80 bg-sky-500/10 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/50"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
              }`}
            >
              {/* Scene Top Info Bar */}
              <div className="flex items-center justify-between mb-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold ${
                      isActive ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className="truncate max-w-[125px]">{scene.title || `Scene ${idx + 1}`}</span>
                </div>

                {/* Quick actions for reordering */}
                <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx > 0) onMoveUp(idx);
                    }}
                    disabled={idx === 0}
                    className="p-1 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (idx < scenes.length - 1) onMoveDown(idx);
                    }}
                    disabled={idx === scenes.length - 1}
                    className="p-1 hover:text-white disabled:opacity-20 transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Thumbnail & Script Preview */}
              <div className="flex gap-2.5 items-start">
                <div className="relative h-14 w-20 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-800">
                  <img
                    src={scene.image}
                    alt={scene.title || "Scene"}
                    className="h-full w-full object-cover"
                  />
                  {scene.showAvatar && (
                    <div className="absolute bottom-1 right-1 h-5 w-5 rounded-full overflow-hidden border border-sky-400 shadow-md">
                      <img src={avatar.previewImage} alt="Avatar" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <span className="absolute bottom-0.5 left-0.5 rounded bg-black/85 px-1 text-[8px] font-mono text-white font-bold">
                    {scene.duration}s
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-300 leading-snug line-clamp-2">
                    &quot;{scene.script}&quot;
                  </p>
                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="text-sky-400 font-semibold capitalize truncate">{preset.replace("-", " ")}</span>
                    <span>·</span>
                    <span className="capitalize">{scene.transition}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar on Active */}
              {isActive && (
                <div className="mt-2.5 flex items-center justify-between border-t border-sky-500/20 pt-1.5 text-[11px]">
                  <span className="text-sky-300 font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-sky-400" />
                    <span>Active Scene</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {onSplitScene && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSplitScene(scene.id);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Split Scene in Half"
                      >
                        <Scissors className="h-3 w-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateScene(scene.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Duplicate Scene"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteScene(scene.id);
                        }}
                        className="p-1 text-rose-400 hover:text-rose-300"
                        title="Delete Scene"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
