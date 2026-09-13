import Link from "next/link";
import { Video, Sparkles, Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-850 bg-slate-950/90 text-slate-400">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white">
                <Video className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Vilo <span className="text-sky-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Programmatic 9:16 vertical video & reel generation powered by Remotion in pure React. Zero expensive third-party voiceover APIs.
            </p>
            <div className="flex items-center gap-4 text-slate-400 pt-2">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-white transition-colors"><Github className="h-4 w-4" /></a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>

          {/* Reel Studio */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Studio</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/create" className="hover:text-white transition-colors">Create Reel</Link></li>
              <li><Link href="/create" className="hover:text-white transition-colors">Remotion Studio</Link></li>
              <li><Link href="/#why-no-voice" className="hover:text-white transition-colors">Visual-First Reels</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/projects" className="hover:text-white transition-colors">My Projects</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Settings & Credits</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Creator Studio</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Account Settings</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Usage & Credits</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Vilo AI Platform Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> for creators & businesses worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}
