"use client";

import React, { useRef, useState, useEffect } from "react";
import { AvatarItem } from "@/services/avatar-voice/types";
import { X, Play, Pause, CheckCircle2, User, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AvatarPreviewModalProps {
  avatar: AvatarItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatar: AvatarItem) => void;
  isSelected: boolean;
}

export function AvatarPreviewModal({
  avatar,
  isOpen,
  onClose,
  onSelect,
  isSelected,
}: AvatarPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isOpen, avatar]);

  if (!isOpen || !avatar) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-slate-400 hover:text-white hover:bg-black/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Video Player Box */}
        <div
          onClick={togglePlay}
          className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black border border-slate-800 cursor-pointer group"
        >
          <video
            ref={videoRef}
            src={avatar.previewVideo}
            loop
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {/* Play/Pause Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/90 text-white shadow-xl">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
            </div>
          </div>

          <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-mono text-white">
            Live Presenter Demo
          </div>
        </div>

        {/* Avatar Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{avatar.name}</h3>
              <Badge variant="glow" className="text-xs">{avatar.style}</Badge>
            </div>
            <span className="text-xs text-slate-400 font-mono">{avatar.language}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{avatar.role}</p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {avatar.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-950 px-2 py-0.5 text-[10px] text-slate-400 border border-slate-800"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Back
          </Button>

          <Button
            type="button"
            variant="glow"
            onClick={() => {
              onSelect(avatar);
              onClose();
            }}
            className="gap-2 font-bold px-6"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{isSelected ? "Currently Selected" : "Select Presenter"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
