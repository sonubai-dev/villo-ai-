"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Image as ImageIcon, 
  Film, 
  Music, 
  Volume2, 
  Sparkles, 
  Check, 
  Play, 
  Pause 
} from "lucide-react";
import { MOCK_MEDIA_ITEMS, MediaItem } from "@/lib/mock-media";

interface MediaPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryFilter?: "images" | "videos" | "music" | "all";
  onSelect: (item: MediaItem) => void;
}

export function MediaPickerModal({
  open,
  onOpenChange,
  categoryFilter = "all",
  onSelect,
}: MediaPickerModalProps) {
  const mediaItems = MOCK_MEDIA_ITEMS;
  const [activeTab, setActiveTab] = useState<string>(categoryFilter === "all" ? "images" : categoryFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [previewAudioId, setPreviewAudioId] = useState<string | null>(null);

  const filteredItems = mediaItems.filter((item) => {
    const matchesCategory = activeTab === "all" || item.category === activeTab;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-4xl max-h-[85vh] flex flex-col">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-sky-400" />
          <span>Vilo Media Asset Library</span>
        </DialogTitle>
        <DialogDescription>
          Select high-resolution background visuals, stock clips, or royalty-free audio tracks.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Category switcher */}
        <div className="flex items-center rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs w-full sm:w-auto">
          {[
            { id: "images", label: "Images", icon: ImageIcon },
            { id: "videos", label: "Stock Video", icon: Film },
            { id: "music", label: "Soundtracks", icon: Music },
            { id: "sfx", label: "Sound FX", icon: Volume2 },
          ].map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold transition-all ${
                  activeTab === cat.id
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags, topics..."
            className="pl-9 h-8 text-xs"
          />
        </div>
      </div>

      {/* Grid of items */}
      <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[420px] py-4 pr-1">
        {filteredItems.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-center text-slate-400">
            <p className="text-sm font-semibold">No assets found</p>
            <p className="text-xs text-slate-500">Try adjusting your search keywords</p>
          </div>
        ) : activeTab === "images" || activeTab === "videos" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`group relative aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all ${
                    isSelected
                      ? "border-sky-500 ring-2 ring-sky-500/50 shadow-lg shadow-sky-500/20"
                      : "border-slate-800 opacity-80 hover:opacity-100 hover:border-slate-700"
                  }`}
                >
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent p-2 flex flex-col justify-between">
                    <div className="flex justify-end">
                      {isSelected && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white shadow">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white truncate">{item.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[9px] font-mono text-slate-400">{item.dimensions || item.fileSize}</span>
                        {item.duration && (
                          <span className="text-[9px] font-mono text-sky-400">· {item.duration}s</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Audio list view */
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              const isPlaying = previewAudioId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "border-sky-500 bg-sky-500/10 shadow-md"
                      : "border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewAudioId(isPlaying ? null : item.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white transition-colors"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                    <div>
                      <p className="text-xs font-bold text-white">{item.title}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span>{item.duration ? `${Math.floor(Number(item.duration) / 60)}:${(Number(item.duration) % 60).toString().padStart(2, '0')}` : "FX"}</span>
                        <span>·</span>
                        <span>{item.fileSize}</span>
                        <div className="flex gap-1">
                          {item.tags.slice(0, 2).map((t, idx) => (
                            <span key={idx} className="text-slate-500">#{t}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <Badge variant="glow" className="text-[10px]">Selected</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <DialogFooter className="border-t border-slate-800 pt-3">
        <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant="glow"
          size="sm"
          disabled={!selectedItem}
          onClick={handleConfirm}
          className="font-semibold gap-1.5"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Apply to Scene</span>
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
