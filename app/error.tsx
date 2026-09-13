"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Vilo Production Error Boundary]:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
      <div className="space-y-6 max-w-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="text-sm text-slate-400">
            An unexpected error occurred in the video rendering pipeline or studio session.
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-400 bg-slate-900 py-1 px-2 rounded">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button variant="glow" onClick={() => reset()} className="w-full sm:w-auto gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full gap-2">
              <Home className="h-4 w-4" />
              <span>Studio Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
