"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UploadCloud, 
  Sparkles, 
  SlidersHorizontal, 
  Download, 
  Check, 
  Play, 
  ArrowRight,
  RefreshCw,
  Video,
  Image as ImageIcon,
  Layers,
  Move,
  UserSquare2,
  Film
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

export function ProductDemo() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const [activeStep, setActiveStep] = useState(0);

  const PIPELINE_STEPS = [
    {
      id: "image",
      title: "01. Image",
      subtitle: "Visual Input & Generation",
      desc: "Upload product photos, slides, or enter AI visual prompts.",
      icon: ImageIcon,
      tag: "Source",
    },
    {
      id: "storyboard",
      title: "02. Storyboard",
      subtitle: "Multi-Scene Scripting",
      desc: "Auto-generate structured scenes with narration and timing.",
      icon: Layers,
      tag: "Structure",
    },
    {
      id: "motion",
      title: "03. Motion",
      subtitle: "Cinematic Camera Paths",
      desc: "Apply zooms, pans, cinematic push/pull with smooth curves.",
      icon: Move,
      tag: "Dynamics",
    },
    {
      id: "video",
      title: "04. Video",
      subtitle: "1080p Stream Render",
      desc: "Multi-track timeline with transitions, captions & audio.",
      icon: Film,
      tag: "Timeline",
    },
    {
      id: "avatar",
      title: "05. AI Avatar",
      subtitle: "Lip-Synced Presenter",
      desc: "Photorealistic presenter overlay delivering the script.",
      icon: UserSquare2,
      tag: "Delivery",
    },
  ];

  const handleLaunch = () => {
    loginAsDemo();
    router.push("/create");
  };

  return (
    <section id="product-demo" className="py-20 border-t border-slate-900 bg-slate-950/60 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/10 px-3.5 py-1 text-xs font-semibold text-sky-400 border border-sky-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>The Vilo Creation Pipeline</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Image → Storyboard → Motion → Video → AI Avatar
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            A cohesive 5-stage architecture turning static visual ideas into dynamic video stories with zero editing friction.
          </p>
        </div>

        {/* Pipeline 5-Step Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto mb-8">
          {PIPELINE_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border transition-all text-left ${
                  isCurrent
                    ? "border-sky-500 bg-sky-500/15 shadow-lg shadow-sky-500/15 ring-1 ring-sky-500/40"
                    : "border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`p-2 rounded-xl ${isCurrent ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <Badge variant={isCurrent ? "glow" : "secondary"} className="text-[9px] font-mono">
                    {step.tag}
                  </Badge>
                </div>
                <h4 className={`text-xs font-bold mb-0.5 ${isCurrent ? "text-white" : "text-slate-200"}`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {step.subtitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Interactive Demonstration Box */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-xl shadow-2xl">
          {activeStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Stage 1 — Visual Input &amp; Generation</span>
                <Badge variant="glow" className="text-[10px]">Photo &amp; AI Prompt</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
                    alt="Sample Villa"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] bg-black/80">Input: 3840x2160</Badge>
                  </div>
                </div>
                <div className="space-y-2.5 text-left">
                  <p className="text-xs font-bold text-sky-400">Prompt / Asset Analysis</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    &quot;Ultra-modern luxury architectural residence at dusk with panoramic sunset reflection and floor-to-ceiling glass.&quot;
                  </p>
                  <Button onClick={() => setActiveStep(1)} size="sm" variant="glow" className="gap-1.5 font-bold">
                    <span>Generate Storyboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Stage 2 — Multi-Scene Storyboard</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> 3 Scenes Structured
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left">
                <div className="rounded-xl border border-sky-500/50 bg-sky-500/10 p-3">
                  <p className="text-[11px] font-bold text-sky-300 mb-1">SCENE 1: Entrance (8s)</p>
                  <p className="text-xs text-slate-300">&quot;Welcome to 42 Horizon Crest, an ultra-modern masterpiece...&quot;</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-[11px] font-bold text-slate-400 mb-1">SCENE 2: Kitchen (8s)</p>
                  <p className="text-xs text-slate-400">&quot;Italian chef kitchen with Calacatta marble waterfall island...&quot;</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-[11px] font-bold text-slate-400 mb-1">SCENE 3: Terrace (8s)</p>
                  <p className="text-xs text-slate-400">&quot;Private sunset viewing terrace overlooking ocean horizon...&quot;</p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setActiveStep(2)} size="sm" variant="glow" className="gap-1.5 font-bold">
                  <span>Apply Motion Presets</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Stage 3 — Motion Presets Engine</span>
                <Badge variant="glow" className="text-[10px]">9 Motion Presets</Badge>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                {["Zoom In", "Zoom Out", "Pan Left", "Pan Right", "Cinematic Push"].map((preset, idx) => (
                  <div
                    key={preset}
                    className={`p-2.5 rounded-xl border font-bold ${
                      idx === 4
                        ? "border-sky-500 bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/50"
                        : "border-slate-800 bg-slate-950/60 text-slate-400"
                    }`}
                  >
                    {preset}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 text-left leading-relaxed">
                Transform static pixels into high-speed dynamic 3D camera sweeps with easing and custom keyframe tuning.
              </p>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setActiveStep(3)} size="sm" variant="glow" className="gap-1.5 font-bold">
                  <span>Compose Video Timeline</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Stage 4 — Multi-Track Video Timeline</span>
                <Badge variant="secondary" className="text-[10px]">1080p 60fps</Badge>
              </div>
              <div className="space-y-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-left font-mono text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400 w-16">VIDEO:</span>
                  <div className="flex-1 bg-sky-500/20 border border-sky-500/40 rounded p-1 text-sky-300">
                    Scene 1 [00:00 - 00:08] · Fade Transition
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 w-16">TEXT:</span>
                  <div className="flex-1 bg-amber-500/20 border border-amber-500/40 rounded p-1 text-amber-300">
                    &quot;42 Horizon Crest — $12,500,000&quot;
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 w-16">AUDIO:</span>
                  <div className="flex-1 bg-emerald-500/20 border border-emerald-500/40 rounded p-1 text-emerald-300">
                    Sofia AI Voice narration + Ambient Chillwave
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setActiveStep(4)} size="sm" variant="glow" className="gap-1.5 font-bold">
                  <span>Stage AI Avatar</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Stage 5 — AI Presenter &amp; Video Finalization</span>
                <Badge variant="success" className="text-[10px]">Ready</Badge>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center space-y-3">
                <p className="text-sm font-bold text-white">Full Video Composition Complete</p>
                <p className="text-xs text-slate-400">Image → Storyboard → Motion → Video → AI Avatar pipeline executed in 4 seconds.</p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <Button onClick={handleLaunch} variant="glow" size="sm" className="font-bold gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span>Launch In Creator Studio</span>
                  </Button>
                  <Button onClick={() => setActiveStep(0)} variant="secondary" size="sm" className="gap-1.5">
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Restart Pipeline Demo</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
