"use client";

import React, { useState, useRef, useEffect } from "react";
import { VoiceItem } from "@/services/avatar-voice/types";
import { Play, Pause, Volume2, CheckCircle2, AudioLines } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface VoiceCardProps {
  voice: VoiceItem;
  isSelected: boolean;
  onSelect: (voice: VoiceItem) => void;
  isPlaying?: boolean;
  onTogglePlay?: (voice: VoiceItem) => void;
  className?: string;
}

export function VoiceCard({
  voice,
  isSelected,
  onSelect,
  isPlaying = false,
  onTogglePlay,
  className = "",
}: VoiceCardProps) {
  const [internalPlaying, setInternalPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activePlaying = onTogglePlay ? isPlaying : internalPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTogglePlay) {
      onTogglePlay(voice);
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(voice.previewAudio);
      audioRef.current.onended = () => setInternalPlaying(false);
    }

    if (internalPlaying) {
      audioRef.current.pause();
      setInternalPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setInternalPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div
      onClick={() => onSelect(voice)}
      className={`group relative flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/15"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
      } ${className}`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Play Audio Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handlePlayClick}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-all ${
            activePlaying
              ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/30 scale-105"
              : isSelected
              ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
              : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800"
          }`}
        >
          {activePlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="h-5 w-5 fill-current ml-0.5" />
          )}
        </Button>

        {/* Voice Details */}
        <div className="space-y-0.5 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors truncate">
              {voice.name}
            </h4>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-950 border-slate-800">
              {voice.language}
            </Badge>
          </div>

          <p className="text-xs text-slate-400 truncate">
            {voice.accent} · {voice.gender} · {voice.style}
          </p>

          {/* Animated Waveform Visualizer when active */}
          {activePlaying && (
            <div className="flex items-center gap-1 pt-1 animate-in fade-in">
              <span className="h-2 w-1 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "0ms" }} />
              <span className="h-4 w-1 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "150ms" }} />
              <span className="h-3 w-1 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "300ms" }} />
              <span className="h-5 w-1 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "450ms" }} />
              <span className="h-2 w-1 rounded-full bg-sky-400 animate-pulse" style={{ animationDelay: "200ms" }} />
              <span className="text-[10px] text-sky-400 font-mono ml-1">Playing Preview</span>
            </div>
          )}
        </div>
      </div>

      {/* Selected Indicator */}
      <div className="flex items-center gap-2 shrink-0">
        {isSelected ? (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white shadow-md">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(voice);
            }}
            className="h-7 px-2.5 text-[11px] font-semibold text-slate-400 border-slate-800 hover:text-white"
          >
            Select
          </Button>
        )}
      </div>
    </div>
  );
}
