"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Play, Pause, Volume2, Sparkles, Check, ArrowRight } from "lucide-react";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";
import { SpeechEngine } from "@/lib/speech-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store";

const CATEGORIES = ["All", "Business", "Creator", "Teacher", "Real Estate", "Casual", "Presenter"];

export function AvatarGrid() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingAvatarId, setPlayingAvatarId] = useState<string | null>(null);

  const filteredAvatars = selectedCategory === "All"
    ? MOCK_AVATARS
    : MOCK_AVATARS.filter((a) => a.category === selectedCategory || a.tags.includes(selectedCategory));

  const handlePreviewVoice = (avatarId: string, name: string, role: string) => {
    if (playingAvatarId === avatarId) {
      SpeechEngine.getInstance().stop();
      setPlayingAvatarId(null);
      return;
    }

    setPlayingAvatarId(avatarId);
    SpeechEngine.getInstance().speak({
      text: `Hello! I'm ${name}, an AI presenter ready to narrate your next video presentation with realistic lip-sync.`,
      onEnd: () => setPlayingAvatarId(null),
    });
  };

  const handleSelectAvatar = (avatarId: string) => {
    loginAsDemo();
    router.push(`/create/avatar?avatarId=${avatarId}`);
  };

  return (
    <section id="avatars" className="py-20 bg-slate-950/80 border-t border-slate-900">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <Badge variant="glow">Studio Quality Presenters</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Meet your AI video presenters
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Choose from a diverse roster of expressive avatars with natural gestures, multi-language accents, and automatic lip-sync.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                  : "bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredAvatars.map((avatar) => {
            const isPlaying = playingAvatarId === avatar.id;

            return (
              <div
                key={avatar.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 p-3 transition-all duration-300 hover:border-sky-500/40 hover:shadow-xl hover:shadow-sky-500/10"
              >
                {/* Image & Video Simulation Area */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-950">
                  <img
                    src={avatar.previewImage}
                    alt={avatar.name}
                    loading="lazy"
                    decoding="async"
                    className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                      isPlaying ? "animate-talking-head scale-105" : ""
                    }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />

                  {/* Talking / Sound Indicator Badge */}
                  {isPlaying && (
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-sky-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm animate-pulse">
                      <Volume2 className="h-3 w-3" />
                      <span>Speaking</span>
                    </div>
                  )}

                  {/* Play Voice Preview Button */}
                  <button
                    onClick={() => handlePreviewVoice(avatar.id, avatar.name, avatar.role)}
                    className="absolute top-2.5 left-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/75 text-white border border-white/20 backdrop-blur-md hover:bg-sky-500 transition-colors shadow-lg"
                    title="Preview speech"
                  >
                    {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                  </button>

                  {/* Bottom Role info over image */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">{avatar.name}</h4>
                      <Badge variant="glow" className="text-[10px] py-0 px-2">
                        {avatar.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">{avatar.role}</p>
                    <p className="text-[11px] text-sky-400 mt-0.5">{avatar.accent}</p>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    onClick={() => handleSelectAvatar(avatar.id)}
                    variant="secondary"
                    size="sm"
                    className="w-full text-xs font-semibold group-hover:border-sky-500/40 group-hover:bg-sky-500/10 group-hover:text-sky-300"
                  >
                    <span>Use in Video</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
