"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  UserSquare2, 
  Sparkles, 
  Play, 
  Pause, 
  Volume2, 
  Check, 
  ArrowRight, 
  Layers, 
  Wand2, 
  Image as ImageIcon,
  Layout
} from "lucide-react";
import { MOCK_AVATARS } from "@/lib/providers/mock/mock-avatar";
import { MOCK_VOICES } from "@/lib/providers/mock/mock-voice";
import { SpeechEngine } from "@/lib/speech-engine";
import { useAppStore } from "@/lib/store";
import { AspectRatio, AvatarLayout } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

function CreateAvatarVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAvatarId = searchParams.get("avatarId") || MOCK_AVATARS[0].id;

  const { createProject, deductCredits } = useAppStore();

  const [selectedAvatarId, setSelectedAvatarId] = useState(initialAvatarId);
  const [selectedVoiceId, setSelectedVoiceId] = useState(MOCK_VOICES[0].id);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [avatarLayout, setAvatarLayout] = useState<AvatarLayout>("circle-bottom-right");
  const [script, setScript] = useState(
    "Welcome to this presentation! Today, I am excited to share our latest product updates and architectural innovations."
  );
  const [projectTitle, setProjectTitle] = useState("New AI Presenter Video");
  const [selectedBackground, setSelectedBackground] = useState(
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80"
  );
  const [playingVoice, setPlayingVoice] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const selectedAvatar = MOCK_AVATARS.find((a) => a.id === selectedAvatarId) || MOCK_AVATARS[0];
  const selectedVoice = MOCK_VOICES.find((v) => v.id === selectedVoiceId) || MOCK_VOICES[0];

  const BACKGROUND_OPTIONS = [
    { label: "Modern Office", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=80" },
    { label: "Studio Loft", url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&auto=format&fit=crop&q=80" },
    { label: "Tech Dashboard", url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80" },
    { label: "Luxury Villa", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80" },
    { label: "Dark Abstract", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80" },
  ];

  const handleTestSpeech = () => {
    if (playingVoice) {
      SpeechEngine.getInstance().stop();
      setPlayingVoice(false);
      return;
    }
    setPlayingVoice(true);
    SpeechEngine.getInstance().speak({
      text: script.slice(0, 120),
      language: selectedVoice.language,
      gender: selectedVoice.gender,
      pitch: selectedVoice.pitch,
      rate: selectedVoice.rate,
      onEnd: () => setPlayingVoice(false),
    });
  };

  const handleAiScriptSuggest = () => {
    setIsGeneratingScript(true);
    setTimeout(() => {
      setScript(
        `Hello everyone! In today's video, we are demonstrating how easily you can scale video production with AI presenters. Notice how lip-syncing and gestures automatically adapt to this script.`
      );
      setProjectTitle(`AI Presenter Overview ft. ${selectedAvatar.name}`);
      setIsGeneratingScript(false);
    }, 450);
  };

  const handleCreate = () => {
    deductCredits(10);
    const newProj = createProject({
      title: projectTitle,
      type: "avatar",
      aspectRatio,
      scenes: [
        {
          title: "Introduction",
          script,
          image: selectedBackground,
          avatarId: selectedAvatar.id,
          avatarLayout,
          showAvatar: true,
          voiceId: selectedVoice.id,
          duration: Math.max(6, Math.ceil(script.split(" ").length / 2.5)),
          transition: "fade",
          cameraEffect: "zoom-in",
        },
      ],
    });

    router.push(`/projects/${newProj.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
            <UserSquare2 className="h-4 w-4" />
            <span>Mode 1 — AI Avatar Video</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Create Talking Presenter Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Select your presenter, voice, script, and background styling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleCreate} variant="glow" size="md" className="gap-2 font-semibold shadow-lg">
            <Sparkles className="h-4 w-4" />
            <span>Generate &amp; Open Editor</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Config Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Project Title</label>
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="e.g. Executive Q3 Update"
            />
          </div>

          {/* Avatar Selector Grid */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Choose AI Presenter</span>
              <span className="text-sky-400 text-[11px] font-normal">{selectedAvatar.name} ({selectedAvatar.category})</span>
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {MOCK_AVATARS.map((avatar) => {
                const isSelected = avatar.id === selectedAvatarId;
                return (
                  <button
                    key={avatar.id}
                    onClick={() => {
                      setSelectedAvatarId(avatar.id);
                      setSelectedVoiceId(avatar.defaultVoiceId);
                    }}
                    className={`group relative flex flex-col items-center overflow-hidden rounded-xl border p-1.5 transition-all text-left ${
                      isSelected
                        ? "border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30"
                        : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-950 mb-1.5">
                      <img
                        src={avatar.previewImage}
                        alt={avatar.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-white line-clamp-1">{avatar.name}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{avatar.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Choose Narration Voice</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MOCK_VOICES.map((voice) => {
                const isSelected = voice.id === selectedVoiceId;
                return (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoiceId(voice.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-500/10"
                        : "border-slate-800 bg-slate-900/60 hover:bg-slate-900"
                    }`}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">{voice.name}</p>
                      <p className="text-[10px] text-slate-400">{voice.accent}</p>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-sky-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Script Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Narration Script</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAiScriptSuggest}
                  disabled={isGeneratingScript}
                  className="h-7 text-xs text-sky-400 hover:text-sky-300 gap-1 p-0"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span>{isGeneratingScript ? "Drafting..." : "AI Enhance Script"}</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleTestSpeech}
                  className="h-7 text-xs gap-1"
                >
                  {playingVoice ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  <span>{playingVoice ? "Stop" : "Test Voice"}</span>
                </Button>
              </div>
            </div>
            <Textarea
              rows={4}
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="What should your presenter say?"
              className="leading-relaxed"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{script.split(/\s+/).filter(Boolean).length} words</span>
              <span>Estimated duration: ~{Math.max(4, Math.ceil(script.split(" ").length / 2.5))}s</span>
            </div>
          </div>

          {/* Aspect Ratio & Layout */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {(["16:9", "9:16", "1:1"] as AspectRatio[]).map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                      aspectRatio === ratio
                        ? "border-sky-500 bg-sky-500/10 text-sky-400"
                        : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Presenter Layout</label>
              <select
                value={avatarLayout}
                onChange={(e) => setAvatarLayout(e.target.value as AvatarLayout)}
                className="h-10 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="circle-bottom-right">Circle Bottom Right</option>
                <option value="circle-bottom-left">Circle Bottom Left</option>
                <option value="side-by-side-left">Side by Side (Left)</option>
                <option value="side-by-side-right">Side by Side (Right)</option>
                <option value="fullscreen-presenter">Fullscreen Presenter</option>
              </select>
            </div>
          </div>

          {/* Background Visuals */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Scene Background</label>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUND_OPTIONS.map((bg, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedBackground(bg.url)}
                  className={`group relative aspect-video rounded-xl overflow-hidden border transition-all ${
                    selectedBackground === bg.url
                      ? "border-sky-500 ring-2 ring-sky-500/40"
                      : "border-slate-800 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={bg.url} alt={bg.label} className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 left-1 right-1 text-[9px] font-bold text-white bg-black/60 rounded px-1 truncate">
                    {bg.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Live Stage Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Composition Preview</span>
              <Badge variant="glow" className="text-[10px]">Real-Time Sync</Badge>
            </div>

            {/* Video Canvas Mock */}
            <div
              className={`relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl ${
                aspectRatio === "9:16" ? "aspect-[9/16] max-h-[500px] mx-auto" : aspectRatio === "1:1" ? "aspect-square" : "aspect-video"
              }`}
            >
              {/* Background */}
              <img
                src={selectedBackground}
                alt="Background"
                className="h-full w-full object-cover"
              />

              {/* Presenter Placement */}
              {avatarLayout === "fullscreen-presenter" ? (
                <div className="absolute inset-0 bg-slate-950/40 flex items-center justify-center">
                  <img
                    src={selectedAvatar.previewImage}
                    alt={selectedAvatar.name}
                    className={`h-full w-full object-cover ${playingVoice ? "animate-talking-head" : ""}`}
                  />
                </div>
              ) : avatarLayout === "side-by-side-left" ? (
                <div className="absolute left-0 top-0 bottom-0 w-1/2 border-r border-white/10 bg-slate-950/60 overflow-hidden">
                  <img
                    src={selectedAvatar.previewImage}
                    alt={selectedAvatar.name}
                    className={`h-full w-full object-cover ${playingVoice ? "animate-talking-head" : ""}`}
                  />
                </div>
              ) : (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl border border-sky-400/50 bg-slate-950/80 p-1.5 shadow-2xl backdrop-blur-md">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-sky-400">
                    <img
                      src={selectedAvatar.previewImage}
                      alt={selectedAvatar.name}
                      className={`h-full w-full object-cover ${playingVoice ? "animate-talking-head" : ""}`}
                    />
                    <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  </div>
                </div>
              )}

              {/* Dynamic Captions overlay */}
              <div className="absolute bottom-3 left-3 right-24 rounded-lg bg-black/75 px-2.5 py-1.5 backdrop-blur-md border border-white/10">
                <p className="text-[11px] text-white font-medium line-clamp-2">
                  {script}
                </p>
              </div>
            </div>

            {/* Launch CTA */}
            <Button
              onClick={handleCreate}
              variant="glow"
              size="lg"
              className="w-full font-bold shadow-xl flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Generate Project &amp; Open Editor</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateAvatarVideoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading Avatar Studio...</div>}>
      <CreateAvatarVideoContent />
    </Suspense>
  );
}
