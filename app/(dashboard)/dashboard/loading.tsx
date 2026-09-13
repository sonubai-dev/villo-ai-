import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Hero Banner Skeleton */}
      <div className="h-44 w-full rounded-3xl border border-slate-800 bg-slate-900/60 p-8" />

      {/* Quick Launch Cards Skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-40 rounded bg-slate-800" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-2xl border border-slate-800 bg-slate-900/50 p-4" />
          ))}
        </div>
      </div>

      {/* Recent Projects Grid Skeleton */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-5 w-32 rounded bg-slate-800" />
          <div className="h-4 w-16 rounded bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
              <div className="aspect-video w-full rounded-xl bg-slate-800/60" />
              <div className="h-4 w-2/3 rounded bg-slate-800/60" />
              <div className="h-3 w-1/3 rounded bg-slate-800/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
