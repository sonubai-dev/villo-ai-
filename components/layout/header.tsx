"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  Plus, 
  Zap, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  Menu, 
  X,
  Layers,
  Settings
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { authService } from "@/services/auth";

export function Header() {
  const router = useRouter();
  const { user, logout, loginAsDemo } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/projects?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 backdrop-blur-xl">
      {/* Left Search / Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white lg:hidden"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-72 md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects, templates, avatars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-9 pr-4 text-xs text-slate-200 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
          />
        </form>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Credits Badge */}
        <Link
          href="/settings"
          className="flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400 hover:bg-sky-500/20 transition-colors"
        >
          <Zap className="h-3.5 w-3.5 fill-sky-400 text-sky-400" />
          <span>{user?.credits ?? 85} Credits</span>
        </Link>

        {/* Notifications Icon */}
        <button
          onClick={() => setShowNotifications(true)}
          className="relative rounded-xl p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-sky-400 ring-2 ring-slate-950" />
        </button>

        {/* Create Video Fast Action */}
        <Link href="/create">
          <Button size="sm" variant="glow" className="hidden sm:inline-flex gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Create Video</span>
          </Button>
        </Link>

        {/* User Avatar Menu */}
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-full border border-slate-800 p-0.5 hover:border-slate-700 transition-colors">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                alt={user?.name || "User"}
                className="h-8 w-8 rounded-full object-cover"
              />
            </button>
          }
        >
          <div className="px-3 py-2 border-b border-slate-850">
            <p className="text-xs font-semibold text-white">{user?.name || "Demo Creator"}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || "alex.rivera@vilo.ai"}</p>
          </div>

          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <Layers className="h-4 w-4 text-slate-400" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/projects")}>
            <Layers className="h-4 w-4 text-slate-400" />
            <span>My Projects</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/avatars")}>
            <UserIcon className="h-4 w-4 text-slate-400" />
            <span>Avatar Library</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Settings & Credits</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            destructive
            onClick={async () => {
              await authService.signOut();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      {/* Notifications Modal */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-sky-400" />
            <span>Notifications</span>
          </DialogTitle>
          <DialogDescription>
            Recent system updates and video rendering notifications
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-sky-400 font-semibold mb-1">
              <span>Rendering Finished</span>
              <span className="text-slate-500 font-normal">10m ago</span>
            </div>
            <p className="text-sm text-slate-200">
              Your video <strong>&quot;Luxury Horizon Penthouse Tour&quot;</strong> is ready for export in 1080p.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
            <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold mb-1">
              <span>Welcome Bonus</span>
              <span className="text-slate-500 font-normal">1h ago</span>
            </div>
            <p className="text-sm text-slate-200">
              85 free demo credits were added to your workspace. Start creating!
            </p>
          </div>
        </div>
      </Dialog>
    </header>
  );
}
