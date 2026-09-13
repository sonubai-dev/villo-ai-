"use client";

import Link from "next/link";
import { Sparkles, Video, ArrowRight } from "lucide-react";
import { Button } from "@/lib/../components/ui/button";
import { useAppStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export function Navbar() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);

  const handleDemoAccess = () => {
    loginAsDemo();
    router.push("/dashboard");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Vilo <span className="text-sky-400 font-semibold">AI</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#modes" className="hover:text-white transition-colors">
            Creation Modes
          </Link>
          <Link href="/#avatars" className="hover:text-white transition-colors">
            AI Avatars
          </Link>
          <Link href="/#usecases" className="hover:text-white transition-colors">
            Use Cases
          </Link>
          <Link href="/#how-it-works" className="hover:text-white transition-colors">
            How It Works
          </Link>
          <Link href="/#pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-slate-300 hover:text-white px-3 py-2">
            Sign In
          </Link>
          <Button
            onClick={handleDemoAccess}
            variant="glow"
            size="sm"
            className="flex items-center gap-1.5"
          >
            <Sparkles className="h-4 w-4" />
            <span>Launch App</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
