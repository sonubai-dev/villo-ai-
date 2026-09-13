"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Video, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { authService } from "@/services/auth";

export default function LoginPage() {
  const router = useRouter();
  const loginAsDemo = useAppStore((s) => s.loginAsDemo);
  const [email, setEmail] = useState("alex.rivera@vilo.ai");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isFirebaseConfigured = authService.isConfigured();

  const handleDemoLogin = () => {
    setIsLoading(true);
    loginAsDemo();
    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isFirebaseConfigured) {
        await authService.login(email, password);
      } else {
        loginAsDemo();
      }
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (isFirebaseConfigured) {
        await authService.loginWithGoogle();
      } else {
        loginAsDemo();
      }
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Google sign in failed.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-grid-pattern">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Video className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Vilo <span className="text-sky-400">AI</span>
          </span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to your studio or test drive with 1-click Demo access.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Quick 1-Click Demo Login Banner */}
          <div className="rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent p-4 text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">Instant Demo Access</span>
            </div>
            <p className="text-xs text-slate-300 mb-3">
              Explore all 5 video modes, editor, and render pipelines instantly without needing an account.
            </p>
            <Button
              onClick={handleDemoLogin}
              variant="glow"
              size="md"
              className="w-full font-semibold flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Sparkles className="h-4 w-4" />
              <span>{isLoading ? "Signing in..." : "Continue as Demo User"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
              Or email sign in
            </span>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-sky-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="secondary" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? "Authenticating..." : "Sign In with Email"}
            </Button>

            {isFirebaseConfigured && (
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full font-semibold text-xs border-slate-800 hover:bg-slate-800"
                disabled={isLoading}
              >
                Sign In with Google
              </Button>
            )}
          </form>

          <p className="text-center text-xs text-slate-400">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-sky-400 font-semibold hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
