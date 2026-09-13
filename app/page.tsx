"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Video,
  ArrowRight,
  Zap,
  VolumeX,
  Code2,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Smartphone,
  Share2,
  Sliders,
  DollarSign,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const FAQS = [
    {
      q: "Why build a video generator without voiceover APIs?",
      a: "Over 85% of mobile users browse Instagram Reels, TikTok, and YouTube Shorts with the sound muted. Paying $50-$500/month for ElevenLabs or HeyGen APIs just to read text is expensive and unnecessary. Vilo focuses on visual hooks, kinetic typography, and React animations that captivate viewers even with sound turned OFF.",
    },
    {
      q: "Can I still add my own audio or background music?",
      a: "Yes! While Vilo doesn't force expensive third-party voice APIs on you, you can easily provide any audio URL, background music track, or pair it with our free offline Android voice generator app (Voxfell AI) for 100% zero-cost speech.",
    },
    {
      q: "How does Remotion render videos in Next.js?",
      a: "Remotion allows you to build video compositions using pure React, HTML, and CSS. When you export, our server-side FFmpeg engine compiles your React frames into a high-bitrate 1080x1920 MP4 directly inside Docker without external cloud fees.",
    },
    {
      q: "Is there any credit limit or hidden subscription?",
      a: "No. Because Vilo does not rely on third-party generative APIs (like OpenAI, HeyGen, or ElevenLabs), there are zero API token meters. You can generate and render unlimited reels directly on your machine or cloud server.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />

      <main className="flex-1">
        {/* ===================================================================== */}
        {/* HERO SECTION */}
        {/* ===================================================================== */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Subtle Ambient Background Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-sky-500/15 blur-[140px] rounded-full pointer-events-none"></div>
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-sky-300 backdrop-blur-md shadow-sm shadow-sky-500/20 animate-fade-in">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span>Zero API Cost • Programmatic Remotion Engine</span>
                <Badge variant="glow" className="text-[10px] py-0 px-2 ml-1">v2.0</Badge>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                Generate High-Converting Reels <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Without Expensive Voice APIs.
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                85% of viewers scroll on mute. Stop paying <span className="text-white font-bold">$500/month</span> for AI voice tokens.
                Create viral 9:16 vertical reels with kinetic typography, presenter overlays, and React-powered motion graphics.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
                <Link href="/create" className="w-full sm:w-auto">
                  <Button
                    variant="glow"
                    size="lg"
                    className="w-full sm:w-auto text-base font-bold px-8 py-3.5 h-12 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25"
                  >
                    <Video className="h-5 w-5" />
                    <span>Create Free Reel Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <a href="#how-it-works" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base font-medium px-6 py-3.5 h-12 rounded-xl border-slate-700/80 bg-slate-900/60 text-slate-200 hover:text-white flex items-center justify-center gap-2"
                  >
                    <Sliders className="h-4 w-4 text-sky-400" />
                    <span>How It Works</span>
                  </Button>
                </a>
              </div>

              {/* Quick Trust Pills */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs sm:text-sm text-slate-400 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>$0 Third-Party API Bills</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Pure React & Remotion Video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>9:16 Native (TikTok & Reels)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Sound-Off Optimized</span>
                </div>
              </div>
            </div>

            {/* ================================================================= */}
            {/* INTERACTIVE 9:16 REEL PLAYER SHOWCASE */}
            {/* ================================================================= */}
            <div className="mt-14 relative mx-auto max-w-4xl flex flex-col items-center">
              <div className="relative rounded-3xl border border-slate-800 bg-slate-900/70 p-3 sm:p-5 shadow-2xl backdrop-blur-xl ring-1 ring-white/10 flex flex-col md:flex-row gap-6 items-center">
                
                {/* 9:16 Mobile Mockup Canvas */}
                <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-between p-4 shrink-0">
                  {/* Top Canvas Bar */}
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Remotion 60 FPS
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-slate-300 border border-white/10 flex items-center gap-1">
                      <VolumeX className="h-3 w-3 text-sky-400" /> Sound-Off Mode
                    </span>
                  </div>

                  {/* Center Presenter & Kinetic Typography Canvas */}
                  <div className="flex flex-col items-center justify-center text-center my-auto z-10 space-y-5">
                    {/* Visual Presenter Circle */}
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-sky-500 shadow-xl shadow-sky-500/20 group">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                        alt="Reel Presenter"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    </div>

                    {/* Animated Kinetic Captions Box */}
                    <div className="space-y-1 px-2">
                      <p className="text-xl font-black tracking-tight text-white leading-tight">
                        STOP PAYING <br />
                        <span className="text-yellow-400 underline decoration-sky-500 decoration-4 underline-offset-4">
                          $500/MO FOR AI!
                        </span>
                      </p>
                      <p className="text-xs text-slate-300 font-semibold pt-1">
                        Create viral kinetic reels with pure code in React.
                      </p>
                    </div>

                    <div className="inline-block px-3 py-1 rounded-full bg-sky-500/20 border border-sky-500/40 text-[10px] font-bold text-sky-300">
                      ⚡ 100% Zero API Fees
                    </div>
                  </div>

                  {/* Bottom Canvas Timeline Controls */}
                  <div className="space-y-2 z-10">
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-400 h-full w-2/3 animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span>00:14 / 00:30</span>
                      <span className="text-sky-400 font-bold">1080x1920 MP4</span>
                    </div>
                  </div>
                </div>

                {/* Right Feature Explanation inside the Showcase */}
                <div className="space-y-4 text-left p-2 sm:p-4 max-w-md">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase text-sky-400 tracking-wider">
                    <Code2 className="h-4 w-4" />
                    <span>How Remotion Replaces AI Costs</span>
                  </div>

                  <h3 className="text-2xl font-black text-white leading-tight">
                    Visual-First Content That Hooks Attention in 0.8 Seconds.
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Traditional AI video platforms make you pay every time an AI voice speaks or an avatar blinks. 
                    Vilo uses Remotion’s programmatic canvas to generate dynamic kinetic typography, spring physics, and animated visual overlays.
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <div className="h-5 w-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      <span><strong>Word-by-Word Highlight:</strong> Kinetic text pops on screen to guide the eye seamlessly.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <div className="h-5 w-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      <span><strong>Instant Browser Preview:</strong> Change colors, scripts, and timing in real-time at 60 FPS.</span>
                    </div>
                    <div className="flex items-start gap-2.5 text-xs text-slate-200">
                      <div className="h-5 w-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">✓</div>
                      <span><strong>Direct MP4 Rendering:</strong> Local server-side FFmpeg rendering without third-party token limits.</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href="/create">
                      <Button variant="glow" size="sm" className="gap-2 font-bold">
                        <span>Try In Live Studio</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* WHY NO VOICEOVER / STATS BREAKTHROUGH */}
        {/* ===================================================================== */}
        <section id="why-no-voice" className="py-16 border-y border-slate-900 bg-slate-950/80 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-12">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">The Social Media Reality</span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">Why Voiceover-Less Video Outperforms</h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Modern content creation has shifted. Audiences scroll on commute, in bed, and at work with silent audio.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center space-y-2">
                <div className="text-4xl font-black text-sky-400">85%</div>
                <h4 className="text-base font-bold text-white">Silent Viewership</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The vast majority of mobile feeds are consumed with mute enabled. Kinetic captions make your message unmissable.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center space-y-2">
                <div className="text-4xl font-black text-emerald-400">$0.00</div>
                <h4 className="text-base font-bold text-white">Voice API Bills</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Save hundreds of dollars every month by eliminating per-character ElevenLabs and Azure Speech API charges.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 text-center space-y-2">
                <div className="text-4xl font-black text-purple-400">3.2x</div>
                <h4 className="text-base font-bold text-white">Higher Completion Rate</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast-paced kinetic typography and spring animations maintain viewer retention better than slow, monotone voiceovers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* CORE PLATFORM FEATURES */}
        {/* ===================================================================== */}
        <section id="features" className="py-20 bg-slate-950 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
              <div className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
                Engine Capabilities
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built for Programmatic Video Automation
              </h2>
              <p className="text-slate-400 text-base">
                Everything you need to produce engaging vertical social video content at scale without recurring API costs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-sky-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Kinetic Typography</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dynamic word-level highlight animations that bounce and scale in real-time, pulling viewers straight through the script.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-sky-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Code2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Pure React Video Code</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Define layouts with HTML, Tailwind CSS, and React state. Render at any framerate and resolution programmatically.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-sky-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <DollarSign className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Zero API Dependencies</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Never worry about API token limits, expired subscriptions, or unexpected third-party cloud bills.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-sky-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Local & Docker FFmpeg Render</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  High-speed server rendering packaged cleanly with Docker. Export ready-to-publish 1080x1920 MP4 files in seconds.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-sky-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">Android Audio Companion Ready</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pair with our free offline Android voice app (Voxfell AI) or upload your own audio files for optional sound without fees.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-3 hover:border-sky-500/40 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Share2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">9:16 Social Media Optimized</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Crafted specifically for the vertical algorithm: TikTok, Instagram Reels, YouTube Shorts, and Facebook Reels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* COMPARISON TABLE: OLD AI WAY VS VILO REMOTION */}
        {/* ===================================================================== */}
        <section id="comparison" className="py-20 border-t border-slate-900 bg-slate-950/70 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Clear Difference</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                Legacy AI Video Platforms vs. Vilo Remotion
              </h2>
              <p className="text-slate-400 text-sm">
                See why smart creators and developers choose code-based video generation.
              </p>
            </div>

            <div className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
              <div className="grid grid-cols-3 bg-slate-900 p-4 border-b border-slate-800 text-xs sm:text-sm font-bold text-white">
                <div>Feature</div>
                <div className="text-slate-400">Legacy AI Platforms</div>
                <div className="text-sky-400 font-extrabold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Vilo Remotion
                </div>
              </div>

              <div className="divide-y divide-slate-800/60 text-xs sm:text-sm">
                <div className="grid grid-cols-3 p-4 items-center">
                  <div className="font-semibold text-white">Monthly API Fees</div>
                  <div className="text-rose-400 flex items-center gap-1.5 font-mono">
                    <XCircle className="h-4 w-4" /> $100 — $500/mo
                  </div>
                  <div className="text-emerald-400 flex items-center gap-1.5 font-bold font-mono">
                    <CheckCircle2 className="h-4 w-4" /> $0 Forever
                  </div>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <div className="font-semibold text-white">Sound-Off Hook Power</div>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-slate-500" /> Weak static subtitles
                  </div>
                  <div className="text-sky-300 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> High-impact kinetic typography
                  </div>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <div className="font-semibold text-white">Rendering Speed & Control</div>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-slate-500" /> Slow cloud queues & credit limits
                  </div>
                  <div className="text-sky-300 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Instant local / Docker rendering
                  </div>
                </div>

                <div className="grid grid-cols-3 p-4 items-center">
                  <div className="font-semibold text-white">Code & Template Flexibility</div>
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4 text-slate-500" /> Locked closed-source editors
                  </div>
                  <div className="text-sky-300 flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 100% Programmable in React
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* HOW IT WORKS */}
        {/* ===================================================================== */}
        <section id="how-it-works" className="py-20 bg-slate-950 relative">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Workflow</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">4 Simple Steps from Script to MP4</h2>
              <p className="text-slate-400 text-sm">No complex video editing timelines or expensive API keys needed.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
                <span className="text-4xl font-black text-slate-800 font-mono">01</span>
                <h4 className="text-base font-bold text-white">Type Your Script</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your reel hook or marketing message. Captions are computed dynamically with word-level precision.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
                <span className="text-4xl font-black text-slate-800 font-mono">02</span>
                <h4 className="text-base font-bold text-white">Select Visual Style</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Add presenter imagery, brand logos, or background aesthetics styled with pure CSS.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
                <span className="text-4xl font-black text-slate-800 font-mono">03</span>
                <h4 className="text-base font-bold text-white">Preview in 60 FPS</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Watch your reel play in the web browser using Remotion Player with instantaneous feedback.
                </p>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-3 relative">
                <span className="text-4xl font-black text-slate-800 font-mono">04</span>
                <h4 className="text-base font-bold text-white">Export 1080p MP4</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click Export to render a crisp vertical video via FFmpeg, ready to post directly to social channels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* FAQ ACCORDION */}
        {/* ===================================================================== */}
        <section id="faq" className="py-20 border-t border-slate-900 bg-slate-950/60 relative">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-3 mb-12">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">Got Questions?</span>
              <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {FAQS.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-800 bg-slate-900/60 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-sky-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* FINAL CALL TO ACTION */}
        {/* ===================================================================== */}
        <section className="py-20 bg-gradient-to-b from-slate-950 via-sky-950/20 to-slate-950 border-t border-slate-900 text-center relative overflow-hidden">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Ready to create viral reels <br />
              <span className="text-sky-400">without paying API bills?</span>
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Launch the studio, type your script, and preview your Remotion reel right inside your browser in under 60 seconds.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/create">
                <Button
                  variant="glow"
                  size="lg"
                  className="w-full sm:w-auto h-12 px-8 text-base font-bold shadow-xl shadow-sky-500/25"
                >
                  <Sparkles className="h-5 w-5" />
                  <span>Start Creating Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
