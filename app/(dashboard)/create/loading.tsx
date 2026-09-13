import React from "react";

export default function CreateLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="border-b border-slate-800 pb-5 space-y-2">
        <div className="h-4 w-32 rounded bg-slate-800" />
        <div className="h-8 w-64 rounded bg-slate-800" />
        <div className="h-4 w-96 rounded bg-slate-800/60" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-800" />
            <div className="h-5 w-32 rounded bg-slate-800" />
            <div className="h-4 w-full rounded bg-slate-800/50" />
            <div className="h-9 w-full rounded-xl bg-slate-800/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
