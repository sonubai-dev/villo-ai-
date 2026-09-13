"use client";

import React from "react";
import { AvatarItem } from "@/services/avatar-voice/types";
import { Play, CheckCircle2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface AvatarCardProps {
  avatar: AvatarItem;
  isSelected: boolean;
  onSelect: (avatar: AvatarItem) => void;
  onPreview: (avatar: AvatarItem) => void;
  className?: string;
}

export function AvatarCard({
  avatar,
  isSelected,
  onSelect,
  onPreview,
  className = "",
}: AvatarCardProps) {
  return (
    <div
      onClick={() => onSelect(avatar)}
      className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/20 scale-[1.01]"
          : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90"
      } ${className}`}
    >
      {/* Thumbnail & Video Preview Trigger */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-950 mb-3 border border-slate-800">
        <img
          src={avatar.thumbnail}
          alt={avatar.name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Selected Checkmark Badge */}
        {isSelected && (
          <div className="absolute top-2 right-2 rounded-full bg-sky-500 p-1 text-white shadow-md">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="text-[10px] bg-black/70 backdrop-blur border-slate-800">
            {avatar.style}
          </Badge>
        </div>

        {/* Quick Preview Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="glow"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(avatar);
            }}
            className="h-9 px-3 gap-1.5 text-xs font-semibold rounded-full shadow-xl"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>Preview Video</span>
          </Button>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-left">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
            {avatar.name}
          </h4>
          <span className="text-[11px] text-slate-400 capitalize">{avatar.gender}</span>
        </div>
        <p className="text-xs text-slate-400 truncate">{avatar.role}</p>
      </div>

      {/* Select Action Button */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">{avatar.language}</span>
        <Button
          type="button"
          variant={isSelected ? "glow" : "outline"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(avatar);
          }}
          className={`h-7 px-2.5 text-[11px] font-semibold rounded-lg ${
            isSelected ? "shadow-sm shadow-sky-500/30" : "text-slate-300 border-slate-750"
          }`}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </div>
    </div>
  );
}
