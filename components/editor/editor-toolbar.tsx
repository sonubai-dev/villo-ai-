"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Sparkles,
  Download,
  Smartphone,
  Monitor,
  Square,
  Clock,
  Layers,
  Check,
  Edit2,
  Undo2,
  Redo2,
  Save,
  Film,
  Play,
  Share2,
} from "lucide-react";
import { Project, AspectRatio } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";

interface EditorToolbarProps {
  project: Project;
  activeSceneId?: string;
  onUpdateTitle: (title: string) => void;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  onOpenExport: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onSave?: () => void;
  isSaving?: boolean;
  onPreviewAll?: () => void;
}

export function EditorToolbar({
  project,
  activeSceneId,
  onUpdateTitle,
  onChangeAspectRatio,
  onOpenExport,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSave,
  isSaving = false,
  onPreviewAll,
}: EditorToolbarProps) {
  const router = useRouter();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const handleTitleSubmit = () => {
    if (titleValue.trim()) {
      onUpdateTitle(titleValue.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSaveClick = () => {
    if (onSave) onSave();
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-xl shrink-0 z-30">
      {/* Left: Back & Project Title & Undo/Redo */}
      <div className="flex items-center gap-3">
        <Link
          href="/projects"
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800 transition-colors"
          title="Back to Projects"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {/* Undo / Redo Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/80 rounded-xl p-1 border border-slate-800">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
              canUndo
                ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                : "text-slate-600 cursor-not-allowed"
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs transition-colors ${
              canRedo
                ? "text-slate-200 hover:bg-slate-800 hover:text-white"
                : "text-slate-600 cursor-not-allowed"
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Project Title */}
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              className="h-8 rounded-lg border border-sky-500 bg-slate-900 px-2.5 text-xs font-semibold text-white focus:outline-none"
              autoFocus
            />
            <button
              onClick={handleTitleSubmit}
              className="rounded-lg p-1 text-sky-400 hover:bg-slate-800"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingTitle(true)}
            className="flex items-center gap-1.5 cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-900 transition-colors group"
          >
            <h1 className="text-xs sm:text-sm font-bold text-white max-w-[160px] sm:max-w-xs truncate">
              {project.title}
            </h1>
            <Edit2 className="h-3 w-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </div>
        )}

        <Badge variant="secondary" className="hidden md:inline-flex text-[10px]">
          {project.scenes.length} Scenes · {formatDuration(project.duration)}
        </Badge>
      </div>

      {/* Center: Aspect Ratio Switchers */}
      <div className="hidden lg:flex items-center rounded-xl bg-slate-900/90 p-1 border border-slate-800">
        <button
          onClick={() => onChangeAspectRatio("16:9")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            project.aspectRatio === "16:9"
              ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60"
              : "text-slate-400 hover:text-white"
          }`}
          title="16:9 Landscape (YouTube / Desktop)"
        >
          <Monitor className="h-3.5 w-3.5" />
          <span>16:9</span>
        </button>

        <button
          onClick={() => onChangeAspectRatio("9:16")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            project.aspectRatio === "9:16"
              ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60"
              : "text-slate-400 hover:text-white"
          }`}
          title="9:16 Portrait (Reels / TikTok / Shorts)"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>9:16</span>
        </button>

        <button
          onClick={() => onChangeAspectRatio("1:1")}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
            project.aspectRatio === "1:1"
              ? "bg-slate-800 text-sky-400 shadow-sm border border-slate-700/60"
              : "text-slate-400 hover:text-white"
          }`}
          title="1:1 Square (Instagram)"
        >
          <Square className="h-3.5 w-3.5" />
          <span>1:1</span>
        </button>
      </div>

      {/* Right: Actions (Autosave indicator, Save, Generate Video, Export) */}
      <div className="flex items-center gap-2">
        {/* Autosave Pill */}
        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {saveFeedback ? "Saved!" : isSaving ? "Saving..." : "Autosaved"}
        </span>

        {/* Save Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSaveClick}
          className="h-8 px-2.5 text-xs text-slate-300 hover:text-white gap-1.5"
        >
          <Save className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Save</span>
        </Button>

        {/* Generate / Export CTA */}
        <Button
          type="button"
          variant="glow"
          size="sm"
          onClick={onOpenExport}
          className="h-8 px-3.5 gap-1.5 text-xs font-bold shadow-lg shadow-sky-500/20"
        >
          <Film className="h-3.5 w-3.5" />
          <span>Generate Video</span>
        </Button>
      </div>
    </div>
  );
}
