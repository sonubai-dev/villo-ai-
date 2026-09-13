"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Wand2, 
  Sliders, 
  Video, 
  Mic2,
  Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

export function Hero() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleStartCreating = () => {
    loginAsDemo();
    router.push("/create");
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-grid-pattern">
      {/* Background glow flares */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-sky-300 backdrop-blur-md shadow-sm shadow-sky-500/20 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            <span>Next-Gen Visual AI Video Creation Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Create AI videos{" "}
            <span className="text-gradient-primary">without being a video editor.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
            Turn images, presentations, scripts and ideas into engaging AI videos with realistic AI presenters. The simplest way to produce high-impact video content in under 3 minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
            <Button
              onClick={handleStartCreating}
              variant="glow"
              size="lg"
              className="w-full sm:w-auto text-base font-semibold px-8 py-3.5 flex items-center justify-center gap-2"
            >
              <Sparkles className="h-5 w-5" />
              <span>Create Video Free</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Link href="#product-demo" className="w-full sm:w-auto">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-base font-medium px-6 py-3.5 flex items-center justify-center gap-2"
              >
                <Play className="h-4 w-4 text-sky-400" />
                <span>Watch Interactive Demo</span>
              </Button>
            </Link>
          </div>

          {/* Trust bullets */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>No Video Editing Skills Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>8+ Lifelike AI Presenters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>Instant Slide &amp; Image Splitting</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive App Window Showcase */}
        <div className="mt-14 relative mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-950/80 p-2 sm:p-3 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-850 bg-slate-900/60 rounded-t-xl mb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-slate-400">vilo-studio // Luxury_Property_Tour.vilo</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="glow" className="text-[10px]">AI AVATAR SYNC ACTIVE</Badge>
            </div>
          </div>

          {/* Main App Canvas Demo Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-900/40 rounded-xl p-3 border border-slate-800/50">
            {/* Left Scene cards list */}
            <div className="md:col-span-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
                <span>Scenes (3)</span>
                <span className="text-sky-400">24s Total</span>
              </div>

              {/* Scene 1 (Active) */}
              <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-3 shadow-md">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-sky-300">01 Exterior Entrance</span>
                  <span className="text-[11px] text-slate-400">8s</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  &quot;Welcome to 42 Horizon Crest, an ultra-modern architectural masterpiece...&quot;
                </p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-slate-300">Avatar: Sophia</span>
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-sky-400">Zoom In</span>
                </div>
              </div>

              {/* Scene 2 */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">02 Gourmet Kitchen</span>
                  <span className="text-[11px] text-slate-400">8s</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  &quot;Step inside to double-height ceilings and a custom Italian chef&apos;s kitchen...&quot;
                </p>
              </div>

              {/* Scene 3 */}
              <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300">03 Sunset Balcony</span>
                  <span className="text-[11px] text-slate-400">8s</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  &quot;Featuring five private suites and sunset terrace. Book VIP viewing today.&quot;
                </p>
              </div>
            </div>

            {/* Right Video Canvas Player */}
            <div className="md:col-span-8 flex flex-col space-y-3">
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 shadow-inner group">
                {/* Background video image */}
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=80"
                  alt="Property"
                  className="h-full w-full object-cover transform scale-105 transition-transform duration-1000"
                />

                {/* Floating Presenter Overlay */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl border border-sky-500/40 bg-slate-950/80 p-1.5 shadow-2xl backdrop-blur-md animate-talking-head">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-sky-400/50 ring-2 ring-sky-500/30">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                      alt="Sophia Avatar"
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                  </div>
                  <div className="pr-2 text-left">
                    <p className="text-xs font-bold text-white">Sophia</p>
                    <p className="text-[10px] text-sky-400 font-medium">Presenter (UK)</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      <div className="h-2 w-1 bg-sky-400 rounded-full animate-waveform" />
                      <div className="h-3 w-1 bg-sky-400 rounded-full animate-waveform [animation-delay:0.2s]" />
                      <div className="h-1.5 w-1 bg-sky-400 rounded-full animate-waveform [animation-delay:0.4s]" />
                      <div className="h-3.5 w-1 bg-sky-400 rounded-full animate-waveform [animation-delay:0.1s]" />
                    </div>
                  </div>
                </div>

                {/* Animated Dynamic Captions */}
                <div className="absolute bottom-4 left-4 right-28 rounded-xl bg-black/70 px-3 py-2 backdrop-blur-md border border-white/10 text-left">
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    Welcome to <span className="text-sky-400 underline decoration-2 underline-offset-2">42 Horizon Crest</span>, an ultra-modern architectural masterpiece...
                  </p>
                </div>
              </div>

              {/* Mini Timeline bar */}
              <div className="flex items-center justify-between rounded-lg bg-slate-950/80 px-3 py-2 border border-slate-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-400 transition-colors"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                  </button>
                  <span className="font-mono text-slate-300 text-[11px]">00:04 / 00:24</span>
                </div>

                {/* Scrubber progress */}
                <div className="flex-1 mx-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full w-1/3 bg-sky-400 rounded-full" />
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">1080p Full HD</Badge>
                  <Button onClick={handleStartCreating} size="sm" variant="glow" className="h-7 text-xs px-3">
                    Open Editor
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
