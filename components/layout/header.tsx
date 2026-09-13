"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Bell, 
  Plus, 
  Zap, 
  Menu, 
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export function Header() {
  const router = useRouter();
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
          <span>85 Credits</span>
        </Link>

        {/* Notifications Icon */}
        <button
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

        {/* User Avatar Menu via Clerk */}
        <div className="ml-1 pl-2">
          <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-9 w-9" } }} />
        </div>
      </div>
    </header>
  );
}
