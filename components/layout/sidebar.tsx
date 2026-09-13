"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  PlusCircle, 
  FolderKanban, 
  FolderOpen,
  LayoutTemplate, 
  Users, 
  Mic, 
  Palette, 
  Settings, 
  Sparkles, 
  Zap,
  Video,
  ChevronRight,
  User as UserIcon,
  Flame,
  Film,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Video", href: "/create", icon: PlusCircle, highlight: true },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Avatars", href: "/avatars", icon: Users },
  { label: "Voices", href: "/voices", icon: Mic },
  { label: "Templates", href: "/templates", icon: LayoutTemplate },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);

  return (
    <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-slate-800/80 bg-slate-950/90 backdrop-blur-xl lg:flex">
      {/* Brand logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1">
              Vilo <span className="text-sky-400 font-semibold">AI</span>
            </span>
          </div>
        </Link>
        <Badge variant="glow" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2">
          Avatar Studio
        </Badge>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Studio Navigation
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 font-semibold shadow-sm shadow-sky-500/10"
                  : item.highlight
                  ? "bg-gradient-to-r from-sky-500/10 to-indigo-500/10 text-sky-300 hover:bg-sky-500/20 border border-sky-500/20"
                  : "text-slate-400 hover:bg-slate-900/80 hover:text-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-sky-400" : "text-slate-400 group-hover:text-slate-200")} />
                <span>{item.label}</span>
              </div>
              {item.highlight && !isActive && (
                <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
              )}
              {isActive && (
                <ChevronRight className="h-4 w-4 text-sky-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Credit & Upgrade Card */}
      <div className="p-4 border-t border-slate-850">
        <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-b from-sky-950/40 to-slate-900/60 p-3.5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Credits Balance</span>
            </span>
            <span className="text-xs font-bold text-sky-400">{user?.credits ?? 85} / 100</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden mb-2.5">
            <div
              className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (user?.credits ?? 85))}%` }}
            />
          </div>

          <p className="text-[10px] text-slate-400 leading-tight mb-2.5">
            10 credits used per video render. Refills monthly.
          </p>

          <Link
            href="/pricing"
            className="flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-800 hover:bg-slate-700 py-1.5 px-3 text-xs font-medium text-slate-200 transition-colors border border-slate-700/60"
          >
            <span>Upgrade Plan</span>
            <Sparkles className="h-3 w-3 text-sky-400" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
