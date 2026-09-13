import React from "react";
import { 
  Building2, 
  TrendingUp, 
  GraduationCap, 
  Briefcase, 
  Share2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const USE_CASES = [
  {
    title: "Real Estate & Architecture",
    desc: "Generate cinematic luxury property tours with AI estate agents from floorplans and interior photos.",
    icon: Building2,
    stats: "3x More Inquiries",
    color: "from-sky-500/20 to-blue-500/0",
  },
  {
    title: "Marketing & Growth",
    desc: "Turn product screenshots and release notes into engaging promo reels without renting studio equipment.",
    icon: TrendingUp,
    stats: "10x Production Speed",
    color: "from-indigo-500/20 to-purple-500/0",
  },
  {
    title: "Educators & Courses",
    desc: "Transform lecture slides and PDFs into interactive curriculum modules with dedicated teaching avatars.",
    icon: GraduationCap,
    stats: "85% Student Retention",
    color: "from-purple-500/20 to-pink-500/0",
  },
  {
    title: "B2B Sales & Pitches",
    desc: "Create personalized video proposals for enterprise prospects that explain ROI in under 60 seconds.",
    icon: Briefcase,
    stats: "45% Higher Reply Rate",
    color: "from-emerald-500/20 to-teal-500/0",
  },
  {
    title: "Social Media Creators",
    desc: "Publish daily viral Shorts, Reels, and TikToks with dynamic captions and animated talking heads.",
    icon: Share2,
    stats: "5M+ Social Views",
    color: "from-amber-500/20 to-orange-500/0",
  },
  {
    title: "Corporate & Compliance Training",
    desc: "Maintain up-to-date employee onboarding and security protocols in multiple regional languages.",
    icon: ShieldCheck,
    stats: "90% Lower Video Costs",
    color: "from-rose-500/20 to-red-500/0",
  },
];

export function UseCases() {
  return (
    <section id="usecases" className="py-20 bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <Badge variant="glow">Built for Modern Teams</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored for every visual industry
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            From high-growth SaaS startups to real estate firms and educators, Vilo accelerates video communication.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {USE_CASES.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all duration-300 hover:border-slate-700 hover:bg-slate-900/90"
              >
                <div className={`absolute top-0 right-0 h-32 w-32 rounded-bl-full bg-gradient-to-bl ${uc.color} pointer-events-none`} />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-sky-400 border border-slate-700/60 group-hover:scale-110 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="font-semibold text-[11px]">
                      {uc.stats}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">{uc.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{uc.desc}</p>
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
