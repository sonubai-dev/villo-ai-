import React from "react";
import { UploadCloud, SlidersHorizontal, Sparkles, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function HowItWorks() {
  const STEPS = [
    {
      num: "01",
      title: "Upload & Describe",
      desc: "Drop your presentation slides, upload product photos, or enter a short text prompt describing your concept.",
      icon: UploadCloud,
      highlight: "PPT, PDF, Image or Idea",
    },
    {
      num: "02",
      title: "Customize Presenter & Style",
      desc: "Pick your favorite avatar, choose natural voice accents, adjust camera zooms, transitions, and caption styles.",
      icon: SlidersHorizontal,
      highlight: "8+ Avatars, Multi-accent TTS",
    },
    {
      num: "03",
      title: "Generate & Export",
      desc: "Vilo synthesizes speech, renders lip-synced head gestures, and composites a polished 1080p MP4 in seconds.",
      icon: Sparkles,
      highlight: "Instant 1080p MP4",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-slate-950/70 border-t border-slate-900">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <Badge variant="glow">Fast &amp; Frictionless</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Vilo AI works
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Create professional video presentations in 3 straightforward steps without expensive gear.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur-md hover:border-sky-500/30 transition-all group"
              >
                {/* Step Number Watermark */}
                <div className="absolute top-4 right-6 text-5xl font-extrabold text-slate-800/40 select-none font-mono">
                  {step.num}
                </div>

                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all">
                  <Icon className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4 flex-1">
                  {step.desc}
                </p>

                <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 pt-3 border-t border-slate-850">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{step.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
