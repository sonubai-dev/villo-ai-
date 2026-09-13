"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  UserSquare2, 
  Mic, 
  Sparkles, 
  FileText, 
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";

export const CREATION_MODES = [
  {
    id: "avatar",
    title: "AI Avatar Video",
    desc: "Create talking presenter videos with lip-sync and custom backgrounds.",
    icon: UserSquare2,
    href: "/create",
    tag: "Most Popular",
    color: "from-sky-500 to-blue-600",
    example: "Script + Avatar + Voice + Background = Professional Talking Video",
    bgImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "voice-clone",
    title: "Voice Cloning",
    desc: "Train a custom neural voice using a 60-second audio sample.",
    icon: Mic,
    href: "/voices",
    tag: "Neural TTS",
    color: "from-amber-500 to-orange-600",
    example: "Upload Audio → ElevenLabs Training → Custom Neural Voice",
    bgImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "motion-vfx",
    title: "Motion & VFX",
    desc: "Apply cinematic camera movements and visual effects without re-rendering.",
    icon: Sparkles,
    href: "/create",
    tag: "Deterministic",
    color: "from-purple-500 to-pink-600",
    example: "Avatar Video + Camera Push + Light Leaks = Cinematic Output",
    bgImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "smart-captions",
    title: "Smart Captions",
    desc: "Generate perfectly timed, kinetic typography and subtitles automatically.",
    icon: FileText,
    href: "/create",
    tag: "Auto-sync",
    color: "from-emerald-500 to-teal-600",
    example: "Audio Track → Phoneme Analysis → Kinetic Word-Pop Captions",
    bgImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80",
  },
];

export function CreationModes() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);

  const handleModeClick = (href: string) => {
    loginAsDemo();
    router.push(href);
  };

  return (
    <section id="modes" className="py-20 bg-slate-950 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <Badge variant="glow">Platform Capabilities</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Everything you need for Avatar Videos
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Vilo integrates advanced AI avatar synthesis with cinematic tools to make professional video creation effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {CREATION_MODES.map((mode, idx) => {
            const Icon = mode.icon;

            return (
              <div
                key={mode.id}
                onClick={() => handleModeClick(mode.href)}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-sky-500/50 hover:bg-slate-900/90 hover:shadow-xl hover:shadow-sky-500/10`}
              >
                {/* Background glow gradient */}
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-sky-500/10 to-indigo-500/0 blur-2xl group-hover:scale-150 transition-transform duration-500" />

                <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-sky-400 border border-slate-700/60 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="group-hover:border-sky-500/40">
                        {mode.tag}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      {mode.desc}
                    </p>

                    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs text-slate-300 font-mono">
                      <span className="text-sky-400">Flow: </span>{mode.example}
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-semibold text-sky-400 group-hover:text-sky-300 group-hover:translate-x-1 transition-all">
                    <span>Explore Feature</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
